import type { Request, Response } from "express"
import axios from "axios"

import { prisma } from "../client"
import { isValidAchemySignature } from "../lib"

const {
  CLOUDFLAR_BASE_URL,
  CLOUDFLAR_API_TOKEN,
  CLOUDFLAR_ACCOUNT_ID,
  WALLET_SERVICE_URL,
} = process.env

/**
 * This route will be called by Alchemy to notify when there is any activity occurred on an address
 *
 */
export async function onAddressUpdated(req: Request, res: Response) {
  try {
    // Get signature from headers
    const signature = req.headers["x-alchemy-signature"]
    // Get raw body from req
    const rawBody = req.rawBody
    if (!signature || !rawBody) throw new Error("Invalid request")
    // Validate signature
    const isValid = isValidAchemySignature(rawBody, signature as string)
    if (!isValid) throw new Error("Request corrupted in transit.")
    const body = req.body

    // TODO: Notify the frontends

    //   // Get token for GCP to authenticate between services (for staging and production environments).
    //   const token = await authClient.getIdToken()
    //   // Call the update activity route in kms server to update `activities` collection in Firestore.
    //   await axios({
    //     url: `${kmsBaseUrl}/activities/update`,
    //     headers: {
    //       "x-access-key": KMS_ACCESS_KEY!,
    //       Authorization: token || "",
    //     },
    //     method: "POST",
    //     data: body,
    //   })

    res.status(200).end()
  } catch (error) {
    res.status(500).end()
  }
}

export async function getTranscodeWebhook(req: Request, res: Response) {
  try {
    const response = await axios({
      method: "GET",
      url: `${CLOUDFLAR_BASE_URL}/${CLOUDFLAR_ACCOUNT_ID}/stream/webhook`,
      headers: {
        Authorization: `Bearer ${CLOUDFLAR_API_TOKEN}`,
      },
    })

    res
      .status(200)
      .json({ result: response.data.result, success: response.data.success })
  } catch (error) {
    res.status(500).end()
  }
}

/**
 * TODO: add authorization for the admin user only.
 */
export async function createTranscodeWebhook(req: Request, res: Response) {
  try {
    const { webhookURL } = req.body as { webhookURL: string }
    if (!webhookURL) {
      res.status(400).send("Bad Request")
    } else {
      const response = await axios({
        method: "PUT",
        url: `${CLOUDFLAR_BASE_URL}/${CLOUDFLAR_ACCOUNT_ID}/stream/webhook`,
        headers: {
          Authorization: `Bearer ${CLOUDFLAR_API_TOKEN}`,
        },
        data: {
          notificationUrl: webhookURL,
        },
      })

      res
        .status(200)
        .json({ result: response.data.result, success: response.data.success })
    }
  } catch (error) {
    res.status(500).end()
  }
}

/**
 * TODO: add authorization for the admin user only.
 */
export async function deleteTranscodeWebhook(req: Request, res: Response) {
  try {
    await axios({
      method: "DELETE",
      url: `${CLOUDFLAR_BASE_URL}/${CLOUDFLAR_ACCOUNT_ID}/stream/webhook`,
      headers: {
        Authorization: `Bearer ${CLOUDFLAR_API_TOKEN}`,
      },
    })

    res.status(200).json({ status: "Ok" })
  } catch (error) {
    res.status(500).end()
  }
}

export async function onTranscodingFinished(req: Request, res: Response) {
  let publishId = ""

  try {
    if (!req.isWebhookSignatureValid) {
      res.status(403).send("Forbidden")
    } else {
      const body = req.body

      // `readyToStream` is a boolean that indicate if the playback urls are ready.
      if (body.readyToStream) {
        const contentPath = body.meta?.path as string
        publishId = contentPath.split("/")[2]

        // Create (if not exist) or update (if exists) a playback in the database.
        const playback = await prisma.playbackLink.findUnique({
          where: {
            publishId,
          },
        })

        if (!playback) {
          await prisma.playbackLink.create({
            data: {
              thumbnail: body.thumbnail,
              preview: body.preview,
              duration: body.duration,
              hls: body.playback?.hls,
              dash: body.playback?.dash,
              publishId,
              videoId: body.uid,
            },
          })
        } else {
          await prisma.playbackLink.update({
            where: {
              publishId,
            },
            data: {
              thumbnail: body.thumbnail,
              preview: body.preview,
              duration: body.duration,
              hls: body.playback?.hls,
              dash: body.playback?.dash,
            },
          })
        }

        // Update uploading status on the publish
        const publish = await prisma.publish.findUnique({
          where: {
            id: publishId,
          },
        })

        // We shoud find the publish as it will be created as the first step in upload process
        if (publish) {
          await prisma.publish.update({
            where: {
              id: publishId,
            },
            data: {
              uploadError: false,
              uploading: false,
              transcodeError: false,
              thumbSource: !publish.thumbSource
                ? "generated"
                : publish.thumbSource,
              contentURI: body.meta?.contentURI,
              contentRef: body.meta?.contentRef,
              kind: body.duration <= 60 ? "Short" : publish.kind,
            },
          })
        }
      }

      // Call a route `onUploadFinished` in the Wallet Service
      // This will let the frontends know the process is done so they can update their UIs
      const url = WALLET_SERVICE_URL
        ? `${WALLET_SERVICE_URL}/upload/finished`
        : "http://localhost:8000/upload/finished"
      await axios({
        method: "POST",
        url: url,
        data: {
          publishId,
        },
      })

      res.status(200).end()
    }
  } catch (error) {
    // In case of an error occurred, we have to update the publish so the publish owner will know
    const publish = await prisma.publish.findUnique({
      where: {
        id: publishId,
      },
    })
    if (publish) {
      await prisma.publish.update({
        where: {
          id: publish.id,
        },
        data: {
          transcodeError: true,
          uploading: false,
        },
      })
    }

    res.status(500).end()
  }
}

/**
 * This route will be called from the Upload Service when a publish's files were deleted from cloud storage
 */
export async function onFilesDeleted(req: Request, res: Response) {
  try {
    const { publishId } = req.params as { publishId: string }
    if (!publishId) {
      res.status(500).end()
    } else {
      await prisma.publish.delete({
        where: {
          id: publishId,
        },
      })

      // Call a route `onUploadFinished` in the Wallet Service
      // This will let the frontends know the process is done so they can update their UIs
      const url = WALLET_SERVICE_URL
        ? `${WALLET_SERVICE_URL}/upload/finished`
        : "http://localhost:8000/upload/finished"
      await axios({
        method: "POST",
        url: url,
        data: {
          publishId,
        },
      })

      res.status(200).end()
    }
  } catch (error) {
    res.status(500).end()
  }
}
