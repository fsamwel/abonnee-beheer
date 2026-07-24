'use strict';

// ---- Constanten (afgeleid van de API-specificatie, openapi.yaml) ----

// AbonneeNaam / GroepNaam schema: pattern + minLength. De maximale
// invoerlengte wordt gelijk gezet aan de maxLength uit de API-specificatie (64).
const NAAM_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const NAAM_MIN_LENGTH = 2;
const NAAM_MAX_LENGTH = 64;
const NAAM_FOUTMELDING =
  'alleen kleine letters (a-z) en een koppelteken (-), geen dubbele koppeltekens (--), ' +
  'minimaal 2 en maximaal 10 tekens, begint en eindigt niet met een koppelteken (-)';

// Alle mogelijke gebeurtenistypes (GebeurtenisTypeVanPersoonEnum)
const GEBEURTENISTYPES = [
  'nl.brp.verhuisd.intergemeentelijk',
  'nl.brp.verhuisd.naar-buitenland',
  'nl.brp.overleden',
];

function kortNaam(gebeurtenistype) {
  return gebeurtenistype.replace(/^nl\.brp\./, '');
}

function naamIsGeldig(naam) {
  return (
    typeof naam === 'string' &&
    naam.length >= NAAM_MIN_LENGTH &&
    naam.length <= NAAM_MAX_LENGTH &&
    NAAM_PATTERN.test(naam)
  );
}

// ---- API helpers ----

async function apiCall(method, path, body) {
  const response = await fetch(path, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = null;
    }
  }

  if (!response.ok) {
    const foutmelding = (data && (data.detail || data.title)) || `Onbekende fout (status ${response.status})`;
    const error = new Error(foutmelding);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

const api = {
  getAbonnees: () => apiCall('GET', '/api/abonnees'),
  maakAbonnee: (naam) => apiCall('POST', '/api/abonnees', { naam }),
  verwijderAbonnee: (naam) => apiCall('DELETE', `/api/abonnees/${encodeURIComponent(naam)}`),

  getGroepen: (abonneeNaam) => apiCall('GET', `/api/abonnees/${encodeURIComponent(abonneeNaam)}/groepen`),
  maakGroep: (abonneeNaam, naam) =>
    apiCall('POST', `/api/abonnees/${encodeURIComponent(abonneeNaam)}/groepen`, { naam }),
  verwijderGroep: (abonneeNaam, groepNaam) =>
    apiCall(
      'DELETE',
      `/api/abonnees/${encodeURIComponent(abonneeNaam)}/groepen/${encodeURIComponent(groepNaam)}`
    ),

  getGebeurtenistypes: (abonneeNaam, groepNaam) =>
    apiCall(
      'GET',
      `/api/abonnees/${encodeURIComponent(abonneeNaam)}/groepen/${encodeURIComponent(
        groepNaam
      )}/gebeurtenistypes`
    ),
  voegGebeurtenistypeToe: (abonneeNaam, groepNaam, gebeurtenistype) =>
    apiCall(
      'POST',
      `/api/abonnees/${encodeURIComponent(abonneeNaam)}/groepen/${encodeURIComponent(
        groepNaam
      )}/gebeurtenistypes`,
      { gebeurtenistype }
    ),
  verwijderGebeurtenistype: (abonneeNaam, groepNaam, gebeurtenistype) =>
    apiCall(
      'DELETE',
      `/api/abonnees/${encodeURIComponent(abonneeNaam)}/groepen/${encodeURIComponent(
        groepNaam
      )}/gebeurtenistypes/${encodeURIComponent(gebeurtenistype)}`
    ),
};

// ---- Toast / meldingen ----

let toastTimer = null;
function toonMelding(tekst, isFout) {
  const toast = document.getElementById('toast');
  toast.textContent = tekst;
  toast.classList.toggle('fout', !!isFout);
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.hidden = true;
  }, 5000);
}

// ---- DOM helpers ----

