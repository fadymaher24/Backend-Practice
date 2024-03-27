"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const feed_1 = __importDefault(require("./routes/feed"));
const app = (0, express_1.default)();
// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(body_parser_1.default.json()); // application/json
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});
app.use("/feed", feed_1.default);
mongoose_1.default
    .connect("mongodb+srv://fadyy:11223344Fff@cluster0.uz4c3us.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0")
    .then((result) => {
    app.listen(8080);
})
    .catch((err) => console.log(err));
