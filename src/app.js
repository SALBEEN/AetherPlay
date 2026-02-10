import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true,
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

//importing a routing environment

import userRouter from "./Routes/user.routes.js";

// if any url starts with users that is direct the floe te userRouter file

app.use("/api/v1/users", userRouter);

export { app };
