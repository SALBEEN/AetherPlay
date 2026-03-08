import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  // const { page = "", limit "" } = req.query;

  const user = req?.user._id;

  if (!videoId) {
    throw new ApiError("Unable to found video id");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError("Invalid video id: video doesnot exists");
  }

  if (!user) {
    throw new ApiError("Unable to found user id");
  }

  if (!mongoose.Types.ObjectId.isValid(user)) {
    throw new ApiError("Invalid user id: user doesnot exists");
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const comment = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
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
      $unwind: "$ownerInfo",
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
    {
      $project: {
        comment: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: {
          _id: "$ownerInfo._id",
          fullname: "$ownerInfo.fullName",
          avatar: "$ownerInfo.avatar",
        },
      },
    },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, { comment }, "Fetched video comment"));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
});

export { getVideoComments, addComment, updateComment, deleteComment };
