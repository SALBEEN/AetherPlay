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
  // TODO: get user tweets
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
