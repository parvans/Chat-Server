import mongoose from "mongoose";

export const ISVALIDID = val=>mongoose.Types.ObjectId.isValid(val);
