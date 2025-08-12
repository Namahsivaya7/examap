import { useToast } from "@/store/toastStore";
import axiosLib, { AxiosError } from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;
const isServer = typeof window === "undefined";

const api = axiosLib.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const nextAuthToken = "next-auth.session-token";

export const setToken = (token?: string) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

api.interceptors.request.use(async (config) => {
  if (isServer) {
    const { cookies, headers } = await import("next/headers"),
      token = cookies().get(nextAuthToken)?.value;

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ error?: string }>) => {
    const { data, status, config } = error?.response! ?? {};
    const errorToast = useToast.getState().error;
    const errorMessage = data?.error ?? (data as string);
    switch (status) {
      case 400:
      case 401:
      case 403:
      case 404:
      case 417:
        console.error(errorMessage);
        errorToast(errorMessage);
        break;

      case 500:
        errorToast("Something went wrong! we are on it.");
        console.error("/server-error");
        break;
    }

    return Promise.resolve({ data: null });
  }
);

export default api;
