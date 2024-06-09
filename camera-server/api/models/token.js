// token.js
const mongoose = require("mongoose");
const { Schema } = mongoose;
const { OrderedMap } = require("immutable");
const _ = require("lodash");

const tokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

const TokenModel = mongoose.model("Token", tokenSchema);

class TokenService {
  constructor() {
    this.tokens = new OrderedMap();
  }

  async addTokenToCache(id, token) {
    this.tokens = this.tokens.set(id, token);
  }

  as;

  async load(id, cb = () => {}) {
    try {
      const tokenInCache = this.tokens.get(id);
      if (tokenInCache) {
        return tokenInCache;
      }

      const token = await TokenModel.findById(id).populate(
        "userId",
        "name email created"
      );
      if (!token) {
        throw new Error("Token not found");
      }

      await this.addTokenToCache(id, token);
      return token;
    } catch (error) {
      console.error("Error loading token:", error.message);
      return cb(error.message, null);
    }
  }

  async verify(tokenId, cb = () => {}) {
    try {
      // Remove "Bearer " prefix if it exists
      if (tokenId.startsWith("Bearer ")) {
        tokenId = tokenId.slice(7);
      }

      if (typeof tokenId !== "string") {
        tokenId = _.toString(tokenId);
      }

      const tokenInCache = this.tokens.get(tokenId);
      if (tokenInCache) {
        return tokenInCache;
      }

      const token = await TokenModel.findById(tokenId).populate(
        "userId",
        "name email created"
      );
      if (!token) {
        throw new Error("Token not found");
      }

      await this.addTokenToCache(tokenId, token);
      return token;
    } catch (error) {
      console.error("Error verifying token:", error.message);
      return cb(error.message, null);
    }
  }

  async create(userId, cb = () => {}) {
    try {
      const token = await TokenModel.create({ userId });
      await this.addTokenToCache(token._id.toString(), token);
      const populatedToken = await TokenModel.findById(token._id).populate(
        "userId",
        "name email created"
      );

      // console.log("Token created successfully:", populatedToken);

      return populatedToken;
    } catch (error) {
      console.error("Error creating token:", error.message);
      return cb("Cannot create token", null);
    }
  }
  async delete(tokenId) {
    return await TokenModel.findByIdAndDelete(tokenId);
  }
}

module.exports = TokenService;
