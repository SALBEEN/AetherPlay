import mongoose from "mongoose";
import { Video } from "../Models/video.model.js";
import { Subscription } from "../Models/subscription.model.js";
import { Like } from "../Models/like.model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const user = req.user._id;

  if (!user) {
    throw new ApiError("cannot get user id");
  }

  if (!mongoose.Types.ObjectId.isValid(user)) {
    throw new ApiError("Invalid User ");
  }

  const channelVideo = await Video.aggregate([
    {
      $match: {
        owner: mongoose.Types.ObjectId(user),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerInfo",
      },
    },
    {
      $unwind: {
        path: "$ownerInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        owner: {
          channelName: "$ownerInfo.fullName",
          channelAvatar: "$ownerInfo.avatar",
        },
      },
    },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { channelVideos: channelVideo },
        "Channel video fetched successfully",
      ),
    );
});

export { getChannelStats, getChannelVideos };
