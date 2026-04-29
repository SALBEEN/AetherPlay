import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../Models/video.models.js";
import { User } from "../Models/user.models.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/AsyncHandler.js";
import { uploadFileCloudinary } from "../Utils/cloudinary.js";
import { getHLSUrl } from "../Utils/hls.utils.js";

const getAllVideos = asyncHandler(async (req, res) => {
  // const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  // if (!userId) {
  //   throw new ApiError(400, "No userId found.");
  // }

  // if (!mongoose.Types.ObjectId.isValid(userId)) {
  //   throw new ApiError(400, "Invalif user ID");
  // }

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
    .limit(limit)
    .populate("owner", "username avatar fullName"); // add limit of video maybe a number

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
    throw new ApiError(400, "Unauthorized: user not found");
  }

  if (!req.files || !req.files.videoFile || !req.files.videoFile.length) {
    throw new ApiError(400, "Video file is required");
  }

  if (!req.files || !req.files.thumbnail || !req.files.thumbnail.length) {
    throw new ApiError(400, "thumbnail file is required");
  }

  const videoLocalPath = req.files.videoFile[0].path;
  const thumbnailLocalPath = req.files.thumbnail[0].path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Can't get videoLocalPath and thumbnailLocalPath ");
  }

  // if (!title || !description) {
  //   throw new ApiError("title or description could not found");
  // }

  // if (!title.trim().length > 0 || !description.trim().length > 0) {
  //   throw new ApiError("title and description cannot be empty");
  // }

  const videoTitle = String(title).trim();
  const videoDescription = String(description).trim();

  if (!videoTitle) throw new ApiError(400, "Title is required");
  if (!videoDescription)
    throw new ApiError(400, "videoDescription is required");

  if (videoTitle.length > 200)
    throw new ApiError(400, "Title too long (max char is 200)");
  if (videoDescription.length > 200)
    throw new ApiError(400, "videoDescription too long (max char is 200)");

  // for uplaoded video
  const { url: videoURL, publid_id: video_public_id } =
    await uploadFileCloudinary(videoLocalPath);

  // for uploaded thumbnail
  const { url: thumbnailURL, publid_id: thumbnail_public_url } =
    await uploadFileCloudinary(thumbnailLocalPath);

  // if (!videoFile || !thumbnailFile) {
  //   throw new ApiError(400, "File upload failed");
  // }

  // it will create a hls url
  const HLSUrl = getHLSUrl(video_public_id);

  if (!videoURL || !video_public_id) {
    throw new ApiError(400, "Cannot get response from cloudinary upload");
  }

  if (!thumbnailURL || !thumbnail_public_url) {
    throw new ApiError(400, "Cannot get response from cloudinary upload");
  }

  const videoDuration = req.body.duration ? Number(req.body.duration) : 0;
  const videoViews = req.body.views ? Number(req.body.views) : 0;

  const publishVideo = await Video.create({
    videoFile: HLSUrl,
    publicId: video_public_id,
    thumbnail: thumbnailURL,
    title: videoTitle,
    description: videoDescription,
    duration: videoDuration,
    views: videoViews,
    isPublished: true,
    owner: new mongoose.Types.ObjectId(user._id),
  });

  if (!publishVideo) {
    throw new ApiError(400, "video publish failed");
  }

  res
    .status(200)
    .json(new ApiResponse(200, { publishVideo }, "Video Uploaded successfull"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "No videoId found.");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    // Lookup owner details
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
    // Lookup subscribers count for the owner
    {
      $lookup: {
        from: "subscriptions",
        localField: "ownerInfo._id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $addFields: {
        owner: {
          _id: "$ownerInfo._id",
          username: "$ownerInfo.username",
          fullName: "$ownerInfo.fullName",
          avatar: "$ownerInfo.avatar",
          subscribersCount: { $size: "$subscribers" },
        },
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
        createdAt: 1,
        updatedAt: 1,
        owner: 1,
      },
    },
  ]);

  if (!video?.length) {
    throw new ApiError(400, "Video not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, { video: video[0] }, "Video fetched successfully"),
    );
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!videoId) {
    throw new ApiError(400, "Cannot get video ID");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Imvalid video ID");
  }

  const user = req.user;

  if (!user) {
    throw new ApiError(400, "Unauthorized: user not found");
  }

  // if (!mongoose.Types.ObjectId.isValid(user._id)) {
  //   throw new ApiError("Invalid User ID");
  // }

  const updatedTitle = String(title).trim();
  const updatedDescription = String(description).trim();

  if (!updatedTitle || !updatedDescription) {
    throw new ApiError(400, "Cannot found title and description");
  }

  if (updatedTitle.length > 200)
    throw new ApiError(400, "Should be less than 200 character");

  if (updatedDescription.length > 200)
    throw new ApiError(400, "Should be less than 200 character");

  if (!res.file) {
    new ApiError(400, "Unable to get thumbnail");
  }

  const updatedThumbnailLocalPath = res.file?.path;

  const updatedThumbnail = await uploadFileCloudinary(
    updatedThumbnailLocalPath,
  );

  const video = await Video.findByIdAndUpdate(
    new mongoose.Types.ObjectId(videoId),
    {
      $set: {
        title: updatedTitle,
        description: updatedDescription,
        thumbnail: updatedThumbnail,
      },
    },
    {
      $new: true,
    },
  );

  if (!video) {
    new ApiError(400, "Unable to updated Video");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { updateVideoDetail: video },
        "Video updated successfully",
      ),
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  if (!videoId) {
    throw new ApiError(400, "Unable to found Video ID");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  const deleted = await Video.findByIdAndDelete(videoId);

  if (!deleted) {
    throw new ApiError(400, "Video delete failed");
  }

  res
    .status(200)
    .json(new ApiResponse(200, { deleted }, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) throw new ApiError(400, "Missing video ID");

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(400, "Cannot found video");

  video.isPublished = !video.isPublished;
  await video.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isPublished: video.isPublished },
        "Video publish status toggled successfully",
      ),
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};

// ALL DONE
