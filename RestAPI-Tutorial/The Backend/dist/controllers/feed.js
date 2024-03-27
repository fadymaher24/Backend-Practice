"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPost = exports.getPosts = void 0;
const express_validator_1 = require("express-validator");
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
    console.log(title, content);
    // Create post in db
    res.status(201).json({
        message: "Post created successfully!",
        post: {
            id: new Date().toISOString(),
            title: title,
            content: content,
            creator: { name: "Fady" },
            createdAt: new Date(),
        },
    });
};
exports.createPost = createPost;
