import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const user = req.user._id;

  if (!user) {
    throw new ApiError("Cannot get user id");
  }

  if (!mongoose.Types.ObjectId.isValid(user)) {
    throw new ApiError("User doesnot exists");
  }

  if (!videoId) {
    throw new ApiError("Cannot get video id");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError("video doesn't exists");
  }
  //TODO: toggle like on video

  const isAlreadyLiked = await Like.findById({
    video: videoId,
    likedBy: user,
  });

  if (isAlreadyLiked) {
    await Like.deleteOne({
      video: videoId,
      likedBy: user,
    });
  } else {
    Like.createOne({
      video: videoId,
      likedBy: user,
    });
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const user = req.user._id;

  if (!user) {
    throw new ApiError("Cannot get user id");
  }

  if (!mongoose.Types.ObjectId.isValid(user)) {
    throw new ApiError("User doesnot exists");
  }
  //TODO: toggle like on comment
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const user = req.user._id;

  if (!user) {
    throw new ApiError("Cannot get user id");
  }

  if (!mongoose.Types.ObjectId.isValid(user)) {
    throw new ApiError("User doesnot exists");
  }
  //TODO: toggle like on tweet
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos

  const user = req.user._id;

  if (!user) {
    throw new ApiError("Cannot get user id");
  }

  if (!mongoose.Types.ObjectId.isValid(user)) {
    throw new ApiError("User doesnot exists");
  }
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
