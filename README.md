# Abonnee-beheer

Webapplicatie voor het beheren van abonnees op de BRP Gebeurtenissen API, gebouwd volgens
`features/abonnee-beheer.feature`. De applicatie is geschreven in Node.js (Express) en draait
in een container.

## Schermen

1. **Abonnees** — toont geregistreerde abonnees (naam + bewerken/wissen) en een knop om een
   nieuwe abonnee te registreren (`GET`/`POST /abonnees`, `DELETE /abonnees/{abonneeNaam}`).
2. **Groepen** — na klikken op "bewerken" bij een abonnee: toont de groepen van die abonnee en
   een knop om een groep toe te voegen (`GET`/`POST /abonnees/{abonneeNaam}/groepen`,
   `DELETE .../groepen/{groepNaam}`).
3. **Gebeurtenistypes** — na klikken op "bewerken" bij een groep: toont de drie mogelijke
   gebeurtenistypes als switches (aan = toegevoegd aan de groep). Aan-/uitzetten roept direct
   `POST`/`DELETE .../gebeurtenistypes` aan.

## Architectuur

De browser praat nooit rechtstreeks met de Gebeurtenissen API. De Node.js-server:

- serveert de statische frontend (`public/`);
- haalt zelf een OAuth `client_credentials` token op bij `AUTH_BASE_URL` (en cachet dit tot
  vlak voor het verloopt);
- proxyt de aanroepen van de frontend (`/api/...`) 1-op-1 door naar `API_BASE_URL`, met het
  token als `Authorization: Bearer` header.

Zo blijft `client_secret` altijd op de server en wordt deze nooit naar de browser gestuurd.

## Containerconfiguratie

De volgende parameters worden als environment variables aan de container meegegeven:

| Variabele        | Omschrijving                                                         |
|-------------------|-----------------------------------------------------------------------|
| `API_BASE_URL`    | Basis-URL van de Gebeurtenissen API                                  |
| `AUTH_BASE_URL`   | Volledige URL van het OAuth token endpoint                           |
| `client_id`       | OAuth client id                                                      |
| `client_secret`   | OAuth client secret                                                  |
| `scope`           | OAuth scope (optioneel)                                              |
| `resourceServer`  | Resource server parameter voor het token request (optioneel)         |
| `PORT`            | Poort waarop de applicatie luistert (optioneel, default `3000`)      |

Zie `.env.example` voor een voorbeeld.

## Lokaal draaien (zonder container)

```bash
npm install
cp .env.example .env   # vul de juiste waarden in
npm start
```

De applicatie is dan bereikbaar op http://localhost:3000.

## Draaien in een container

```bash
docker build -t abonnee-beheer .
docker run --rm -p 3000:3000 \
  -e API_BASE_URL=https://probeerbrpapi.rvig.nl/api/brp \
  -e AUTH_BASE_URL=https://probeerbrpapi.rvig.nl/realms/brp-api/protocol/openid-connect/token \
  -e client_id=... \
  -e client_secret=... \
  -e scope=... \
  -e resourceServer=... \
  abonnee-beheer
```

## Validatie van invoervelden

De naam van een abonnee en van een groep worden clientside gevalideerd tegen het patroon uit
`openapi.yaml` (`^[a-z0-9]+(?:-[a-z0-9]+)*$`, minimaal 2 tekens). De maximale invoerlengte van
het veld is gelijk aan de `maxLength` uit de API-specificatie (64 tekens). De bevestigen-knop is
inactief zolang de ingevulde naam niet geldig is, en de foutmelding uit de feature-specificatie
wordt onder het veld getoond.

## Vormgeving

De vormgeving volgt de stijlgids uit de feature-specificatie: zwarte tekst, een antracietkleurige
titelbalk met witte tekst, silverkleurige knoppen met ronde hoeken en een donkergrijze rand,
lichtgrijze meldingen, rode foutmeldingen, het lettertype Arial, iconen van
[Google Fonts Material Icons](https://fonts.google.com/icons), en checkboxes die als
Material Design 3 switches worden getoond.

## Aanname

De feature-specificatie is op één punt intern niet consistent: bij het openen van het
groepenscherm van een abonnee zonder groepen wordt in één scenario subtitel "... - groepen"
verwacht, terwijl drie andere scenario's "... - groepen beheren" verwachten. Deze applicatie
toont consistent "Abonnee {naam} - groepen beheren".
