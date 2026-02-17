import { asyncHandler } from "../Utils/AsyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { User } from "../Models/user.models.js";
import { uploadFileCloudinary } from "../Utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../Utils/ApiResponse.js";

/*
Dependies Methods
*/

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found when generating tokens");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    // persist the refresh token
    await user.save({ validateBeforeSave: true });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something gone wrong when generating access and refresh token",
    );
  }
};

// ===================================================================================================================

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

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "Username or email already exists. Try another!");
  }

  //if we have to haldle files use use multer as we have inserted as middleware
  // express gaves us default .body so as that multer gave as .files

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    res.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar Image Required");
  }

  // if (!coverImageLocalPath) {
  //   throw new ApiError(400, "Avatar Image Required");
  // }

  // uploading files on cloudinary and it returns us response
  const avatar = await uploadFileCloudinary(avatarLocalPath);
  console.log("reference of file", avatar);

  // uploading files on cloudinary and it returns us response

  const coverImage = await uploadFileCloudinary(coverImageLocalPath);
  console.log("reference of file", coverImage);

  if (!avatar) {
    throw new ApiError(
      409,
      "Error occured while uploading avatr in cloudinary",
    );
  }
  //
  // if (!coverImage) {
  //   throw new ApiError(
  //     409,
  //     "Error occured while uploading cover Image in cloudinary",
  //   );
  // }

  //uplaoding data from frontend to our data base

  const user = await User.create({
    fullName,
    avatar: avatar.url || "",
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username,
  });
  //

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new error(500, "Something gone wrong while registering process. ");
  }
  //sending response to api for frontend after all operation is set
  // ApiResponse(200, "Registration process success :) "); --> wrong method

  return res
    .status(201)
    .json(new ApiResponse(201, "Registration process success :) "));
});

// ===================================================================================================================

// todo
/* 
1. get data from user 
2. check if user exist by username or email
3. validate user password
4. generate access token and refresh token
5. send tokens in cookie after login is successfull
6. send message to the frontend "User login successfull"

*/
const logInUser = asyncHandler(async (req, res) => {
  // get data from user
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(401, "Username or email are required !");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User doesnot exists");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(404, "User credentials doesnot match");
  }

  //generating access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  //cookies options

  const option = {
    httpOnly: true,
    secure: true,
  };

  /* 
  Updating the user refresh token -> how?
  ---> when a user made a request u access their cookie and fetch 
  the refresh token from there ( As they are already expired ).
  The expired refresh token still are in our Db and users cookie.
  so, whenever user made a request we compare the tokend and create
  a new token and store it in both cookie and our Db.
  */

  const RefreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
      req.cookie?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(400, "Unable to retrive token from user cookie");
    }

    // const user = req.user._id;
    // const tokenMatched = user.refreshToken == incomingRefreshToken;

    // if (!tokenMatched) {
    //   throw new ApiError(400, "Unauthorized user token");
    // }

    try {
      //verifying token

      const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET,
      );

      const user = await User.findById(decodedToken._id);

      if (!user) {
        throw new ApiError(401, "User missing");
      }

      const isTokenMatch = incomingRefreshToken === user?.refreshToken;

      if (!isTokenMatch) {
        throw new ApiError(401, "Token doesnot match");
      }

      //cookies options

      const option = {
        httpOnly: true,
        secure: true,
      };

      const { accessToken, newRefreshToken } =
        await generateAccessAndRefreshToken(user?._id);

      if (!(accessToken && newRefreshToken)) {
        throw new ApiError(401, "Cannot generate new token");
      }

      res
        .status(200)
        .cookie("accesstoken", accessToken, option)
        .cookie("refreshToken", newRefreshToken, option)
        .json(
          new ApiResponse(
            200,
            { accessToken, refreshToken },
            "Access Token Refreshed",
          ),
        );
    } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh Token");
    }
  });

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User login successfully",
      ),
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    throw new ApiError(401, "Not authenticated");
  }

  const userId = req.user._id;

  // Use $unset to remove the refreshToken field (setting to undefined in an update
  // may be ignored). Await the update so we know it completed.
  await User.findByIdAndUpdate(
    userId,
    { $unset: { refreshToken: "" } },
    { new: true },
  );

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, {}, "user logged out successfully"));
});

// exporting methods
export { registerUser, logInUser, logOutUser };
