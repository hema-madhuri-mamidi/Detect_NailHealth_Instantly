export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.toString() || "http://127.0.0.1:8000";

export type ApiUser = {
  id: number;
  username: string;
  email: string;
  name: string;
};

export type AuthResponse = {
  token: string;
  user: ApiUser;
};

export type PredictionResponse = {
  id: number;
  prediction: string;
  confidence: number;
  reason?: string;
  deficiency?: string;
  diet?: string;
  created_at: string;
  image_url: string | null;
};

function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

function setToken(token: string | null) {
  if (!token) localStorage.removeItem("auth_token");
  else localStorage.setItem("auth_token", token);
}

async function apiFetch<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (init.auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Token ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const msg =
      (data as any)?.error ||
      (data as any)?.detail ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data as T;
}

export const auth = {
  async register(params: {
    name?: string;
    email?: string;
    username?: string;
    password: string;
  }): Promise<AuthResponse> {
    const body = JSON.stringify(params);
    const data = await apiFetch<AuthResponse>("/api/auth/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    setToken(data.token);
    return data;
  },

  async login(params: {
    email?: string;
    username?: string;
    password: string;
  }): Promise<AuthResponse> {
    const body = JSON.stringify(params);
    const data = await apiFetch<AuthResponse>("/api/auth/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    setToken(data.token);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiFetch("/api/auth/logout/", { method: "POST", auth: true });
    } finally {
      setToken(null);
    }
  },

  async me(): Promise<{ user: ApiUser }> {
    return apiFetch<{ user: ApiUser }>("/api/auth/me/", { method: "GET", auth: true });
  },

  getToken,
};

export const predictions = {
  async predict(image: File): Promise<PredictionResponse> {
    const form = new FormData();
    form.append("image", image);
    return apiFetch<PredictionResponse>("/api/predict/", {
      method: "POST",
      body: form,
      auth: true,
    });
  },

  async list(): Promise<{ results: PredictionResponse[] }> {
    return apiFetch<{ results: PredictionResponse[] }>("/api/predictions/", {
      method: "GET",
      auth: true,
    });
  },
};

