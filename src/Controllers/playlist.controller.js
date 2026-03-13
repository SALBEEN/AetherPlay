import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../Models/playlist.models.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/AsyncHandler.js";
import { User } from "../Models/user.models.js";
import { Video } from "../Models/video.models.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // creating a playlist
  // name, description, video, and owner

  const userId = req?.user?._id;

  if (!userId) {
    throw new ApiError(401, "User cannot found");
  }

  const isUserExists = await User.findById(userId);

  if (!isUserExists) {
    throw new ApiError(401, "User doesnot exists");
  }

  const isNameValid = name.trim().length > 0;
  const isDescriptionValid = description.trim().length > 0;

  if (!(isNameValid || isDescriptionValid)) {
    throw new ApiError(401, "Playlist name and description cannot be empty");
  }

  await Playlist.create({
    name: name,
    description: description,
    owner: userId,
    video: [],
  });

  res
    .status(200)
    .json(new ApiResponse(200, {}, `Playlist ${name} created successfully`));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  // we have to find out the playlist created by the current user

  if (!userId) {
    throw new ApiError(401, "User id missing from params");
  }

  const isUserExists = await User.findById(userId);

  if (!isUserExists) {
    throw new ApiError(401, "User doesnot Exists");
  }

  const userPlaylists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
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
        createdAt: 1,
        updatedAt: 1,
        name: 1,
        description: 1,
        video: 1,
        owner: {
          _id: "$ownerInfo._id",
          fullName: "$ownerInfo.fullName",
          username: "$ownerInfo.username",
          avatar: "$ownerInfo.avatar",
          coverImage: "$ownerInfo.coverImage",
          email: "$ownerInfo.email",
        },
      },
    },
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        playlists: userPlaylists,
      },
      "Playlist fetched Successfully",
    ),
  );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  if (!playlistId) {
    throw new ApiError(401, "Playlist id not found");
  }

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(401, "Invalid playlist ID");
  }

  const playlistDetails = await Playlist.findById(playlistId)
    .populate("owner", "fullName username avatar email")
    .populate("video", "title thumbnail duration views");

  if (!playlistDetails) {
    throw new ApiError(401, "No such playlist exists");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlistDetails,
        "Successfully found playlist by ID",
      ),
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !videoId) {
    throw new ApiError(401, "Unable to found playlistId or videoId");
  }

  const isPlaylist = await Playlist.findById(playlistId);
  const isVideo = await Video.findById(videoId);

  if (!isPlaylist || !isVideo) {
    throw new ApiError(401, "Playlist or video maynot exists");
  }
  if (isPlaylist.video && isPlaylist.video.length > 0) {
    for (let index = 0; index < isPlaylist.video.length; index++) {
      if (isPlaylist.video[index].toString() === videoId.toString()) {
        throw new ApiError(401, "Video already exists");
      }
    }
  }
  const playlist = await Playlist.findByIdAndUpdate(
    isPlaylist,
    {
      $addToSet: { video: videoId },
    },
    {
      $new: true,
    },
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { playlist },
        "Video Added to playlist successfully",
      ),
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

  if (!playlistId || !videoId) {
    throw new ApiError(401, "Unable to found playlistId or videoId");
  }

  const playlist = await Playlist.findById(playlistId);
  const video = await Video.findById(videoId);

  if (!isPlaylistExists || !isVideoExists) {
    throw new ApiError(401, "Playlist or video maynot exists");
  }

  // for (let index = 0; index < isPlaylistExists.video.length; index++) {
  //   if (isPlaylistExists.video[index].toString() === videoId.toString()) {
  //     throw new ApiError("Video already exists");
  //   }
  // }

  await Playlist.findByIdAndUpdate(
    isPlaylistExists,
    {
      $pull: { video: videoId },
    },
    {
      $new: true,
    },
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Video removed from playlist playlist successfully",
      ),
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  if (!playlistId) {
    throw new ApiError("Unable to find playlist id");
  }

  if (!mongoose.Types.ObjectId.isValid(playlist)) {
    throw new ApiError("Invalid Playlist ID");
  }

  await Playlist.findByIdAndDelete(playlistId);

  res.status(200).json(200, {}, "Playlist deleted successfully");
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!playlistId) {
    throw new ApiError(401, "Unable to find playlist id");
  }

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(401, "Invalid Playlist ID");
  }

  if (!name || !description) {
    throw new ApiError(401, "Unable to found name and description ");
  }

  if (!(name.trim().length > 0) || !(description.trim().length > 0)) {
    throw new ApiError(401, "Name or description cannot be empty");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name: name,
        description: description,
      },
    },
    {
      new: true,
    },
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { updatedPlaylist: updatedPlaylist },
        "Playlist updated successfully",
      ),
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
