import { Router } from "express";
import { registerUser } from "../Controllers/user.controller.js";

// creating a router service via express: method of express for routing
const router = Router();

// making a path that is directed to the actual controller

router.route("/register").post(registerUser);

export default router;
