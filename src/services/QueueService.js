import axios from "axios";
import { API_URL } from "../globals";
const token = localStorage.getItem("token");
const CancelToken = axios.CancelToken;

export default class QueueService {
  static getQueues(config, cancel) {
    return axios.get(`${API_URL}/queue/paginate`, {
      params: config,
      headers: { "authorization-token": token },
      cancelToken: new CancelToken(cancel)
    });
  }

  static getQueuesCount(config, cancel) {
    return axios.get(`${API_URL}/queue/paginate_count`, {
      params: config,
      headers: { "authorization-token": token },
      cancelToken: new CancelToken(cancel)
    });
  }

  static getQueue(id, cancel) {
    return axios.get(`${API_URL}/queue`, {
      params: { by: "id", value: id },
      headers: { "authorization-token": token },
      cancelToken: new CancelToken(cancel)
    });
  }
}
