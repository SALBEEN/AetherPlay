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

// controller for user password change

const changeUserPassword = asyncHandler(async (req, res) => {
  // take the required field from frontend

  const { oldPassword, newPassword, newConfirmPassword } = req.body;

  // handling the data and verifing

  if (!(newPassword === newConfirmPassword)) {
    throw new ApiError(500, "Password doesnot match");
  }

  const user = await User.findById(req?.user._id);

  // as we have schema as "User" but after finding user then all method are accessible
  // through "user"

  const isPassMatched = await user.isPasswordCorrect(oldPassword);

  if (!isPassMatched) {
    throw new ApiError(
      500,
      "Password doesnot match. Enter correct old password",
    );
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: "false" });

  return res.status(200).json(200, {}, "Password changes successfully");
});

// get current user

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "Current user fetched successfully");
});

// update fields in frontend like fullName, email, profile pic etc.

const updateAccountDetails = asyncHandler(async (req, res) => {
  // take the fields that are to be changed

  const { fullName, email } = req.body;

  if (!(fullName && email)) {
    throw new ApiError(501, "Cannot get the required field");
  }

  const user = await User.findByIdAndUpdate(
    req?.user._id,
    {
      fullName: fullName,
      email: email,
    },
    // it allow to return data that are just updated
    { new: true },
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: user },
        "Change have been updated successfully",
      ),
    );
});

// updating avatar

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = res.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Error while getting avatar local paths");
  }

  // after uploading on cloudinary it return a whole object and we have to
  // pick url from it and update to our database
  const avatar = await uploadFileCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(
      400,
      "Error while getting response after cloudinary uplaod -- cloudinary upload may fail",
    );
  }

  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar?.url,
      },
    },
    { new: true },
  ).select("-password");

  if (!user) {
    throw new ApiError(400, "Error while updating avatar in database");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        data: user,
      },
      "Avatar updated successfully",
    ),
  );
});

// updating coverImage

const updateCoverImage = asyncHandler(async (req, res) => {
  // we get file in request by the help of multer middleware
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, " unable to get cover image path");
  }

  // upload cover image in cloudinary

  const coverImage = await uploadFileCloudinary(coverImageLocalPath);

  if (!coverImage) {
    throw new ApiError(400, "Error while uplaoding file in cloudinary");
  }

  User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage?.url,
      },
    },
    { new: true },
  );
});

const userChannelProfileDetails = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username) {
    throw new ApiError(500, "Username not found");
  }

  const channel = User.aggregate([
    {
      // helps to match the database docs with given value for matching
      $match: {
        username: username?.toLowerCase(),
      },
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: $subscribers,
        },
        channelSubscribedCount: {
          $size: $subscribedTo,
        },
      },
    },
  ]);
});

// exporting methods
export {
  registerUser,
  logInUser,
  logOutUser,
  changeUserPassword,
  getCurrentUser,
  updateAccountDetails,
  generateAccessAndRefreshToken,
  updateUserAvatar,
  updateCoverImage,
  userChannelProfileDetails,
};
