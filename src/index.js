// require("dotenv").config({ path: "./env" });

import dotenv from "dotenv";
import express from "express";
import connectDB from "./DB/index.js";

dotenv.config({ path: "./env" });

const app = express();
/*
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", (error) => {
      console.log("ERRR: ", error);
    });
  } catch (error) {
    console.log("Errr: ", error);
  }

  app.listen(process.env.PORT, () => {
    console.log(`App listening on ${process.env.PORT}`);
  });
})();
*/

connectDB();

app.listen(process.env.PORT, () => {
  console.log(`App listening on ${process.env.PORT}`);
});
