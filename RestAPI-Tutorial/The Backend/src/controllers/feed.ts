import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

import fs from "fs";
import path from "path";

import Post from "../models/post";
import User from "../models/user";
import mongoose from "mongoose";

export const getPosts = (req: Request, res: Response, next: NextFunction) => {
  const currentPage = parseInt(req.query.page as string) || 1;
  const perPage = 2;
  let totalItems: number;
  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      res.status(200).json({
        message: "Fetched posts successfully.",
        posts: posts,
        totalItems: totalItems,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

export const createPost = async (
  req: Request & { userId: string }, // Add 'userId' to the request type
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    (error as any).statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error("No image provided.");
    (error as any).statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;

  try {
    console.log(req.userId);
    console.log("params:", req.params);
    console.log("body:", req.body);

    const user = await User.findById(req.userId); // Use req.userId directly
    if (!user) {
      const error = new Error("User not found.");
      (error as any).statusCode = 404;
      throw error;
    }

    const post = new Post({
      title: title,
      content: content,
      imageUrl: imageUrl,
      creator: req.userId, // Use req.userId directly
    });
    await post.save();

    user.posts.push(post._id.toString());
    await user.save();

    res.status(201).json({
      message: "Post created successfully!",
      post: post,
      creator: { _id: user._id.toString(), name: user.name },
    });
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const updatePost = (
  req: Request & { userId: string }, // Add 'userId' to the request type
  res: Response,
  next: NextFunction
) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    (error as any).statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error("No file picked.");
    (error as any).statusCode = 422;
    throw error;
  }
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        (error as any).statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not authorized!");
        (error as any).statusCode = 403;
        throw error;
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      return post.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Post updated!", post: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

export const deletePost = (
  req: Request & { userId: string }, // Add 'userId' to the request type
  res: Response,
  next: NextFunction
) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        (error as any).statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not authorized!");
        (error as any).statusCode = 403;
        throw error;
      }
      // Check logged in user
      clearImage(post.imageUrl);
      return Post.findByIdAndDelete(postId);
    })
    .then((result) => {
      console.log(result);
      res.status(200).json({ message: "Deleted post." });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

export const getPost = (req: Request, res: Response, next: NextFunction) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        (error as any).statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Post fetched.", post: post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filePath: string) => {
  console.log(filePath);
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => console.log(err));
  } else {
    console.log("File does not exist");
  }
};

export default {
  getPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
};
