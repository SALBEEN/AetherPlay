import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tweetSchema = new Schema({}, { timestamps: true });

tweetSchema.plugin(mongooseAggregatePaginate);

export const Tweet = mongoose.model("Video", tweetSchema);
