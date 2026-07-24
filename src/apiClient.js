'use strict';

const config = require('./config');
const { getAccessToken } = require('./oauth');

/**
 * Roept de Gebeurtenis Abonnementen & Bevragen API aan.
 * @param {string} method HTTP methode
 * @param {string} path Pad relatief aan API_BASE_URL, bv. "/abonnees"
 * @param {object} [body] optionele request body (wordt als JSON verstuurd)
 * @returns {Promise<{status:number, data:any}>}
 */
async function callApi(method, path, body) {
  const token = await getAccessToken();

  const headers = {
    Authorization: `Bearer ${token}`,
    //Accept: 'application/json',
    Accept: "*/*",
  };
  let requestBody;
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }

  const url = `${config.apiBaseUrl}${path}`;
  const response = await fetch(url, { method, headers, body: requestBody });

  const status = response.status;
  let data = null;
  const text = await response.text();


  console.log(
    `fetch ${method} ${url} ${requestBody}`,
    headers,
    status,
    text
  );
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = text;
    }
  }

  return { status, data };
}

module.exports = { callApi };
