import { createContext, useEffect, useReducer, useCallback } from "react";
import axios from "axios"; // CUSTOM LOADING COMPONENT

import { LoadingProgress } from "@/components/loader";

import { globalConstants } from "@/utils/constants";

// Get API URL from environment variables with fallback to localhost for development
// Support both VITE_API_URL and VITE_BASE_URL for backward compatibility
const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL || "http://localhost:5000/api/v1";
axios.defaults.baseURL = API_URL;

console.log("API URL:", API_URL); // Log the API URL being used (helpful for debugging)

axios.defaults.headers.common["Accept"] = "application/json";

// ==============================================================
const initialState = {
  user: null,
  isInitialized: false,
  isAuthenticated: false,
};

const setSession = (accessToken) => {
  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    localStorage.removeItem("accessToken");
    delete axios.defaults.headers.common.Authorization;
  }
};

const reducer = (state, action) => {
  switch (action.type) {
    case "INIT":
      return {
        isInitialized: true,
        user: action.payload.user,
        isAuthenticated: action.payload.isAuthenticated,
      };

    case "LOGIN":
      return { ...state, isAuthenticated: true, user: action.payload.user };

    case "LOGOUT":
      return { ...state, user: null, isAuthenticated: false };

    case "REGISTER":
      return { ...state, isAuthenticated: true, user: action.payload.user };

    default:
      return state;
  }
}; // ==============================================================

// ==============================================================
export const AuthContext = createContext({});
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState); // USER LOGIN HANDLER

  const login = useCallback(async (phone_number, password) => {
    const { data } = await axios.post(`${API_URL}/register/phone_number`, {
      phone_number,
      password,
    });
    setSession(data.data.token);
    dispatch({
      type: "LOGIN",
      payload: {
        user: data,
        isAuthenticated: false,
      },
    });
  }, []); // USER REGISTER HANDLER

  const register = useCallback(async (name, email, password) => {
    const { data } = await axios.post(`${API_URL}/users`, {
      name,
      email,
      password,
    });
    setSession(data.data.token);
    dispatch({
      type: "REGISTER",
      payload: {
        user: data,
        isAuthenticated: true,
      },
    });
  }, []); // USER LOGOUT HANDLER

  const logout = () => {
    setSession(null);
    dispatch({
      type: "LOGOUT",
      payload: {
        user: null,
        isAuthenticated: false,
      },
    });
  };

  const checkCurrentUser = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        setSession(accessToken);
        const { data } = await axios.get(`${API_URL}/auth/get_profile`);

        dispatch({
          type: "INIT",
          payload: {
            user: data,
            isAuthenticated: true,
          },
        });
        console.log("session isAuthenticated two");
      } else {
        console.log("session is not Authenticated one");

        dispatch({
          type: "INIT",
          payload: {
            user: null,
            isAuthenticated: false,
          },
        });
        console.log("session is not Authenticated two");
      }
    } catch (err) {
      dispatch({
        type: "INIT",
        payload: {
          user: null,
          isAuthenticated: false,
        },
      });
      console.log("error in session  Authenticated");
    }
  }, []);

  useEffect(() => {
    const getData = window.localStorage.getItem("settings");
    // const settingDataLocal = JSON.parse(getData);
    const settingDataLocal = getData ? JSON.parse(getData) : null;
    axios.defaults.headers.common["x-current-language"] =
      settingDataLocal?.direction === "rtl" ? "ar" : "";
    checkCurrentUser();
  }, []);

  if (!state.isInitialized) return <LoadingProgress />;
  return (
    <AuthContext.Provider
      value={{ ...state, method: "JWT", login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
