import axios from "axios";
import { SKU_URL } from "../globals";
const token = localStorage.getItem("token");

const { CancelToken } = axios;

export default class SkuService {
  static getSkus(config, cancel) {
    return axios.get(`${SKU_URL}/sku/paginate`, {
      params: config,
      headers: { "authorization-token": token },
      cancelToken: new CancelToken(cancel)
    });
  }

  static getSkusCount(config, cancel) {
    return axios.get(`${SKU_URL}/sku/paginate_count`, {
      params: config,
      headers: { "authorization-token": token },
      cancelToken: new CancelToken(cancel)
    });
  }

  static addSku(data, cancel) {
    return axios.post(`${SKU_URL}/sku`, data, {
      headers: { "authorization-token": token },
      cancelToken: new CancelToken(cancel)
    });
  }

  static updateSku(data, id, cancel) {
    return axios.patch(`${SKU_URL}/sku/${id}`, data, {
      headers: { "authorization-token": token },
      cancelToken: new CancelToken(cancel)
    });
  }

  static getProducts(config, cancel) {
    return axios.get(`${SKU_URL}/product/paginate`, {
      params: config,
      headers: { "authorization-token": token },
      cancelToken: new CancelToken(cancel)
    });
  }

  static getProductsCount(config, cancel) {
    return axios.get(`${SKU_URL}/product/paginate_count`, {
      params: config,
      headers: { "authorization-token": token },
      cancelToken: new CancelToken(cancel)
    });
  }

  static addProduct(data, cancel) {
    return axios.post(`${SKU_URL}/product`, data, {
      headers: { "authorization-token": token },
      cancelToken: new CancelToken(cancel)
    });
  }
}
