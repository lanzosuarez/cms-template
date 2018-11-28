import axios from "axios";
import { AUTH_SERVICE_URL, APP_NAME } from "../globals";
const token = localStorage.getItem("token");

class UserService {
  static login(data) {
    return axios.post(
      `${AUTH_SERVICE_URL}/user/signin`,
      { app: APP_NAME, ...data },
      {
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  static validateToken() {
    return axios.get(`${AUTH_SERVICE_URL}/user/validate`, {
      headers: { "authorization-token": token }
    });
  }
}

export default UserService;
