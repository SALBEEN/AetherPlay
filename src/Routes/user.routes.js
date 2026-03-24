import { Router } from "express";
import {
  registerUser,
  logInUser,
  logOutUser,
  changeUserPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateCoverImage,
  userChannelProfileDetails,
  getWatchHistory,
  addToWatchHistory,
} from "../Controllers/user.controller.js";
import { upload } from "../Middlewares/multer.middleware.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";

// creating a router service via express: method of express for routing
const router = Router();

// making a path that is directed to the actual controller

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser,
);

//secure rooute
router.route("/login").post(logInUser);
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/refresh-token").post(logOutUser);

router.route("/change-password").post(verifyJWT, changeUserPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);

router.route("/c/:username").get(verifyJWT, userChannelProfileDetails);
router.route("/history").get(verifyJWT, getWatchHistory);
router.route("/history/:videoId").patch(verifyJWT, addToWatchHistory);

export default router;
