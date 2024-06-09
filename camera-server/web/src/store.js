import Service from "./service";
import _ from "lodash";
import { OrderedMap } from "immutable";

export default class Store {
  constructor(app) {
    this.app = app;
    this.service = new Service(this);
    this.token = this.loadTokenFromLocalStorage();
    this.cameras = new OrderedMap();

    this.isFetched = {
      userCamera: false,
    };
  }

  addCameraToCache(id, cam, reload = false) {
    this.cameras = this.cameras.set(id, cam);

    if (reload) {
      this.update();
    }
  }

  async getUserCameras() {
    if (!this.isFetched.userCamera) {
      this.isFetched.userCamera = true;

      try {
        const response = await this.service.get("/api/me/cameras");
        const cameras = response.data;
        if (cameras.length) {
          _.each(cameras, (cam) => {
            const id = _.get(cam, "_id");
            this.addCameraToCache(id, cam, false);
          });
          this.update();
        }
      } catch (err) {
        console.log("Unable to load cameras with error:", err);
      }
    }
    return this.cameras.valueSeq();
  }

  getCurrentUserTokenId() {
    return _.get(this.token, "_id");
  }

  getCurrentUser() {
    return _.get(this.token, "user");
  }

  async addCamera(camera, cb = () => {}) {
    try {
      const response = await this.service.post("/api/me/cameras", camera);
      const cameraData = response.data;
      const id = _.get(cameraData, "_id");
      this.addCameraToCache(id, cameraData, true);
      cb(null, cameraData);
    } catch (err) {
      cb(err, null);
    }
  }

  loadTokenFromLocalStorage() {
    const data = localStorage.getItem("token");
    let token = null;
    try {
      token = JSON.parse(data);
    } catch (err) {
      console.log("Unable to decode token from local storage with error:", err);
    }
    return token;
  }

  saveUserTokenToLocalStorage(tokenObject) {
    this.token = tokenObject;
    const stringData = JSON.stringify(tokenObject);
    localStorage.setItem("token", stringData);
    this.update();
  }

  removeUserTokenFromLocalStorage() {
    this.token = null;
    localStorage.removeItem("token");
    this.update();
  }

  async createUserAccount(user, cb = () => {}) {
    try {
      const response = await this.service.post("/api/users", user);
      return cb(null, response.data);
    } catch (err) {
      console.log("Create new account error:", err);
      return cb(err, null);
    }
  }

  async login(user, cb = () => {}) {
    try {
      const response = await this.service.post("/api/users/login", user);
      const token = _.get(response, "data", null);
      this.saveUserTokenToLocalStorage(token);
      return cb(null, token);
    } catch (err) {
      cb(err, null);
    }
  }

  async logout(cb = () => {}) {
    try {
      const response = await this.service.post("/api/users/logout");
      this.removeUserTokenFromLocalStorage();
      cb(null, response.data);
    } catch (err) {
      cb(err, null);
    }
  }

  update() {
    this.app.forceUpdate();
  }
}
