const mongoose = require("mongoose");

const User = require("./user");
const Token = require("./token");
const Camera = require("./camera");

class Model {
  constructor() {
    this.user = User;
    this.token = Token;
    this.camera = Camera;
  }
}

module.exports = Model;
