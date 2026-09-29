
import mongoose from "mongoose";
const channelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    members: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    admin: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },

    messages: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Message",
        required: false,
      },
    ],
  },
  {
    timestamps: true,
  },
);


const Channel = mongoose.model("Channel", channelSchema);

export default Channel;
