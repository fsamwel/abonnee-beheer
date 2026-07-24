'use strict';

const path = require('path');
const express = require('express');
const config = require('./config');
const { callApi } = require('./apiClient');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Kleine helper zodat elke route zijn eigen foutafhandeling niet hoeft te
// herhalen. Fouten van de bovenliggende API (4xx/5xx) worden ongewijzigd
// doorgegeven aan de frontend, zodat deze de foutmelding (Foutbericht) kan tonen.
function proxy(handler) {
  return async (req, res) => {
    try {
      const { status, data } = await handler(req);
      res.status(status).json(data === null ? {} : data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Fout bij aanroepen van de API:', err);
      res.status(502).json({
        title: 'Kan de gebeurtenissen API niet bereiken',
        status: 502,
        detail: err.message,
        code: 'upstreamError',
      });
    }
  };
}

// ---- Abonnees ----
app.get(
  '/api/abonnees',
  proxy(async () => callApi('GET', '/abonnees'))
);

app.post(
  '/api/abonnees',
  proxy(async (req) => callApi('POST', '/abonnees', { naam: req.body.naam }))
);

app.delete(
  '/api/abonnees/:abonneeNaam',
  proxy(async (req) => callApi('DELETE', `/abonnees/${encodeURIComponent(req.params.abonneeNaam)}`))
);

// ---- Groepen ----
app.get(
  '/api/abonnees/:abonneeNaam/groepen',
  proxy(async (req) => callApi('GET', `/abonnees/${encodeURIComponent(req.params.abonneeNaam)}/groepen`))
);

app.post(
  '/api/abonnees/:abonneeNaam/groepen',
  proxy(async (req) =>
    callApi('POST', `/abonnees/${encodeURIComponent(req.params.abonneeNaam)}/groepen`, {
      naam: req.body.naam,
    })
  )
);

app.delete(
  '/api/abonnees/:abonneeNaam/groepen/:groepNaam',
  proxy(async (req) =>
    callApi(
      'DELETE',
      `/abonnees/${encodeURIComponent(req.params.abonneeNaam)}/groepen/${encodeURIComponent(
        req.params.groepNaam
      )}`
    )
  )
);

// ---- Gebeurtenistypes ----
app.get(
  '/api/abonnees/:abonneeNaam/groepen/:groepNaam/gebeurtenistypes',
  proxy(async (req) =>
    callApi(
      'GET',
      `/abonnees/${encodeURIComponent(req.params.abonneeNaam)}/groepen/${encodeURIComponent(
        req.params.groepNaam
      )}/gebeurtenistypes`
    )
  )
);

app.post(
  '/api/abonnees/:abonneeNaam/groepen/:groepNaam/gebeurtenistypes',
  proxy(async (req) =>
    callApi(
      'POST',
      `/abonnees/${encodeURIComponent(req.params.abonneeNaam)}/groepen/${encodeURIComponent(
        req.params.groepNaam
      )}/gebeurtenistypes`,
      { gebeurtenistype: req.body.gebeurtenistype }
    )
  )
);

app.delete(
  '/api/abonnees/:abonneeNaam/groepen/:groepNaam/gebeurtenistypes/:gebeurtenistype',
  proxy(async (req) =>
    callApi(
      'DELETE',
      `/abonnees/${encodeURIComponent(req.params.abonneeNaam)}/groepen/${encodeURIComponent(
        req.params.groepNaam
      )}/gebeurtenistypes/${encodeURIComponent(req.params.gebeurtenistype)}`
    )
  )
);

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Abonnee-beheer luistert op poort ${config.port}`);
});
