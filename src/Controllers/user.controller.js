import { asyncHandler } from "../Utils/AsyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { User } from "../Models/user.models.js";
import { use } from "react";

// controller for register

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  const { username, email, fullName, password } = req.body;

  // both the option of validation is used first one is for begineer and second is a pro way

  // if (fullName === "") {
  //   throw new ApiError(409, "This field is required");
  // }
  // if (username === "") {
  //   throw new ApiError(409, "This field is required");
  // }
  // if (email === "") {
  //   throw new ApiError(409, "This field is required");
  // }
  // if (password.trim().length > 7 || password.trim() === "") {
  //   throw new ApiError(409, "This field is required");
  // }

  if (
    [username, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(409, "All the field is required");
  }

  //check if username and email already exists

  // const existedUser = User.findOne({username, email}); -> it is used when use have to validae fields individually

  // to validate multiple field at one gooooo

  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "Username or email already exists. Try another!");
  }
});

// exporting methods
export { registerUser };
