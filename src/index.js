// require("dotenv").config({ path: "./env" });

import dotenv from "dotenv";
// import express from "express";
import connectDB from "./DB/index.js";

dotenv.config({ path: "./env" });

import { app } from "./app.js";

app.get("/salben", () => {
  console.log("Its Aether play Backend server");
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`App is running in : ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Data base connection Failed!!!!!!");
  });

// app.listen(process.env.PORT, () => {
//   console.log(`App listening on ${process.env.PORT}`);
// });
