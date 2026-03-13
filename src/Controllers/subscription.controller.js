import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../Models/user.models.js";
import { Subscription } from "../Models/subscription.models.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/AsyncHandler.js";

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

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }

  // we have the channel to toggle subscription and loggedin user who will
  // subscribe the channel

  // firstly find if the user is already a subscriber

  const existingSubscriber = await Subscription.findOne({
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
    await Subscription.create({
      channel: channelId,
      subscriber: userId,
    });

    res.status(200).json(new ApiResponse(200, {}, "Channel subscribed Done!!"));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params; // subscriberId -> current logged In userID

  if (!channelId) {
    throw new ApiError("Unable to find channel");
  }

  // we have to take out all the subscribers of the current users

  const userChannelSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberInfo",
      },
    },
    {
      $unwind: {
        path: "$subscriberInfo",
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
        { subscriber: userChannelSubscribers },
        "List Of channel subscribers",
      ),
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!subscriberId) {
    throw new ApiError("Cannot find subscriberId");
  }

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid channel id");
  }

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
        localField: "channel",
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
        channel: {
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

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { SubscribedTo: userChannelSubscribedTo },
        "All Channel to whom suer subscribed",
      ),
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };

// ALL DONE
