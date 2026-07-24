'use strict';

require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    // We loggen alleen een waarschuwing bij het opstarten; de app start toch,
    // zodat health checks van de container niet stuk lopen op ontbrekende
    // configuratie. Requests naar de API zullen wel falen totdat de
    // configuratie compleet is.
    // eslint-disable-next-line no-console
    console.warn(`Waarschuwing: containerconfiguratie parameter "${name}" is niet gezet.`);
  }
  return value;
}

module.exports = {
  port: process.env.PORT || 3000,

  // Basis-URL van de Gebeurtenis Abonnementen & Bevragen API
  apiBaseUrl: required('API_BASE_URL'),

  // Volledig endpoint (URL) waar het OAuth token wordt opgehaald
  authBaseUrl: required('AUTH_BASE_URL'),

  // OAuth client_credentials parameters
  clientId: required('client_id'),
  clientSecret: required('client_secret'),
  scope: process.env.scope || '',
  resourceServer: process.env.resourceServer || '',
};
