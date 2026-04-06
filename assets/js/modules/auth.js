// assets/js/modules/auth.js

const SESSION_KEY = "admin_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Check if user is logged in
export function isAuthenticated() {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return false;
  
  try {
    const sessionData = JSON.parse(session);
    // Check if session is expired
    if (Date.now() > sessionData.expiresAt) {
      logout();
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

// Get current user
export function getCurrentUser() {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return null;
  
  try {
    return JSON.parse(session);
  } catch (e) {
    return null;
  }
}

// Login function
export function login(username, password) {
  // Simple authentication - in production, use proper backend authentication
  // For demo: username "admin" with password "admin123"
  if (username === "admin" && password === "admin123") {
    const session = {
      username: username,
      loginAt: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true };
  }
  return { success: false, message: "Username atau password salah" };
}

// Logout function
export function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "index.html";
}

// Protect page - redirect to login if not authenticated
export function protectPage() {
  if (!isAuthenticated()) {
    window.location.href = "index.html";
    return false;
  }
  return true;
}

// Check authentication and redirect
export function requireAuth() {
  if (!protectPage()) {
    return false;
  }
  return true;
}
