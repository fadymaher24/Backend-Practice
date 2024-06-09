const mongoose = require("mongoose");
const { OrderedMap } = require("immutable");
const connectionSchema = new mongoose.Schema({
  clientId: String,
  created: { type: Date, default: Date.now },
});
const { ObjectID } = require("mongoose");

const ConnectionModel = mongoose.model("Connection", connectionSchema);

class Connection {
  constructor(app) {
    this.app = app;
    this.clients = new OrderedMap();
    this.socketServerConnect();
  }
  getClients() {
    return this.clients;
  }

  addClient(id, client) {
    const connection = new ConnectionModel({
      clientId: id,
    });
    connection.save();
    this.clients = this.clients.set(id, client);
  }

  removeClient(id) {
    ConnectionModel.deleteOne({ clientId: id });
    this.clients = this.clients.remove(id);
  }

  socketServerConnect() {
    const app = this.app;

    app.ws.on("connection", (ws) => {
      console.log(`RaspberryPi is connected`);
      // Add this Pi to clients collections.
      const clientId = new mongoose.Types.ObjectId().toString();
      const newClient = {
        _id: clientId,
        ws: ws,
        created: new Date(),
      };

      this.addClient(clientId, newClient);

      ws.on("message", (msg) => {
        msg = JSON.parse(msg);
        console.log("Message received from RaspberryPi is", msg);
      });

      ws.on("close", async () => {
        console.log(`Raspberry Pi camera with Id ${clientId} is disconnected`);
        await this.removeClient(clientId);
      });

      const commandNeedToSendToPi = { action: "stream", payload: false };
      ws.send(JSON.stringify(commandNeedToSendToPi));
    });
  }
}

module.exports = Connection;
