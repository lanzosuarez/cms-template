export const AUTH_SERVICE_URL =
  "https://auth-service-v1.azurewebsites.net/api/v1";

export const API_URL =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000/api/v1"
    : "https://sm-supermalls-api.azurewebsites.net/api/v1";

export const JOIN = "JOIN";
export const LOGOUT = "LOGOUT";
export const DISCONNECT = "ORDER";
export const NEW_QUEUE = "NEW_QUEUE";
export const CLIENT_MESSAGE = "CLIENT_MESSAGE";
export const ADMIN_MESSAGE = "ADMIN_MESSAGE";
export const AGENT_MESSAGE = "AGENT_MESSAGE";
