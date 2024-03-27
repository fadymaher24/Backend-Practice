"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const feed_1 = __importDefault(require("./routes/feed"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const urL = process.env.MONGO_URL;
const port = Number(process.env.PORT);
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
    .connect(urL)
    .then((result) => {
    console.log("Connected to MongoDB");
    app.listen(port);
})
    .catch((err) => console.log(err));
