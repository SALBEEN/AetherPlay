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
  const { title = "", description = "" } = req.body;

  const user = req?.user;

  if (!user || !user._id) {
    throw new ApiError("Unauthorized: user not found");
  }

  if (!req.files || !res.files.videoFiles || !res.files.videoFile.length) {
    throw new ApiError("Video file is required");
  }

  if (!req.files || !res.files.thumbnail || !res.files.thumbnail.length) {
    throw new ApiError("thumbnail file is required");
  }

  const videoLocalPath = req.files.videoFile[0].path;
  const thumbnailLocalPath = req.files.thumbnail[0].path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError("Can't get videoLocalPath and thumbnailLocalPath ");
  }

  // if (!title || !description) {
  //   throw new ApiError("title or description could not found");
  // }

  // if (!title.trim().length > 0 || !description.trim().length > 0) {
  //   throw new ApiError("title and description cannot be empty");
  // }

  const videoTitle = String(title).trim();
  const videoDescription = String(description).trim();

  if (!videoTitle) throw new ApiError("Title is required");
  if (!videoDescription) throw new ApiError("videoDescription is required");

  if (videoTitle.length > 200)
    throw new ApiError("Title too long (max char is 200)");
  if (videoDescription.length > 200)
    throw new ApiError("videoDescription too long (max char is 200)");

  const videoFile = await uploadOnCloudinary(videoLocalPath);
  const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile || !thumbnailFile) {
    throw new ApiError("File upload failed");
  }

  const videoDuration = req.body.duration ? Number(req.body.duration) : null;
  const videoViews = req.body.views ? Number(req.body.views) : 0;

  const publishVideo = await Video.create({
    videoFile,
    thumbnail: thumbnailFile,
    title: videoTitle,
    description: videoDescription,
    duration,
    views,
    isPublished: true,
    owner: mongoose.Types.ObjectId(user._id),
  });

  if (!publishVideo) {
    throw new ApiError("video publish failed");
  }

  res.status(200).json(new ApiResponse(200, {}, "Video Uploaded successfull"));
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
    "owner",
    "fullName username avatar ",
  );

  if (!video) {
    throw new ApiError("Video not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, { video }, "Video fetched successfully"));
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

  const deleted = await Video.findByIdAndDelete(videoId);

  if (!deleted) {
    throw new ApiError("Video delete failed");
  }

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
