import { Router } from "express";
import { registerUser } from "../Controllers/user.controller.js";
import { upload } from "../Middlewares/multer.middleware.js";

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

export default router;
