import mongoose from "mongoose";
import { Schema, Document } from "mongoose";

interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  status: string;
  posts: string[];
}

const userSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "I am new!",
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
});

export default mongoose.model<IUser>("User", userSchema);

// Path: src/models/post.ts
