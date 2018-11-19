import * as io from "socket.io-client";
import { API_URL } from "../globals";

class SocketService {
  static socket;

  static initSocket() {
    const URL = API_URL.replace("/api/v1", "");
    this.socket = io(URL, {
      transports: ["websocket"]
    });
  }

  static emitEvent(event, payload) {
    this.socket.emit(event, payload);
  }

  static listenToEvent(event, cb) {
    this.socket.on(event, payload => cb(payload));
  }
}

export default SocketService;
