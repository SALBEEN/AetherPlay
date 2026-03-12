import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../Models/like.model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const user = req.user._id;

  if (!user) {
    throw new ApiError(401, "Cannot get user id");
  }

  if (!mongoose.Types.ObjectId.isValid(user)) {
    throw new ApiError(401, "User doesnot exists");
  }

  if (!videoId) {
    throw new ApiError(401, "Cannot get video id");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(401, "video doesn't exists");
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

  res.status(200).json(new ApiResponse(200, {}, "Like togglled successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const user = req.user._id;

  if (!user) {
    throw new ApiError(401, "Cannot get user id");
  }

  if (!mongoose.Types.ObjectId.isValid(user)) {
    throw new ApiError(401, "User doesnot exists");
  }

  if (!commentId) {
    throw new ApiError(401, "Cannot get video id");
  }

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(401, "video doesn't exists");
  }
  //TODO: toggle like on video

  const isAlreadyLiked = await Like.findById({
    video: commentId,
    likedBy: user,
  });

  if (isAlreadyLiked) {
    await Like.deleteOne({
      video: commentId,
      likedBy: user,
    });
  } else {
    Like.createOne({
      video: commentId,
      likedBy: user,
    });
  }

  res.status(200).json(new ApiResponse(200, {}, "Like togglled successfully"));
  //TODO: toggle like on comment
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const user = req.user._id;

  if (!user) {
    throw new ApiError(401, "Cannot get user id");
  }

  if (!mongoose.Types.ObjectId.isValid(user)) {
    throw new ApiError(401, "User doesnot exists");
  }

  if (!tweetId) {
    throw new ApiError(401, "Cannot get video id");
  }

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(401, "video doesn't exists");
  }
  //TODO: toggle like on video

  const isAlreadyLiked = await Like.findById({
    video: tweetId,
    likedBy: user,
  });

  if (isAlreadyLiked) {
    await Like.deleteOne({
      video: tweetId,
      likedBy: user,
    });
  } else {
    Like.createOne({
      video: tweetId,
      likedBy: user,
    });
  }

  res.status(200).json(new ApiResponse(200, {}, "Like togglled successfully"));
  //TODO: toggle like on tweet
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos

  const user = req.user._id;

  if (!user) {
    throw new ApiError(401, "Cannot get user id");
  }

  if (!mongoose.Types.ObjectId.isValid(user)) {
    throw new ApiError(401, "User doesnot exists");
  }

  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: mongoose.Types.ObjectId(user),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoInfo",
      },
    },
    {
      $unwind: {
        path: "$videoInfo",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "$videoInfo.owner",
        foreignField: "_id",
        as: "ownerInfo",
      },
    },
    {
      $unwind: {
        path: "$videoInfo",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $project: {
        _id: "$videoInfo._id",
        title: "$videoInfo.title",
        description: "$videoInfo.description",
        videoFile: "$videoInfo.videoFile",
        thumbnail: "$videoInfo.thumbnail",
        duration: "$videoInfo.duration",
        views: "$videoInfo.views",
        createdAt: "$videoInfo.createdAt",
        likedAt: "$createdAt", // createdAt of the Like document
        owner: {
          _id: "$ownerInfo._id",
          fullName: "$ownerInfo.fullName",
          username: "$ownerInfo.username",
          avatar: "$ownerInfo.avatar",
        },
      },
    },
    {
      $sort: {
        likedAt: "-1",
      },
    },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { likedVideos: likedVideos },
        "Fetched Liked videos of a user",
      ),
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
