import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Role, User } from "../types";
import { SEED_USERS } from "../data/seed";
import { genId, loadJSON, saveJSON } from "../utils/storage";

interface AuthContextValue {
  user: User | null;
  allUsers: User[];
  loading: boolean;
  login: (
    email: string,
    password: string,
    role: Role
  ) => Promise<{ ok: boolean; error?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    address?: string;
    role: Role;
  }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USERS_KEY = "users";
const SESSION_KEY = "session_user_id";

// Demo accounts that should no longer be available
const DEMO_EMAILS = [
  "customer@labahub.com",
  "staff@labahub.com",
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedUsers = await loadJSON<User[] | null>(USERS_KEY, null);
      const initialUsers = storedUsers ?? SEED_USERS;
      const users = initialUsers.filter(
        (u) => !DEMO_EMAILS.includes(u.email.toLowerCase())
      );
      await saveJSON(USERS_KEY, users);

      const sessionId = await loadJSON<string | null>(SESSION_KEY, null);

      setAllUsers(users);

      if (sessionId) {
        const found = users.find((u) => u.id === sessionId) ?? null;
        setUser(found);
      }

      setLoading(false);
    })();
  }, []);

  const login = useCallback<AuthContextValue["login"]>(
    async (email, password, role) => {
      const normalized = email.trim().toLowerCase();

      const found = allUsers.find(
        (u) =>
          u.email.toLowerCase() === normalized &&
          u.role === role
      );

      if (!found) {
        return {
          ok: false,
          error:
            "No account found for that email and role. Try registering.",
        };
      }

      if (found.password !== password) {
        return {
          ok: false,
          error: "Incorrect password.",
        };
      }

      setUser(found);
      await saveJSON(SESSION_KEY, found.id);

      return { ok: true };
    },
    [allUsers]
  );

  const register = useCallback<AuthContextValue["register"]>(
    async ({ name, email, password, phone, address, role }) => {
      const normalized = email.trim().toLowerCase();

      if (
        allUsers.some(
          (u) => u.email.toLowerCase() === normalized
        )
      ) {
        return {
          ok: false,
          error: "An account with that email already exists.",
        };
      }

      const newUser: User = {
        id: genId("user"),
        name: name.trim(),
        email: normalized,
        password,
        phone: phone.trim(),
        role,
        address: address?.trim(),
        createdAt: new Date().toISOString(),
      };

      const next = [...allUsers, newUser];

      setAllUsers(next);
      await saveJSON(USERS_KEY, next);

      setUser(newUser);
      await saveJSON(SESSION_KEY, newUser.id);

      return { ok: true };
    },
    [allUsers]
  );

  const logout = useCallback(async () => {
    setUser(null);
    await saveJSON<string | null>(SESSION_KEY, null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        allUsers,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}