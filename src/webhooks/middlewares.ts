import type { Request, Response, NextFunction } from "express"
import crypto from "crypto"

import { isWebhookRequestAuthorized } from "../lib"

const { CLOUDFLARE_WEBHOOK_SIGNING_KEY } = process.env

export async function validateSignature(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const headers = req.headers
    const signatureHeader = headers["webhook-signature"] as string
    const signatures = signatureHeader.split(",")
    const timestamp = signatures[0].split("=")[1]
    const signature = signatures[1].split("=")[1]

    // If the call is older than 1 hour then ignore it
    if (Date.now() / 1000 - Number(timestamp) > 60 * 60) {
      res.status(403).send("Signature expired")
    } else {
      // Get raw body from req
      const rawBody = req.rawBody
      // Construct a signature source string.
      const signatureSourceString = `${timestamp}.${rawBody}`

      const hmac = crypto.createHmac(
        "sha256",
        CLOUDFLARE_WEBHOOK_SIGNING_KEY || ""
      )
      hmac.update(signatureSourceString, "utf-8")
      const digest = hmac.digest("hex")

      req.isWebhookSignatureValid = signature === digest
      next()
    }
  } catch (error) {
    res.status(500).end()
  }
}

export async function validateAuthToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authorization = req.headers["authorization"]
    const authToken = authorization?.split(" ")[1]

    if (!isWebhookRequestAuthorized(authToken || "")) {
      res.status(500).end()
    } else {
      next()
    }
  } catch (error) {
    res.status(500).end()
  }
}
