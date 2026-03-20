// ═══════════════════════════════════════════════════════════════════
//  PharmaGuard Auth Config — Edit users here to change credentials
// ═══════════════════════════════════════════════════════════════════

export const AUTH_CONFIG = {
  // ── SESSION ────────────────────────────────────────────────────
  SESSION_KEY: "pg_auth_session",
  TOKEN_KEY:   "pg_auth_token",
  SESSION_DURATION_MS: 24 * 60 * 60 * 1000, // 24 hours

  // ── REGISTERED USERS ──────────────────────────────────────────
  // To add/change users: edit this array.
  // Passwords are plain-text here for demo purposes.
  // In production, replace with hashed passwords + backend API.
  USERS: [
    {
      id: "usr_001",
      email: "gourav@pharmaguard.com",
      password: "Gourav@123",
      name: "Gourav Sharma",
      role: "clinician",
      title: "Dr.",
      institution: "All India Institute of Medical Sciences",
      avatar: "GS",
      avatarGradient: "linear-gradient(135deg,#0B5ED7,#20C997)",
      joinedDate: "Jan 2024",
      stats: { analyses: 312, reports: 241, accuracy: "98.4%" },
    },
    {
      id: "usr_002",
      email: "aditya@pharmaguard.com",
      password: "Aditya@456",
      name: "Aditya Kumar",
      role: "researcher",
      title: "Dr.",
      institution: "PGIMER Chandigarh",
      avatar: "AK",
      avatarGradient: "linear-gradient(135deg,#20C997,#0B5ED7)",
      joinedDate: "Mar 2024",
      stats: { analyses: 178, reports: 134, accuracy: "97.9%" },
    },
    {
      id: "usr_003",
      email: "kanishka@pharmaguard.com",
      password: "Kanishka@789",
      name: "Kanishka Verma",
      role: "pharmacist",
      title: "Dr.",
      institution: "Safdarjung Hospital Delhi",
      avatar: "KV",
      avatarGradient: "linear-gradient(135deg,#6EA8FE,#0B5ED7)",
      joinedDate: "Feb 2024",
      stats: { analyses: 205, reports: 167, accuracy: "99.1%" },
    },
  ],
};

// ── AUTH UTILITIES ──────────────────────────────────────────────

/** Find user by email + password. Returns user object or null. */
export function authenticateUser(email, password) {
  const user = AUTH_CONFIG.USERS.find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase().trim() &&
      u.password === password
  );
  return user || null;
}

/** Check if a registered email exists (for "email not found" messages). */
export function emailExists(email) {
  return AUTH_CONFIG.USERS.some(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim()
  );
}

/** Save session to localStorage. */
export function saveSession(user) {
  const session = {
    userId: user.id,
    name:   user.name,
    email:  user.email,
    role:   user.role,
    avatar: user.avatar,
    avatarGradient: user.avatarGradient,
    institution: user.institution,
    title: user.title,
    stats: user.stats,
    loginTime: Date.now(),
    expiresAt: Date.now() + AUTH_CONFIG.SESSION_DURATION_MS,
  };
  localStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, `pg_tok_${user.id}_${Date.now()}`);
  return session;
}

/** Load and validate session from localStorage. Returns session or null. */
export function loadSession() {
  try {
    const raw = localStorage.getItem(AUTH_CONFIG.SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session || !session.expiresAt) return null;
    if (Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

/** Clear session (logout). */
export function clearSession() {
  localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
  localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
}

/** Check if currently authenticated. */
export function isAuthenticated() {
  return loadSession() !== null;
}