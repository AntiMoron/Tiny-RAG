import axios from "axios";

const service = axios.create({
  baseURL: "/",
  timeout: 5000,
});

service.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.hash = "/login";
    }
    return Promise.reject(error);
  }
);

export default service;
