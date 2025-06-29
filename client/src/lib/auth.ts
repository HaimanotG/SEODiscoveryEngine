import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  email: string;
  name: string;
  isConnected?: boolean;
}

export interface AuthTokens {
  token: string;
  user: User;
}

class AuthService {
  private tokenKey = "seo_discoverly_token";
  private userKey = "seo_discoverly_user";

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  setAuth(tokens: AuthTokens): void {
    localStorage.setItem(this.tokenKey, tokens.token);
    localStorage.setItem(this.userKey, JSON.stringify(tokens.user));
  }

  clearAuth(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async disconnect(): Promise<void> {
    try {
      await apiRequest("POST", "/api/auth/disconnect");
    } finally {
      this.clearAuth();
    }
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export const authService = new AuthService();
