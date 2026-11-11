import { createContext, useCallback, useContext, useEffect, useState, type ReactNode, type FormEvent } from "react";
import { useLocation } from "wouter";
import {
  acceptInvite,
  getSettings,
  getUser,
  handleAuthCallback,
  login as identityLogin,
  logout as identityLogout,
  oauthLogin,
  onAuthChange,
  recoverPassword,
  requestPasswordRecovery,
  signup as identitySignup,
  type AuthProvider as OAuthProvider,
  type Settings,
  type User,
} from "@netlify/identity";

export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** Opens the sign-in dialog. After signing in, the browser goes to `returnTo` if given. */
  login: (returnTo?: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const RETURN_TO_KEY = "fos_return_to";

function toAuthUser(u: User | null): AuthUser | null {
  if (!u) return null;
  const [firstName, ...rest] = (u.name ?? "").trim().split(/\s+/).filter(Boolean);
  return {
    id: u.id,
    email: u.email ?? null,
    firstName: firstName ?? null,
    lastName: rest.length ? rest.join(" ") : null,
    profileImageUrl: u.pictureUrl ?? null,
  };
}

function safeReturnTo(value: string | null | undefined) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : null;
}

type Mode = "login" | "signup" | "forgot" | "recovery" | "invite";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialog, setDialog] = useState<{ mode: Mode; token?: string } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const finishLogin = useCallback(() => {
    setDialog(null);
    const returnTo = safeReturnTo(sessionStorage.getItem(RETURN_TO_KEY));
    sessionStorage.removeItem(RETURN_TO_KEY);
    if (returnTo) navigate(returnTo);
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = onAuthChange((_event, u) => {
      if (!cancelled) setUser(toAuthUser(u));
    });

    (async () => {
      try {
        // Completes OAuth redirects, email confirmations, recovery and invite links.
        const result = await handleAuthCallback();
        if (result?.type === "invite" && result.token) {
          setDialog({ mode: "invite", token: result.token });
        } else if (result?.type === "recovery") {
          setUser(toAuthUser(result.user));
          setDialog({ mode: "recovery" });
        } else if (result?.user) {
          setUser(toAuthUser(result.user));
          if (result.type === "confirmation") setNotice("Email confirmed. Welcome to the Society.");
          finishLogin();
        }
      } catch (err) {
        console.error("Auth callback failed", err);
      }
      try {
        const current = await getUser();
        if (!cancelled) setUser(toAuthUser(current));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback((returnTo?: string) => {
    const target = safeReturnTo(returnTo);
    if (target) sessionStorage.setItem(RETURN_TO_KEY, target);
    else sessionStorage.removeItem(RETURN_TO_KEY);
    setDialog({ mode: "login" });
  }, []);

  const logout = useCallback(async () => {
    await identityLogout();
    setUser(null);
    navigate("/");
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
      {dialog && (
        <AuthDialog
          mode={dialog.mode}
          token={dialog.token}
          onModeChange={(mode) => setDialog({ mode })}
          onClose={() => setDialog(null)}
          onSuccess={(u) => {
            setUser(toAuthUser(u));
            finishLogin();
          }}
        />
      )}
      {notice && !dialog && (
        <div className="fos-auth-toast" onClick={() => setNotice(null)}>
          <style>{AUTH_CSS}</style>
          {notice}
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  github: "GitHub",
  gitlab: "GitLab",
  bitbucket: "Bitbucket",
};

function AuthDialog({
  mode,
  token,
  onModeChange,
  onClose,
  onSuccess,
}: {
  mode: Mode;
  token?: string;
  onModeChange: (mode: Mode) => void;
  onClose: () => void;
  onSuccess: (user: User) => void;
}) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getSettings().then(setSettings).catch(() => setSettings(null));
  }, []);

  useEffect(() => {
    setError(null);
    setMessage(null);
  }, [mode]);

  const providers = settings
    ? (Object.entries(settings.providers) as [OAuthProvider, boolean][]).filter(([p, on]) => on && PROVIDER_LABELS[p])
    : [];

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "login") {
        onSuccess(await identityLogin(email, password));
      } else if (mode === "signup") {
        const u = await identitySignup(email, password, name ? { full_name: name } : undefined);
        if (settings?.autoconfirm || u.confirmedAt) onSuccess(u);
        else setMessage("Check your inbox to confirm your email, then return here to sign in.");
      } else if (mode === "forgot") {
        await requestPasswordRecovery(email);
        setMessage("If that address is registered, a reset link is on its way.");
      } else if (mode === "recovery" && token === undefined) {
        onSuccess(await recoverPasswordForCurrentUser(password));
      } else if (mode === "invite" && token) {
        onSuccess(await acceptInvite(token, password));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const titles: Record<Mode, string> = {
    login: "Enter the Society",
    signup: "Join the Society",
    forgot: "Recover Access",
    recovery: "Choose a New Password",
    invite: "Accept Your Invitation",
  };

  const needsEmail = mode === "login" || mode === "signup" || mode === "forgot";
  const needsPassword = mode !== "forgot";

  return (
    <div className="fos-auth-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <style>{AUTH_CSS}</style>
      <div className="fos-auth-card" role="dialog" aria-modal="true" aria-labelledby="fos-auth-title">
        <button className="fos-auth-close" onClick={onClose} aria-label="Close">×</button>
        <div className="fos-auth-eyebrow">THE FALL OF SOL · CITIZEN REGISTRY</div>
        <h2 id="fos-auth-title" className="fos-auth-title">{titles[mode]}</h2>

        {(mode === "login" || mode === "signup") && providers.length > 0 && (
          <>
            <div className="fos-auth-providers">
              {providers.map(([p]) => (
                <button key={p} type="button" className="fos-auth-provider" onClick={() => oauthLogin(p)}>
                  Continue with {PROVIDER_LABELS[p]}
                </button>
              ))}
            </div>
            <div className="fos-auth-divider"><span>or</span></div>
          </>
        )}

        <form onSubmit={submit} className="fos-auth-form">
          {mode === "signup" && (
            <label>
              <span>Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Darrow of Lykos" />
            </label>
          )}
          {needsEmail && (
            <label>
              <span>Email</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </label>
          )}
          {needsPassword && (
            <label>
              <span>{mode === "login" ? "Password" : "New password"}</span>
              <input
                type="password"
                required
                minLength={mode === "login" ? undefined : 8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </label>
          )}

          {error && <div className="fos-auth-error">{error}</div>}
          {message && <div className="fos-auth-message">{message}</div>}

          <button type="submit" className="fos-auth-submit" disabled={busy || (mode === "signup" && settings?.disableSignup)}>
            {busy ? "..." : mode === "login" ? "SIGN IN" : mode === "signup" ? "CREATE ACCOUNT" : mode === "forgot" ? "SEND RESET LINK" : "SET PASSWORD"}
          </button>
        </form>

        <div className="fos-auth-links">
          {mode === "login" && (
            <>
              {!settings?.disableSignup && <button onClick={() => onModeChange("signup")}>New citizen? Create an account</button>}
              <button onClick={() => onModeChange("forgot")}>Forgot password?</button>
            </>
          )}
          {(mode === "signup" || mode === "forgot") && (
            <button onClick={() => onModeChange("login")}>Already registered? Sign in</button>
          )}
        </div>
        {mode === "signup" && settings?.disableSignup && (
          <div className="fos-auth-message">Registration is invite-only right now.</div>
        )}
      </div>
    </div>
  );
}

// After a recovery link, the user is already signed in; updating the password
// goes through updateUser, which recoverPassword wraps when given the token.
// handleAuthCallback has already consumed the token, so we update directly.
async function recoverPasswordForCurrentUser(password: string): Promise<User> {
  const { updateUser } = await import("@netlify/identity");
  return updateUser({ password });
}
// Keep the import referenced so bundlers don't tree-shake the recovery path differently across versions.
void recoverPassword;

const AUTH_CSS = `
.fos-auth-overlay{position:fixed;inset:0;z-index:1000;background:rgba(3,4,10,.86);backdrop-filter:blur(6px);
  display:flex;align-items:center;justify-content:center;padding:20px;font-family:'Crimson Pro',Georgia,serif}
.fos-auth-card{position:relative;width:100%;max-width:400px;background:linear-gradient(180deg,#0d0b08,#07060a);
  border:1px solid rgba(201,168,76,.35);box-shadow:0 0 60px rgba(201,168,76,.08);padding:34px 30px 26px;color:#cec4a4}
.fos-auth-close{position:absolute;top:10px;right:14px;background:none;border:0;color:rgba(206,196,164,.5);font-size:24px;cursor:pointer}
.fos-auth-close:hover{color:#c9a84c}
.fos-auth-eyebrow{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;color:rgba(201,168,76,.6);margin-bottom:8px}
.fos-auth-title{font-family:'Playfair Display',serif;font-size:28px;font-weight:900;color:#e8dcb5;margin:0 0 20px}
.fos-auth-providers{display:flex;flex-direction:column;gap:8px}
.fos-auth-provider{padding:11px;background:rgba(201,168,76,.05);border:1px solid rgba(201,168,76,.25);color:#e8dcb5;
  font-family:'Space Mono',monospace;font-size:11px;letter-spacing:1px;cursor:pointer}
.fos-auth-provider:hover{border-color:#c9a84c;background:rgba(201,168,76,.1)}
.fos-auth-divider{display:flex;align-items:center;gap:10px;margin:18px 0;color:rgba(206,196,164,.35);
  font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase}
.fos-auth-divider::before,.fos-auth-divider::after{content:"";flex:1;height:1px;background:rgba(201,168,76,.15)}
.fos-auth-form{display:flex;flex-direction:column;gap:14px}
.fos-auth-form label{display:flex;flex-direction:column;gap:6px}
.fos-auth-form label span{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;color:rgba(206,196,164,.55);text-transform:uppercase}
.fos-auth-form input{background:rgba(0,0,0,.4);border:1px solid rgba(201,168,76,.2);color:#e8dcb5;padding:11px 12px;
  font-family:'Crimson Pro',Georgia,serif;font-size:17px;outline:none}
.fos-auth-form input:focus{border-color:#c9a84c}
.fos-auth-submit{margin-top:4px;padding:13px;background:#c9a84c;border:0;color:#0a0806;font-family:'Space Mono',monospace;
  font-weight:700;font-size:11px;letter-spacing:3px;cursor:pointer}
.fos-auth-submit:hover:not(:disabled){background:#e0c068}
.fos-auth-submit:disabled{opacity:.5;cursor:default}
.fos-auth-error{font-size:15px;color:#ff7a6b;border-left:2px solid #c0392b;padding-left:10px}
.fos-auth-message{font-size:15px;color:#cec4a4;border-left:2px solid #c9a84c;padding-left:10px;margin-top:10px}
.fos-auth-links{display:flex;flex-direction:column;align-items:center;gap:8px;margin-top:18px}
.fos-auth-links button{background:none;border:0;color:rgba(206,196,164,.55);font-family:'Crimson Pro',Georgia,serif;
  font-size:15px;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
.fos-auth-links button:hover{color:#c9a84c}
.fos-auth-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:1000;background:#0d0b08;
  border:1px solid rgba(201,168,76,.4);color:#e8dcb5;padding:12px 20px;font-family:'Space Mono',monospace;font-size:11px;
  letter-spacing:1px;cursor:pointer}
`;
