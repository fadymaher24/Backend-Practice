const mongoose = require("mongoose");
const { Schema } = mongoose;
const { OrderedMap } = require("immutable");
const _ = require("lodash");

// Define the camera schema
const cameraSchema = new Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  public: { type: Boolean, default: false },
  live: { type: Boolean, default: false },
  streamingKey: { type: String, required: true },
  lastConnected: { type: Date, default: null },
  isConnected: { type: Boolean, default: false },
  created: { type: Date, default: Date.now },
});

// Create the camera model
const CameraModel = mongoose.model("Camera", cameraSchema);

class Camera {
  constructor(app) {
    this.app = app;
    this.cameras = new OrderedMap();
  }

  find(q, options, cb = () => {}) {
    CameraModel.find(q, null, options)
      .limit(100)
      .exec((err, results) => {
        return cb(err ? "Not found" : null, results);
      });
  }

  addCameraToCache(id, camera) {
    if (typeof id !== "string") {
      id = _.toString(id);
    }
    this.cameras = this.cameras.set(id, camera);
  }

  create(obj, cb = () => {}) {
    const name = _.get(obj, "name", null);
    let userId = _.get(obj, "userId", null);

    if (!userId) {
      return cb("Camera owner is required", null);
    }

    if (!name) {
      return cb("Camera name is required", null);
    }

    if (typeof userId === "string") {
      userId = mongoose.Types.ObjectId(userId);
    }

    const isPublic = _.get(obj, "public", false);
    const streamingKey = new mongoose.Types.ObjectId().toString();

    const camera = new CameraModel({
      name: `${_.get(obj, "name", "")}`,
      userId: userId,
      public: isPublic ? true : false,
      live: false,
      streamingKey: streamingKey,
      lastConnected: null,
      isConnected: false,
      created: new Date(),
    });

    camera.save((err, savedCamera) => {
      if (err) {
        return cb("An error inserting new camera", null);
      }

      // save camera to cache
      this.addCameraToCache(savedCamera._id, savedCamera);
      return cb(null, savedCamera);
    });
  }
}

module.exports = Camera;
