import { Router } from "express";
import {
  registerUser,
  logInUser,
  logOutUser,
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
router.route("/login").post(verifyJWT, logOutUser);

export default router;
