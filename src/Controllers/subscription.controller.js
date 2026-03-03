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

    res.status(200).json(new ApiResponse(200, {}, "Unsubscribed done"));
  } else {
    await Subscription.createOne({
      channel: channelId,
      subscriber: userId,
    });

    res.status(200).json(new ApiResponse(200, {}, "Channel subscribed Done!!"));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError("Unable to find channel");
  }

  // we have to take out all the subscribers of the current users

  const userChannelSubscriber = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localFiled: "subscriber",
        foreignField: "_id",
        as: "subscriberInfo",
      },
    },
    {
      $unwind: {
        path: "subscriberInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        createdAt: 1,
        updatedAt: 1,
        subscriber: {
          _id: "$subscriberInfo._id",
          fullName: "$subscriberInfo.fullName",
          username: "$subscriberInfo.username",
          avatar: "$subscriberInfo.avatar",
          coverImage: "$subscriberInfo.coverImage",
          email: "$subscriberInfo.email",
        },
      },
    },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscriber: userChannelSubscriber },
        "List Of channel subscribers",
      ),
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  // we have to take out all the channels that the user have
  // subscribed

  const userChannelSubscribedTo = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localFiled: "channel",
        foreignField: "_id",
        as: "subscribedToInfo",
      },
    },
    {
      $unwind: {
        path: "$subscribedToInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        createdAt: 1,
        updatedAt: 1,
        subscriber: {
          _id: "$subscribedToInfo._id",
          fullName: "$subscribedToInfo.fullName",
          username: "$subscribedToInfo.username",
          avatar: "$subscribedToInfo.avatar",
          coverImage: "$subscribedToInfo.coverImage",
          email: "$subscribedToInfo.email",
        },
      },
    },
  ]);
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
