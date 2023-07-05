import express from "express"

import {
  onAddressUpdated,
  getTranscodeWebhook,
  createTranscodeWebhook,
  deleteTranscodeWebhook,
  onTranscodingFinished,
  onFilesDeleted,
} from "./controllers"
import {
  validateCloudflareSignature,
  validateUploadSignature,
} from "./middlewares"

export const router = express.Router()

router.post("/address-updated", onAddressUpdated)
router.get("/cloudflare", getTranscodeWebhook)
router.post("/cloudflare", createTranscodeWebhook)
router.delete("/cloudflare", deleteTranscodeWebhook)
router.post(
  "/cloudflare/finished",
  validateCloudflareSignature,
  onTranscodingFinished
)
// A route to delete a publish when its video/image is deleted from cloud storage
router.delete("/publishes/:publishId", validateUploadSignature, onFilesDeleted)
