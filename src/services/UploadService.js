import axios from "axios";
import { CLOUDINARY_URL } from "../globals";

export default class UploadService {
  static uploadImage(data) {
    return axios.post(CLOUDINARY_URL, data);
  }
}
