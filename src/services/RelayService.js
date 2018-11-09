import axios from "axios";
import { API_URL, AUTH_SERVICE_URL } from "../globals";
const token = localStorage.getItem("token");

export default class RelayService {
  static relayRq({ method, url, params, data }, cancel) {
    return axios.post(
      `${AUTH_SERVICE_URL}/relay`,
      {
        method,
        url,
        params,
        data
      },
      {
        headers: {
          "authorization-token": token,
          "Content-Type": "application/json"
        },
        cancelToken: new CancelToken(cancel)
      }
    );
  }
}
