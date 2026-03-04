import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../Models/user.models.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // creating a playlist
  // name, description, video, and owner

  const userId = req?.user?._id;

  if (!userId) {
    throw new ApiError("User cannot found");
  }

  const isUserExists = await User.findById(userId);

  if (!isUserExists) {
    throw new ApiError("User doesnot exists");
  }

  const isNameValid = name.trim().length > 0;
  const isDescriptionValid = description.trim().length > 0;

  if (!(isNameValid || isDescriptionValid)) {
    throw new ApiError("Playlist name and description cannot be empty");
  }

  await Playlist.createOne({
    name: name,
    description: description,
    owner: userId,
    video: null,
  });

  res
    .status(200)
    .json(new ApiResponse(200, {}, `Playlist ${name} created successfully`));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  // we have to find out the playlist created by the current user

  if (!userId) {
    throw new ApiError("User id missing from params");
  }

  const isUserExists = await User.findById(userId);

  if (!isUserExists) {
    throw new ApiError("User doesnot Exists");
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
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
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
