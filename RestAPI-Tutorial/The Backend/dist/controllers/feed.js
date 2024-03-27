"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPost = exports.getPosts = void 0;
const express_validator_1 = require("express-validator");
const post_1 = __importDefault(require("../models/post"));
const getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [
            {
                _id: "1",
                title: "First Post",
                content: "This is the first post!",
                imageUrl: "images/favico.ico",
                creator: {
                    name: "Fady",
                },
                createdAt: new Date(),
            },
        ],
    });
};
exports.getPosts = getPosts;
const createPost = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: "Validation failed, entered data is incorrect.",
            errors: errors.array(),
        });
    }
    const title = req.body.title;
    const content = req.body.content;
    const post = new post_1.default({
        title: title,
        content: content,
        imageUrl: "images/favico.ico",
        creator: { name: "Fady" },
    });
    post
        .save()
        .then((result) => {
        res.status(201).json({
            message: "Post created successfully!",
            post: result,
        });
    })
        .catch((err) => {
        console.log(err);
    });
};
exports.createPost = createPost;
