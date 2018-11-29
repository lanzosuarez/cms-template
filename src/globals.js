export const AUTH_SERVICE_URL =
  "https://auth-service-v1.azurewebsites.net/api/v1";

export const API_URL =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000/api/v1"
    : "https://levis-api.herokuapp.com/api/v1";

export const SKU_URL =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:7000/api/v1"
    : "https://chatbot-sku-service.herokuapp.com/api/v1";

export const CLOUDINARY_UPLOAD_PRESET = "s3aqucwc";
export const CLOUDINARY_URL =
  "https://api.cloudinary.com/v1_1/chatbotph/upload";

export const APP_NAME = "levis";
export const JOIN = "JOIN";
export const LOGOUT = "LOGOUT";
export const DISCONNECT = "ORDER";
export const NEW_QUEUE = "NEW_QUEUE";
export const END_QUEUE = "END_QUEUE";
export const CLIENT_MESSAGE = "CLIENT_MESSAGE";
export const ADMIN_MESSAGE = "ADMIN_MESSAGE";
export const AGENT_MESSAGE = "AGENT_MESSAGE";
export const ACTIVE_USER = "#87d068";
export const DEACTIVATED = "#f50";
export const BRAND = "levis";
export const PLACEHOLDER_IMG =
  "http://www.truebeck.com/wp-content/uploads/2016/12/work-item-placeholder.png";

export const CATEGORIES = [
  { label: "MALE", text: "MALE", value: "male" },
  { label: "FEMALE", text: "FEMALE", value: "female" },
  { label: "TOPS", text: "TOPS", value: "tops" },
  { label: "BOTTOMS", text: "BOTTOMS", value: "bottoms" }
];
