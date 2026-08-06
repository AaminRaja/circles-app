// The access token lives only in memory, never in localStorage or a cookie
// readable by JS. This limits the damage an XSS attack could do — even if
// malicious script ran on the page, it can't read this token out of storage,
// since it's just a variable inside this module's closure.
//
// On a full page reload, this resets to null — the AuthContext then calls
// POST /api/auth/refresh (which relies on the httpOnly refresh cookie the
// browser sends automatically) to silently obtain a fresh access token.

let accessToken = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token;
}

// Called by AuthContext once, so the axios client can notify it when a
// refresh attempt fails (e.g. refresh token expired/invalid) — at that point
// the app should treat the user as logged out.
let onAuthFailure = null;

export function registerAuthFailureHandler(handler) {
  onAuthFailure = handler;
}

export function triggerAuthFailure() {
  if (onAuthFailure) onAuthFailure();
}
