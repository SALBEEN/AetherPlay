import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../Controllers/subscription.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
  .route("/c/:subscriberId")
  .get(getSubscribedChannels)
  .post(toggleSubscription);

router.route("/u/:channelId").get(getUserChannelSubscribers);

export default router;
