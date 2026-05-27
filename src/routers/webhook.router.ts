import { Router } from "express";

import { webhookHandler } from "../controllers/webhook.controller";

const router: Router = Router()

router.post('/:event_type', webhookHandler)

export default router