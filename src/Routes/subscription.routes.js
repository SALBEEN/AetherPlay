import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../Controllers/subscription.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

// Fix: changed :subscriberId to :channelId to match controller
router
  .route("/c/:channelId")
  .get(getSubscribedChannels)
  .post(toggleSubscription);

router.route("/u/:channelId").get(getUserChannelSubscribers);

export default router;
