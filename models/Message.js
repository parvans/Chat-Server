import mongoose from "mongoose";

const Message = mongoose.model(
  "Message",
  new mongoose.Schema({
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      trim: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    isPending: {
      type: Boolean,
      default: true,
    },
    isSend: {
      type: Boolean,
      default: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  })
);

export default Message;