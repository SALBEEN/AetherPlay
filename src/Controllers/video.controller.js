import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  // const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  if (!userId) {
    throw new ApiError("No userId found.");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalif user ID");
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const query = req.query.query || "";
  const sortBy = req.query.sortBy || "createdAt";
  const sortType = req.query.sortType === "asc" ? 1 : -1;
  const userId = req.query.userId;

  let filter = {};

  if (query) {
    filter.title = { $regex: query, $options: "i" }; // i means casesensitive
  }

  const videos = await Video.find({ title: { $regex: query, $options: "i" } }) // regex: matches the query in video title
    .sort({ [sortBy]: sortType }) // sortby: views/likes/  sortType: 1(asc)/ -1(desen)
    .skip((page - 1) * limit) // skips the number of video
    .limit(limit); // add limit of video maybe a number

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videosList: videos },
        "Video fetched successfully",
      ),
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  if (!videoId) {
    throw new ApiError("No userId found.");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError("Invalif user ID");
  }

  const video = await Video.findById(videoId).populate(
    "video",
    "videoFile, thumbnail, title, duration, views, isPublished, owner",
  );

  res.status(200).json(new ApiResponse(200, {}, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  if (!videoId) {
    throw new ApiError("Unable to found Video ID");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError("Invalid Video ID");
  }

  await Video.findByIdAndDelete(videoId);

  res.status(200).jsom(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos, // done
  publishAVideo,
  getVideoById, //done
  updateVideo,
  deleteVideo, // done
  togglePublishStatus,
};
