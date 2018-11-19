import axios from "axios";
import { API_URL } from "../globals";
const token = localStorage.getItem("token");
const CancelToken = axios.CancelToken;

export default class MessageService {
  static getMessages(config, cancel) {
    return axios.get(`${API_URL}/message/paginate`, {
      params: config,
      headers: { "authorization-token": token },
      cancelToken: new CancelToken(cancel)
    });
  }

  static getQueuesCount(config, cancel) {
    return axios.get(`${API_URL}/message/paginate_count`, {
      params: config,
      headers: { "authorization-token": token },
      cancelToken: new CancelToken(cancel)
    });
  }

  static sendMessage(data, cancel) {
    return axios.post(`${API_URL}/message`, data, {
      headers: { "authorization-token": token },
      cancelToken: new CancelToken(cancel)
    });
  }

  static getUnread(config, cancel) {
    return axios.get(`${API_URL}/message/unread`, {
      params: config,
      headers: { "authorization-token": token },
      cancelToken: new CancelToken(cancel)
    });
  }

  static readMessages(config, cancel) {
    return axios.patch(
      `${API_URL}/message/read`,
      {},
      {
        params: config,
        headers: { "authorization-token": token },
        cancelToken: new CancelToken(cancel)
      }
    );
  }
}
