import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const user = req?.user._id;

  if (!user) {
    throw new ApiError("User cannot be found");
  }

  if (!content) {
    throw new ApiError("Content cannot be empty");
  }

  if (content.trim().length < 10) {
    throw new ApiError("Content length should be atleast than 10 character.");
  }

  const owner = await req?.user._id;

  const tweet = await Tweet.create({
    owner,
    content,
  });

  if (!tweet) {
    throw new ApiError("Tweet cannot be made ");
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        madeBy: owner.fullName,
        tweet: content,
      },
      "Tweet made successfully",
    ),
  );
});

const getUserTweets = asyncHandler(async (req, res) => {
  // finding out all the tweet made by a user
  /*
  using aggregration pipeline to find the tweet made by current user 
  from tweets database collection

  */

  const userId = req?.user._id;

  if (!userId) {
    throw new ApiError("User cannot be found!!");
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError("Invalid User Id!!");
  }

  const tweet = await Tweet.aggregate([
    {
      // match does match the tweet made by current user
      $match: {
        owner: new mongoose.Types.ObjectId(req?.user._id),
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
    // unwind user info so its an object
    {
      $unwind: {
        path: "$ownerInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        //expose owner summary fields from ownerInfo
      },
    },
  ]);

  if (!tweet) {
    throw new ApiError("Cannot find tweets");
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
