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
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["pending","send","received","seen"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  })
);

export default Message;

  // 'pending' is default value if status is not set from client side,
  // 'seen' is set from client side when user see the message, 
  //'read' is set from server side when user see the message, 
  //'delivered' is set from server side when user see the message
