import { config } from "../config/index.js";

export interface CloudflareZone {
  id: string;
  name: string;
  status: string;
}

export interface CloudflareOAuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export class CloudflareService {
  private async makeRequest(endpoint: string, options: RequestInit = {}, accessToken?: string) {
    const url = `${config.cloudflare.apiBaseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudflare API error: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  async exchangeCodeForTokens(code: string): Promise<CloudflareOAuthTokens> {
    const response = await fetch(`${config.cloudflare.oauthBaseUrl}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: config.cloudflare.clientId,
        client_secret: config.cloudflare.clientSecret,
        redirect_uri: config.cloudflare.redirectUri,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OAuth token exchange failed: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  async getUserZones(accessToken: string): Promise<CloudflareZone[]> {
    const response = await this.makeRequest('/zones', {}, accessToken);
    return response.result || [];
  }

  async createWorkerRoute(zoneId: string, pattern: string, script: string, accessToken: string): Promise<string> {
    // First, upload the worker script
    const scriptResponse = await this.makeRequest(
      `/accounts/${await this.getAccountId(accessToken)}/workers/scripts/seo-discoverly`,
      {
        method: 'PUT',
        body: script,
        headers: {
          'Content-Type': 'application/javascript',
        },
      },
      accessToken
    );

    // Then create the route
    const routeResponse = await this.makeRequest(
      `/zones/${zoneId}/workers/routes`,
      {
        method: 'POST',
        body: JSON.stringify({
          pattern,
          script: 'seo-discoverly',
        }),
      },
      accessToken
    );

    return routeResponse.result.id;
  }

  private async getAccountId(accessToken: string): Promise<string> {
    const response = await this.makeRequest('/accounts', {}, accessToken);
    const accounts = response.result || [];
    if (accounts.length === 0) {
      throw new Error('No Cloudflare accounts found');
    }
    return accounts[0].id;
  }

  async revokeTokens(accessToken: string): Promise<void> {
    await fetch(`${config.cloudflare.oauthBaseUrl}/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        token: accessToken,
        client_id: config.cloudflare.clientId,
        client_secret: config.cloudflare.clientSecret,
      }),
    });
  }
}
