import axios from "axios";
import { useUserStore } from "@/stores/BimStore/user";

export const api = axios.create({
  baseURL: "/",
});

export const apiAuth = axios.create({
  baseURL: "/",
});

apiAuth.interceptors.request.use((config: any): any => {
  const user = useUserStore();
  config.headers.authorization = `Bearer ${user.token}`;
  return config;
});
