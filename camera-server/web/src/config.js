// config.js
const isProduction = false;

export const api = isProduction
  ? "http://kemettech.com"
  : "http://localhost:3001";
