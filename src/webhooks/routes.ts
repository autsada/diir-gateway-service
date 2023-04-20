import express from "express"

import {
  onAddressUpdated,
  getTranscodeWebhook,
  createTranscodeWebhook,
  deleteTranscodeWebhook,
  onTranscodingFinished,
  onUploadFinished,
  onUploadStarted,
} from "./controllers"
import { validateAuthToken, validateSignature } from "./middlewares"

export const router = express.Router()

router.post("/address-updated", onAddressUpdated)
router.get("/alchemy", getTranscodeWebhook)
router.post("/alchemy", createTranscodeWebhook)
router.delete("/alchemy", deleteTranscodeWebhook)
router.post("/alchemy/finished", validateSignature, onTranscodingFinished)
router.post("/upload/finished", validateAuthToken, onUploadFinished)
router.post("/upload/started", validateAuthToken, onUploadStarted)
// router.post("/playback", onPlaybackCreated)
