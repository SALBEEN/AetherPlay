import mongoose, { mongo } from "mongoose";
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
  const videoId = req.params;

  if (!videoId) {
    throw new ApiError("Cannot get video Id");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError("Invalid ID: Video doesnot exists");
  }

  const userId = req.user._id;

  if (!userId) {
    throw new ApiError("Cannot get user Id");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError("Error: User doesn't exists");
  }

  const { content } = req.body;

  const trimmedContent = String(content).trim();

  if (!trimmedContent) {
    throw new ApiError("Comment cannot be empty");
  }

  if (trimmedContent.length > 300) {
    throw new ApiError("Comment cannot be more than 300 character");
  }

  const comment = await Comment.create({
    content: content,
    owner: mongoose.Types.ObjectId(userId),
    video: mongoose.Types.ObjectId(videoId),
  });

  if (!comment) {
    throw new ApiError("Cannot comment to the video");
  }

  res
    .status(200)
    .json(new ApiResponse(200, { comment }, "Comment added to the video"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment

  const { newContent } = req.body;
  const commentId = req.params;

  const trimmedContent = String(newContent).trim();

  if (!trimmedContent) {
    throw new ApiError("Comment cannot be empty");
  }

  if (!commentId) {
    throw new ApiError("cannot get comment id");
  }

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError("Invalid comment");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: trimmedContent,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updateComment) {
    throw new ApiError("Cannot update the comment");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, { updateComment }, "Comment updated successfully"),
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
});

export { getVideoComments, addComment, updateComment, deleteComment };
