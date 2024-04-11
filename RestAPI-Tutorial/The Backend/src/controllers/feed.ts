import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

import fs from "fs";
import path from "path";

import Post from "../models/post";
import User from "../models/user";

export const getPosts = (req: Request, res: Response, next: NextFunction) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems: number;
  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .skip(
          (parseInt(currentPage.toString()) - 1) * parseInt(perPage.toString())
        )
        .limit(parseInt(perPage.toString()));
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

export const createPost = (req: Request, res: Response, next: NextFunction) => {
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
  let creator: { _id: string; name: string };
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.params.userId,
  });
  post
    .save()
    .then((result) => {
      return User.findById(req.params.userId);
    })
    .then((user) => {
      creator._id = user?.toString() || "";
      creator.name = user?.name || "";
      if (user) {
        user.posts.push(post._id.toString()); // Convert post._id to string before pushing
        return user.save();
      }
      return null;
    })
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully!",
        post: post,
        creator: { _id: creator._id, name: creator.name },
      });
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

export const updatePost = (req: Request, res: Response, next: NextFunction) => {
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
      if (post.creator.toString() !== req.params.userId) {
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

const clearImage = (filePath: string) => {
  console.log(filePath);
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => console.log(err));
  } else {
    console.log("File does not exist");
  }
};

export const deletePost = (req: Request, res: Response, next: NextFunction) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        (error as any).statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.params.userId) {
        const error = new Error("Not authorized!");
        (error as any).statusCode = 403;
        throw error;
      }
      // Check logged in user
      clearImage(post.imageUrl);
      return Post.findByIdAndDelete(postId); // Replace 'findByIdAndRemove' with 'findByIdAndDelete'
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

export default {
  getPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
};
