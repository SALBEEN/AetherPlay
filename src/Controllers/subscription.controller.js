import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  // validate if use exists or not

  const userId = req.user._id;

  if (!userId) {
    throw new ApiError("User id unable to found");
  }

  const isUserLoggedIn = await User.findById(userId);

  if (!isUserLoggedIn) {
    throw new ApiError("User id unable to found");
  }

  // we have the channel to toggle subscription and loggedin user who will
  // subscribe the channel

  // firstly find if the user is already a subscriber

  const existingSubscriber = await Subscription.findById({
    channel: channelId,
    subscriber: userId,
  });

  if (existingSubscriber) {
    // if the user is already a subscriber remove it from subscriber

    await Subscription.deleteOne({
      channel: channelId,
      subscriber: userId,
    });
  } else {
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
