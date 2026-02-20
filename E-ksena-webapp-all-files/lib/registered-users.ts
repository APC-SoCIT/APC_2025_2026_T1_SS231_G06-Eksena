import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import type { RoleThemeKey } from '@/constants/theme';

const TABLE = 'responder_accounts';
const STORAGE_KEY = 'eksena_registered_users';

export type RegisteredUser = {
  email: string;
  username: string;
  password: string;
  role: RoleThemeKey;
};

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

// ---------- Local storage fallback (when Supabase table is not set up) ----------
async function getLocalUsers(): Promise<RegisteredUser[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RegisteredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveLocalUser(user: RegisteredUser): Promise<void> {
  const list = await getLocalUsers();
  const emailLower = normalize(user.email);
  const idx = list.findIndex((u) => normalize(u.email) === emailLower);
  const row = {
    email: user.email.trim(),
    username: user.username.trim(),
    password: user.password,
    role: user.role,
  };
  if (idx >= 0) list[idx] = row;
  else list.push(row);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

async function findLocalUser(emailOrUsername: string, password: string): Promise<RegisteredUser | null> {
  const list = await getLocalUsers();
  const input = normalize(emailOrUsername);
  const user = list.find(
    (u) =>
      (normalize(u.email) === input || normalize(u.username) === input) && u.password === password
  );
  return user ?? null;
}

// ---------- Database (Supabase) ----------
/** Find a registered user by email or username and password. Tries Supabase first, then local storage. */
export async function findRegisteredUser(
  emailOrUsername: string,
  password: string
): Promise<RegisteredUser | null> {
  const input = normalize(emailOrUsername);
  if (!input || !password) return null;

  try {
    const encoded = encodeURIComponent(input);
    const { data, error } = await supabase
      .from(TABLE)
      .select('email, username, password, role')
      .or(`email_lower.eq.${encoded},username_lower.eq.${encoded}`)
      .limit(1)
      .maybeSingle();

    if (!error && data && data.password === password) {
      return {
        email: data.email,
        username: data.username,
        password: data.password,
        role: data.role as RoleThemeKey,
      };
    }
  } catch {
    // fall through to local
  }

  return findLocalUser(emailOrUsername, password);
}

/** Register: try Supabase first; if it fails (e.g. table missing), save locally so registration still works. */
export async function registerUser(user: RegisteredUser): Promise<void> {
  const email = user.email.trim();
  const username = user.username.trim();
  const emailLower = normalize(email);
  const usernameLower = normalize(username);

  try {
    const row = {
      email,
      email_lower: emailLower,
      username,
      username_lower: usernameLower,
      password: user.password,
      role: user.role,
    };
    const { error } = await supabase.from(TABLE).upsert(row, {
      onConflict: 'email_lower',
      ignoreDuplicates: false,
    });
    if (error) throw error;
    return;
  } catch {
    // Table might not exist yet or Supabase not configured — save locally so registration still works
    await saveLocalUser({ email, username, password: user.password, role: user.role });
  }
}
