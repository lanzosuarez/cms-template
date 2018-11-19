import axios from "axios";
import { AUTH_SERVICE_URL } from "../globals";
const token = localStorage.getItem("token");
const CancelToken = axios.CancelToken;

export default class AgentService {
  static getAgents(config, cancel) {
    return axios.get(`${AUTH_SERVICE_URL}/user/paginate`, {
      params: config,
      headers: { "authorization-token": token },
      cancelToken: new CancelToken(cancel)
    });
  }

  static getAgentsCount(config, cancel) {
    return axios.get(`${AUTH_SERVICE_URL}/user/paginate_count`, {
      params: config,
      headers: { "authorization-token": token },
      cancelToken: new CancelToken(cancel)
    });
  }

  static getAgent(id, cancel, fields = "") {
    return axios.get(`${AUTH_SERVICE_URL}/user`, {
      params: { by: "id", value: id, fields },
      headers: { "authorization-token": token },
      cancelToken: new CancelToken(cancel)
    });
  }

  static addAgent(data, cancel) {
    return axios.post(`${AUTH_SERVICE_URL}/user`, data, {
      headers: {
        "authorization-token": token
      },
      cancelToken: new CancelToken(cancel)
    });
  }

  static editAgent(data, id, cancel) {
    return axios.patch(`${AUTH_SERVICE_URL}/user/${id}`, data, {
      headers: {
        "authorization-token": token
      },
      cancelToken: new CancelToken(cancel)
    });
  }
}
