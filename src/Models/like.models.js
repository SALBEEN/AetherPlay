import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const LikeSchema = new Schema(
  {},
  {
    timestamps: true,
  },
);

LikeSchema.plugin(mongooseAggregatePaginate);

export const Like = mongoose.model("Like", LikeSchema);
