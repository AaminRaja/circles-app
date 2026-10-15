import { io } from "socket.io-client";
import { getAccessToken } from "./tokenStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// A single shared socket connection for the whole app — created once,
// reused everywhere (not one-per-component), same spirit as your axios
// `api` instance in client.js.
const socket = io(API_URL, {
  autoConnect: false, // we connect manually, once auth is ready — see AuthContext
  withCredentials: true,
});

// Called after login/register/session-restore, so the socket authenticates
// with the CURRENT access token. If the token changes (e.g. after a silent
// refresh), reconnecting picks up the new one.
export function connectSocket() {
  socket.auth = { token: getAccessToken() };
  if (!socket.connected) {
    socket.connect();
  }
}

export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}

export default socket;
