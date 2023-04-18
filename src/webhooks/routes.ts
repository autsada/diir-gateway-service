import express from "express"

import { onAddressUpdated } from "./controllers"

export const router = express.Router()

router.post("/address-updated", onAddressUpdated)
// router.post("/playback", onPlaybackCreated)
