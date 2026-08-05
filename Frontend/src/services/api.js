import axios from "axios";
import { toast } from "react-hot-toast"; // অথবা তোমার পছন্দের যেকোনো টোস্ট লাইব্রেরি
import { store } from "../store/store"; // Redux স্টোর ইম্পোর্ট
import { logout } from "../Features/auth/authSlice";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // কুকি পাঠানোর জন্য
});

// Request Interceptor: টোকেন বসানোর জন্য (আগের প্ল্যান অনুযায়ী)
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: গ্লোবাল এরর হ্যান্ডলার
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response ? error.response.status : null;
    const errorMessage =
      error.response?.data?.message || "Something went wrong";

    // অ্যাপ ক্র্যাশ না করিয়ে ক্রিটিক্যাল স্ট্যাটাস হ্যান্ডেল করা
    switch (status) {
      case 401:
        // Token Expired বা Unauthorized
        toast.error("Session expired. Please login again.");
        store.dispatch(logout()); // Redux থেকে ইউজার ক্লিয়ার করে লগআউট
        window.location.href = "/"; // রিডাইরেক্ট
        break;

      case 403:
        // IDOR অ্যাটাক বা আনঅথরাইজড রোলের এক্সেস
        toast.error(`Access Denied: ${errorMessage}`);
        break;

      case 409:
        // Conflict: যেমন ডাবল বুকিং লক-এ আটকে গেলে
        toast.error("Slot is currently busy, try again.");
        break;

      case 422:
        // Unprocessable Entity: Vision AI-তে অস্পষ্ট প্রেসক্রিপশন দিলে
        toast.error(
          "ছবিটি অস্পষ্ট। অনুগ্রহ করে আলোতে স্পষ্ট ছবি তুলে আবার আপলোড করুন।",
        );
        break;

      case 429:
        // Too Many Requests: রেডিজ রেট-লিমিটারে ব্লক হলে
        toast.error("You are requesting too fast. Please slow down.");
        break;

      default:
        // অন্যান্য সার্ভার এরর (500)
        toast.error("Server Error: " + errorMessage);
    }

    // এররটি থ্রো করে দাও যেন নির্দিষ্ট কম্পোনেন্টেও চাইলে লোকাল লজিক চালানো যায়
    return Promise.reject(error);
  },
);

export default api;
