import express from "express"

import {
  onAddressUpdated,
  getTranscodeWebhook,
  createTranscodeWebhook,
  deleteTranscodeWebhook,
  onTranscodingFinished,
  // onUploadStarted,
} from "./controllers"
import { validateSignature } from "./middlewares"

export const router = express.Router()

router.post("/address-updated", onAddressUpdated)
router.get("/cloudflare", getTranscodeWebhook)
router.post("/cloudflare", createTranscodeWebhook)
router.delete("/cloudflare", deleteTranscodeWebhook)
router.post("/cloudflare/finished", validateSignature, onTranscodingFinished)
