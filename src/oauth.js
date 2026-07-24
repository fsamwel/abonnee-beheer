'use strict';

const config = require('./config');

let cachedToken = null;
let cachedExpiresAt = 0; // epoch ms

/**
 * Haalt een geldig OAuth access token op (grant_type=client_credentials).
 * Het token wordt gecached totdat het (bijna) verloopt.
 */
async function getAccessToken() {
  const now = Date.now();
  // 30 seconden marge om verlopen tijdens een request te voorkomen
  if (cachedToken && now < cachedExpiresAt - 30_000) {
    return cachedToken;
  }

  const body = new URLSearchParams();
  body.set('grant_type', 'client_credentials');
  body.set('client_id', config.clientId);
  body.set('client_secret', config.clientSecret);
  if (config.scope) body.set('scope', config.scope);
  if (config.resourceServer) body.set('resourceServer', config.resourceServer);

  const response = await fetch(config.authBaseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Ophalen van OAuth token is mislukt (status ${response.status}): ${text}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  const expiresInSeconds = Number(data.expires_in) || 300;
  cachedExpiresAt = Date.now() + expiresInSeconds * 1000;

  return cachedToken;
}

module.exports = { getAccessToken };
