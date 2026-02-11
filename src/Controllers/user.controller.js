import { asyncHandler } from "../Utils/AsyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { User } from "../Models/user.models.js";
import { upload } from "../Middlewares/multer.middleware.js";
import { uploadFileCloudinary } from "../Utils/cloudinary.js";
export { ApiResponse } from "../Utils/ApiResponse.js";

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

  //if we have to haldle files use use multer as we have inserted as middleware
  // express gaves us default .body so as that multer gave as .files

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar Image Required");
  }

  // uploading files on cloudinary and it returns us response
  const avatar = await uploadFileCloudinary(avatarLocalPath);
  console.log("reference of file", avatar);

  // uploading files on cloudinary and it returns us response

  const coverImage = await uploadFileCloudinary(avatarLocalPath);
  console.log("reference of file", coverImage);

  if (!avatar) {
    throw new ApiError(
      409,
      "Error occured while uploading avatr in cloudinary",
    );
  }

  if (!coverImage) {
    throw new ApiError(
      409,
      "Error occured while uploading cover Image in cloudinary",
    );
  }

  //uplaoding data from frontend to our data base

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
});

const createdUser = await User.findById(user._id).select(
  "-password -refreshToken",
);

if (!createdUser) {
  throw new error(500, "Something gone wrong while registering process. ");
}
//sending response to api for frontend after all operation is set
// ApiResponse(200, "Registration process success :) "); --> wrong method

  return res.status(201).json(
    new ApiResponse(201,"Registration process success :)  )
  )




// exporting methods
export { registerUser };
