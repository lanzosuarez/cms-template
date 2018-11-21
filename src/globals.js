export const AUTH_SERVICE_URL =
  "https://auth-service-v1.azurewebsites.net/api/v1";

export const API_URL =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000/api/v1"
    : "https://sm-supermalls-api.azurewebsites.net/api/v1";

export const CLOUDINARY_UPLOAD_PRESET = "s3aqucwc";
export const CLOUDINARY_URL =
  "https://api.cloudinary.com/v1_1/chatbotph/upload";

export const APP_NAME = "smsupermalls";
export const JOIN = "JOIN";
export const LOGOUT = "LOGOUT";
export const DISCONNECT = "ORDER";
export const NEW_QUEUE = "NEW_QUEUE";
export const END_QUEUE = "END_QUEUE";
export const CLIENT_MESSAGE = "CLIENT_MESSAGE";
export const ADMIN_MESSAGE = "ADMIN_MESSAGE";
export const AGENT_MESSAGE = "AGENT_MESSAGE";
export const ACTIVE_USER = "#87d068";
export const DEACTIVATED = "#f50"

