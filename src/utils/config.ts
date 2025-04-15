export const config = {
  API_BASE:
    process.env.NODE_ENV === "production"
      ? "https://order-mangoes-backend-production.up.railway.app"
      : "http://localhost:3000",
};