function el(tag, attrs, ...children) {
  const node = document.createElement(tag);
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'class') node.className = value;
      else if (key === 'text') node.textContent = value;
      else if (key.startsWith('on') && typeof value === 'function') {
        node.addEventListener(key.slice(2), value);
      } else if (value !== undefined && value !== null) {
        node.setAttribute(key, value);
      }
    }
  }
  for (const child of children.flat()) {
    if (child === undefined || child === null || child === false) continue;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

function icoonKnop({ icoon, hint, klasse, onClick, groen }) {
  return el(
    'button',
    {
      class: `icon-only${klasse ? ` ${klasse}` : ''}${groen ? ' bevestigen' : ''}`,
      title: hint,
      'aria-label': hint,
      type: 'button',
      onclick: onClick,
    },
    el('span', { class: 'material-icons' }, icoon)
  );
}

function tekstKnop({ icoon, tekst, klasse, onClick, groen, disabled }) {
  const knop = el(
    'button',
    {
      class: klasse || (groen ? 'bevestigen' : ''),
      type: 'button',
      onclick: onClick,
    },
    el('span', { class: 'material-icons' }, icoon),
    el('span', { text: tekst })
  );
  if (disabled) knop.disabled = true;
  return knop;
}

// ---- Navigatie / state ----

const app = document.getElementById('app');

const route = {
  scherm: 'abonnees', // 'abonnees' | 'groepen' | 'gebeurtenistypes'
  abonneeNaam: null,
  groepNaam: null,
};

function ga(naarScherm, params = {}) {
  route.scherm = naarScherm;
  Object.assign(route, params);
  render();
}

async function render() {
  app.innerHTML = '';
  try {
    if (route.scherm === 'abonnees') {
      await renderAbonneesScherm();
    } else if (route.scherm === 'groepen') {
      await renderGroepenScherm();
    } else if (route.scherm === 'gebeurtenistypes') {
      await renderGebeurtenistypesScherm();
    }
  } catch (err) {
    app.appendChild(el('p', { class: 'melding fout', text: err.message }));
  }
}

// ---- Generieke "toevoegen" rij: knop -> invoerveld + bevestigen + annuleren ----

function renderToevoegRij({ container, toevoegTekst, bevestigTekst, labelTekst, onBevestig }) {
  let formulierActief = false;

  function toonToevoegKnop() {
    container.innerHTML = '';
    container.appendChild(
      tekstKnop({
        icoon: 'add',
        tekst: toevoegTekst,
        onClick: () => {
          formulierActief = true;
          toonFormulier();
        },
      })
    );
  }

  function toonFormulier() {
    container.innerHTML = '';

    const input = el('input', {
      type: 'text',
      id: 'naam-invoer',
      maxlength: String(NAAM_MAX_LENGTH),
      autocomplete: 'off',
    });

    const foutmeldingEl = el('p', { class: 'foutmelding', hidden: true });
    const veldWrapper = el(
      'div',
      { class: 'invoer-veld' },
      el('label', { for: 'naam-invoer', text: 'naam' }),
      input,
      foutmeldingEl
    );

    const bevestigKnop = tekstKnop({
      icoon: 'check',
      tekst: bevestigTekst,
      groen: true,
      disabled: true,
      onClick: async () => {
        const naam = input.value;
        if (!naamIsGeldig(naam)) return;
        bevestigKnop.disabled = true;
        try {
          await onBevestig(naam);
          formulierActief = false;
          toonToevoegKnop();
        } catch (err) {
          toonMelding(err.message, true);
          bevestigKnop.disabled = false;
        }
      },
    });

    const annuleerKnop = icoonKnop({
      icoon: 'cancel',
      hint: 'annuleren',
      onClick: () => {
        formulierActief = false;
        toonToevoegKnop();
      },
    });

    function valideer() {
      const naam = input.value;
      const geldig = naam.length === 0 ? false : naamIsGeldig(naam);
      const toonFout = naam.length > 0 && !geldig;
      foutmeldingEl.hidden = !toonFout;
      foutmeldingEl.textContent = toonFout ? NAAM_FOUTMELDING : '';
      veldWrapper.classList.toggle('ongeldig', toonFout);
      bevestigKnop.disabled = !geldig;
    }

    input.addEventListener('input', valideer);

    container.appendChild(
      el('div', { class: 'toevoeg-rij' }, veldWrapper, bevestigKnop, annuleerKnop)
    );
    input.focus();
  }

  if (formulierActief) toonFormulier();
  else toonToevoegKnop();
}

// ---- Scherm: abonnees ----

async function renderAbonneesScherm() {
  app.appendChild(el('h2', { text: 'Abonnees' }));

  const lijst = el('ul', { class: 'item-lijst' });
  app.appendChild(lijst);

  const toevoegContainer = el('div');
  app.appendChild(toevoegContainer);

  async function laadAbonnees() {
    lijst.innerHTML = '';
    const data = await api.getAbonnees();
    const abonnees = (data && data.abonnees) || [];
    for (const abonnee of abonnees) {
      lijst.appendChild(
        el(
          'li',
          {},
          el('span', { class: 'item-naam', text: abonnee.naam }),
          el(
            'span',
            { class: 'item-acties' },
            icoonKnop({
              icoon: 'edit',
              hint: 'bewerken',
              onClick: () => ga('groepen', { abonneeNaam: abonnee.naam }),
            }),
            icoonKnop({
              icoon: 'delete',
              hint: 'wissen',
              onClick: async () => {
                try {
                  await api.verwijderAbonnee(abonnee.naam);
                  await laadAbonnees();
                } catch (err) {
                  toonMelding(err.message, true);
                }
              },
            })
          )
        )
      );
    }
  }

  renderToevoegRij({
    container: toevoegContainer,
    toevoegTekst: 'nieuwe abonnee registreren',
    bevestigTekst: 'abonnee registreren',
    labelTekst: 'naam',
    onBevestig: async (naam) => {
      await api.maakAbonnee(naam);
      await laadAbonnees();
    },
  });

  await laadAbonnees();
}

// ---- Scherm: groepen ----

async function renderGroepenScherm() {
  const { abonneeNaam } = route;

  app.appendChild(
    icoonKnop({ icoon: 'arrow_back', hint: 'terug', klasse: 'terug', onClick: () => ga('abonnees') })
  );
  app.appendChild(el('h2', { text: `Abonnee ${abonneeNaam} - groepen beheren` }));

  const lijst = el('ul', { class: 'item-lijst' });
  app.appendChild(lijst);

  const toevoegContainer = el('div');
  app.appendChild(toevoegContainer);

  async function laadGroepen() {
    lijst.innerHTML = '';
    const data = await api.getGroepen(abonneeNaam);
    const groepen = (data && data.groepen) || [];
    for (const groep of groepen) {
      lijst.appendChild(
        el(
          'li',
          {},
          el('span', { class: 'item-naam', text: groep.naam }),
          el(
            'span',
            { class: 'item-acties' },
            icoonKnop({
              icoon: 'edit',
              hint: 'bewerken',
              onClick: () => ga('gebeurtenistypes', { groepNaam: groep.naam }),
            }),
            icoonKnop({
              icoon: 'delete',
              hint: 'wissen',
              onClick: async () => {
                try {
                  await api.verwijderGroep(abonneeNaam, groep.naam);
                  await laadGroepen();
                } catch (err) {
                  toonMelding(err.message, true);
                }
              },
            })
          )
        )
      );
    }
  }

  renderToevoegRij({
    container: toevoegContainer,
    toevoegTekst: 'groep toevoegen',
    bevestigTekst: 'groep toevoegen',
    labelTekst: 'naam',
    onBevestig: async (naam) => {
      await api.maakGroep(abonneeNaam, naam);
      await laadGroepen();
    },
  });

  await laadGroepen();
}

// ---- Scherm: gebeurtenistypes ----

async function renderGebeurtenistypesScherm() {
  const { abonneeNaam, groepNaam } = route;

  app.appendChild(
    icoonKnop({
      icoon: 'arrow_back',
      hint: 'terug',
      klasse: 'terug',
      onClick: () => ga('groepen', { abonneeNaam }),
    })
  );
  app.appendChild(
    el('h2', { text: `Abonnee ${abonneeNaam} - groep ${groepNaam} - gebeurtenistypes` })
  );

  const lijst = el('ul', { class: 'gebeurtenistype-lijst' });
  app.appendChild(lijst);

  const data = await api.getGebeurtenistypes(abonneeNaam, groepNaam);
  const actief = new Set((data && data.gebeurtenistypes) || []);

  for (const type of GEBEURTENISTYPES) {
    const checkbox = el('input', { type: 'checkbox' });
    checkbox.checked = actief.has(type);

    checkbox.addEventListener('change', async () => {
      const wordtAangezet = checkbox.checked;
      checkbox.disabled = true;
      try {
        if (wordtAangezet) {
          await api.voegGebeurtenistypeToe(abonneeNaam, groepNaam, type);
        } else {
          await api.verwijderGebeurtenistype(abonneeNaam, groepNaam, type);
        }
      } catch (err) {
        checkbox.checked = !wordtAangezet; // terugdraaien bij fout
        toonMelding(err.message, true);
      } finally {
        checkbox.disabled = false;
      }
    });

    const switchLabel = el(
      'label',
      { class: 'switch' },
      checkbox,
      el('span', { class: 'track' }, el('span', { class: 'thumb' }))
    );

    lijst.appendChild(
      el('li', {}, switchLabel, el('span', { class: 'switch-label', text: kortNaam(type) }))
    );
  }
}

render();
