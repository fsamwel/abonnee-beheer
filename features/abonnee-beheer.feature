# language: nl
Functionaliteit: Beheren van abonnees voor de gebeurtenissen API
  Dit beschrijft een webapplicatie die abonees beheert voor de gebeurtenissen API.

  De applicatie wordt ontwikkeld in Node js.
  De applicatie gaat in een container draaien.
  
  De applicatie haalt gegevens op en slaat wijzigingen op door de gebeurtenissen API aan te roepen, zoals gespecificeerd op ../specificaties/openapi.yaml.
  De base url wordt in de containerconfiguratie gezet met de "API_BASE_URL" parameter.
  Bij de aanroep van de API wordt een OAuth token meegestuurd. Het endpoint voor vragen van de token wordt in de containerconfiguratie gezet met de "AUTH_BASE_URL" parameter.
  Het token wordt opgehaald met grant_type client_credentials. Daarbij worden de volgende zaken meegestuurd, waarvan de waarde in containerconfiguratie parameters wordt ingevuld:
  - client_id
  - client_secret
  - scope
  - resourceServer

  De site gebruikt een kleurenschema met
  - zwarte tekst
  - donkergrijs (antraciet) als achtergrond voor de titel met witte tekst,
  - lichtgrijs (silver) met donkergrijze rand voor knoppen,
  - lichtgrijze als achtergrond voor meldingen.
  - rode tekst voor foutmeldingen

  De site gebruikt Arial als basis font.
  Knoppen hebben ronde hoeken en bevatten icons van https://fonts.google.com/icons.
  Knoppen zonder tekst zijn vierkant.
  - De bewerken knop heeft icon "edit" en hint-tekst "bewerken".
  - De wissen knop heeft icon "delete" en hint-tekst "wissen".
  - De toevoegen knop heeft icon "add".
  - De bevestigen knoppen (registreren, wissen, toevoegen) hebben icoon "check". Het icoon is groen.
  - De annuleren knop heeft icoon "cancel" en hint-tekst "annuleren".
  - De scherm sluiten knop heeft icoon "arrow_back".

  Lijsten bevatten de naam van het item plus een bewerken knop en een wissen knop voor dat item.
  De lijsten wordt zo uitgelijnd dat naam links uitgelijnd wordt en de knoppen rechts uitgelijnd worden.

  Checkboxes worden getoond als switch (https://m3.material.io/components/switch/overview), donkergrijs als aan, lichtgrijs als uit.

  Regel: De applicatie opent met het scherm 'abonnees' die geregistreerde abonnees toont en een knop om een abonnee te registreren
    De applicatie haalt de actuele lijst van geregistreerde abonnees op met GET /abonnees.

    Voor elke geregistreerde abonnee wordt de naam getoond en daarachter de bewerken knop en de wissen knop.

    Scenario: Er zijn nog geen abonnees geregistreerd en de applicatie wordt geopend
      Als de applicatie wordt geopend
      Dan wordt de titel 'Abonnee-beheer' getoond
      En wordt daaronder subtitel 'Abonnees' getoond
      En wordt daaronder de 'toevoegen' knop getoond tekst 'nieuwe abonnee registreren'

    Scenario: Er zijn al abonnees geregistreerd en de applicatie wordt geopend
      Gegeven de gebruiker heeft abonnee 'szw-dtl' geregistreerd
      En de gebruiker heeft abonnee 'jeugdzorg' geregistreerd
      Als de applicatie wordt geopend
      Dan wordt de titel 'Abonnee-beheer' getoond
      En wordt daaronder subtitel 'Abonnees' getoond
      En wordt daaronder abonnee 'szw-dtl' getoond met een bewerken knop en een wissen knop
      En wordt daaronder abonnee 'jeugdzorg' getoond met een bewerken knop en een wissen knop
      En wordt daaronder de 'toevoegen' knop getoond tekst 'nieuwe abonnee registreren'

  Regel: Als de toevoegen knop op het abonnees scherm wordt geklikt kan de gebruiker de naam invullen en de abonnee registreren
    Als op de toevoegen knop wordt geklikt, dan wordt
    - de toevoegen knop verborgen
    - en wordt op die plek een invoervak met label 'naam' getoond
    - en daarnaast de bevestigen knop met tekst 'abonnee registreren'
    - en daarnaast de annuleren knop

    De applicatie registreert de abonnee met POST /abonnees en stuurt de ingevulde naam in de request body.

    De applicatie controleert voor het sturen van het request of de invoer voldoet aan de eisen die bij het veld horen, zoals pattern en minLenght.
    Als in de API specificatie voor het veld een maxLength staat, dan is de maximale invoerlengte voor het invoerveld gelijk aan die maxLength

    Scenario: De gebruiker klikt op de toevoegen knop
      Gegeven de applicatie is geopend en het abonnees scherm wordt getoond
      Als de gebruiker op de 'toevoegen' knop klikt
      Dan wordt de 'toevoegen' knop niet meer getoond
      En wordt een invoerveld getoond met label 'naam'
      En wordt daarnaast de 'bevestigen' knop getoond tekst 'abonnee registreren'
      En wordt daarnaast de 'annuleren' knop getoond

    Scenario: De gebruiker registreert een nieuwe abonnee
      Gegeven de applicatie is geopend en het abonnees scherm wordt getoond
      Als de gebruiker op de 'toevoegen' knop klikt
      En de gebruiker vult de naam 'nova-abo' in
      En de gebruiker op de 'bevestigen' knop klikt
      Dan wordt de titel 'Abonnee-beheer' getoond
      En wordt daaronder subtitel 'Abonnees' getoond
      En wordt daaronder abonnee 'nova-abo' getoond met een bewerken knop en een wissen knop
      En wordt daaronder de 'toevoegen' knop getoond tekst 'nieuwe abonnee registreren'
      En wordt het 'naam' veld niet meer getoond
      En wordt de 'bevestigen' knop niet meer getoond
      En wordt de 'annuleren' knop niet meer getoond

    Scenario: De gebruiker klikt op annuleren en de ingevulde abonnee wordt niet geregistreerd
      Gegeven de applicatie is geopend en het abonnees scherm wordt getoond
      Als de gebruiker op de 'toevoegen' knop klikt
      En de gebruiker vult de naam 'nova-abo' in
      En de gebruiker op de 'annuleren' knop klikt
      Dan wordt de titel 'Abonnee-beheer' getoond
      En wordt daaronder subtitel 'Abonnees' getoond
      En wordt daaronder de 'toevoegen' knop getoond tekst 'nieuwe abonnee registreren'
      En wordt het 'naam' veld niet meer getoond
      En wordt de 'bevestigen' knop niet meer getoond
      En wordt de 'annuleren' knop niet meer getoond

    Scenario: de gebruiker vult een ongeldige naam in
      Gegeven de applicatie is geopend en het abonnees scherm wordt getoond
      Als de gebruiker op de 'toevoegen' knop klikt
      En de gebruiker vult de naam 'foute naam' in
      Dan is de 'bevestigen' knop inactief
      En wordt de foutmelding 'alleen kleine letters (a-z) en een koppelteken (-), geen dubbele koppeltekens (--), minimaal 2 en maximaal 10 tekens, begint en eindigt niet met een koppelteken (-)' onder het veld 'naam' getoond

  Regel: Als de 'bewerken' knop van een abonnee wordt geklikt, dan toont het scherm 'groepen'
    De applicatie haalt de actuele lijst van groepen van de abonnee op met GET /abonnees/{abonneeNaam}/groepen.
    
    Voor elke groep van de abonnee wordt de naam getoond en daarachter de bewerken knop en de wissen knop.

    Scenario: De gebruiker wil een abonnee bewerken
      Gegeven de gebruiker heeft abonnee 'szw-dtl' geregistreerd
      En de gebruiker heeft abonnee 'jeugdzorg' geregistreerd
      En de applicatie is geopend en het abonnees scherm wordt getoond
      Als de gebruiker op de 'bewerken' knop van abonnee 'szw-dtl' klikt
      Dan wordt de titel 'Abonnee-beheer' getoond
      En wordt daaronder de 'scherm sluiten' knop getoond
      En wordt daaronder subtitel 'Abonnee szw-dtl - groepen beheren' getoond
      En wordt daaronder de 'toevoegen' knop getoond tekst 'groep toevoegen'

    Scenario: De gebruiker wil een abonnee bewerken en heeft al groepen
      Gegeven de gebruiker heeft abonnee 'szw-dtl' geregistreerd
      En de gebruiker heeft abonnee 'jeugdzorg' geregistreerd
      En de gebruiker heeft groep 'client' aan abonnee 'szw-dtl' toegevoegd
      En de gebruiker heeft groep 'relatie' aan abonnee 'szw-dtl' toegevoegd
      En de gebruiker heeft groep 'andere' aan abonnee 'jeugdzorg' toegevoegd
      En de applicatie is geopend en het abonnees scherm wordt getoond
      Als de gebruiker op de 'bewerken' knop van abonnee 'szw-dtl' klikt
      Dan wordt de titel 'Abonnee-beheer' getoond
      En wordt daaronder de 'scherm sluiten' knop getoond
      En wordt daaronder subtitel 'Abonnee szw-dtl - groepen beheren' getoond
      En wordt daaronder groep 'client' getoond met een bewerken knop en een wissen knop
      En wordt daaronder groep 'relatie' getoond met een bewerken knop en een wissen knop
      En wordt de groep 'andere' niet getoond
      En wordt daaronder de 'toevoegen' knop getoond tekst 'groep toevoegen'

  Regel: Als de toevoegen knop op het groepen scherm wordt geklikt kan de gebruiker de naam invullen en de groep toevoegen
    Als op de toevoegen knop wordt geklikt, dan wordt
    - de toevoegen knop verborgen
    - en wordt op die plek een invoervak met label 'naam' getoond
    - en daarnaast de bevestigen knop met tekst 'groep toevoegen'
    - en daarnaast de annuleren knop

    De applicatie registreerd de abonnee met POST /abonnees/{abonneeNaam}/groepen.

    De applicatie controleert voor het sturen van het request of de invoer voldoet aan de eisen die bij het veld horen, zoals pattern en minLenght.
    Als in de API specificatie voor het veld een maxLength staat, dan is de maximale invoerlengte voor het invoerveld gelijk aan die maxLength

    Scenario: De gebruiker klikt op de toevoegen knop
      Gegeven de gebruiker heeft abonnee 'szw-dtl' geregistreerd
      En de applicatie is geopend en het groepen scherm van abonnee 'szw-dtl' wordt getoond
      Als de gebruiker op de 'toevoegen' knop klikt
      Dan wordt de 'toevoegen' knop niet meer getoond
      En wordt een invoerveld getoond met label 'naam'
      En wordt daarnaast de 'bevestigen' knop getoond tekst 'groep toevoegen'
      En wordt daarnaast de 'annuleren' knop getoond

    Scenario: De gebruiker registreert een nieuwe abonnee
      Gegeven de gebruiker heeft abonnee 'szw-dtl' geregistreerd
      En de applicatie is geopend en het groepen scherm van abonnee 'szw-dtl' wordt getoond
      Als de gebruiker op de 'toevoegen' knop klikt
      En de gebruiker vult de naam 'nova-groep' in
      En de gebruiker op de 'bevestigen' knop klikt
      Dan wordt de titel 'Abonnee-beheer' getoond
      En wordt daaronder de 'scherm sluiten' knop getoond
      En wordt daaronder subtitel 'Abonnee szw-dtl - groepen beheren' getoond
      En wordt daaronder groep 'nova-groep' getoond met een bewerken knop en een wissen knop
      En wordt daaronder de 'toevoegen' knop getoond tekst 'groep toevoegen'
      En wordt het 'naam' veld niet meer getoond
      En wordt de 'bevestigen' knop niet meer getoond
      En wordt de 'annuleren' knop niet meer getoond

    Scenario: De gebruiker klikt op annuleren en de ingevulde abonnee wordt niet geregistreerd
      Gegeven de gebruiker heeft abonnee 'szw-dtl' geregistreerd
      En de applicatie is geopend en het groepen scherm van abonnee 'szw-dtl' wordt getoond
      Als de gebruiker op de 'toevoegen' knop klikt
      En de gebruiker vult de naam 'nova-groep' in
      En de gebruiker op de 'annuleren' knop klikt
      Dan wordt de titel 'Abonnee-beheer' getoond
      En wordt daaronder de 'scherm sluiten' knop getoond
      En wordt daaronder subtitel 'Abonnee szw-dtl - groepen beheren' getoond
      En wordt daaronder groep 'nova-groep' getoond met een bewerken knop en een wissen knop
      En wordt daaronder de 'toevoegen' knop getoond tekst 'groep toevoegen'
      En wordt de groep 'nova-groep' niet getoond
      En wordt het 'naam' veld niet meer getoond
      En wordt de 'bevestigen' knop niet meer getoond
      En wordt de 'annuleren' knop niet meer getoond

    Scenario: de gebruiker vult een ongeldige naam in
      Gegeven de gebruiker heeft abonnee 'szw-dtl' geregistreerd
      En de applicatie is geopend en het groepen scherm van abonnee 'szw-dtl' wordt getoond
      Als de gebruiker op de 'toevoegen' knop klikt
      En de gebruiker vult de naam 'foute naam' in
      Dan is de 'bevestigen' knop inactief
      En wordt de foutmelding 'alleen kleine letters (a-z) en een koppelteken (-), geen dubbele koppeltekens (--), minimaal 2 en maximaal 10 tekens, begint en eindigt niet met een koppelteken (-)' onder het veld 'naam' getoond

  Regel: Als op het 'groepen' scherm de 'scherm sluiten' knop wordt geklikt, dan wordt het 'abonnees' scherm getoond

    Scenario: De gebruiker sluit het 'groepen' scherm
      Gegeven de gebruiker heeft abonnee 'szw-dtl' geregistreerd
      En de applicatie is geopend en het groepen scherm van abonnee 'szw-dtl' wordt getoond
      Als de gebruiker op de 'scherm sluiten' knop klikt
      Dan wordt de titel 'Abonnee-beheer' getoond
      En wordt daaronder subtitel 'Abonnees' getoond
      En wordt daaronder abonnee 'szw-dtl' getoond met een bewerken knop en een wissen knop
      En wordt daaronder de 'toevoegen' knop getoond tekst 'nieuwe abonnee registreren'

  Regel: Als de 'bewerken' knop van een groep wordt geklikt, dan toont het scherm 'gebeurtenistypes'
    De applicatie haalt de actuele lijst van gebeurtenistypes van de abonnee op met GET /abonnees/{abonneeNaam}/groepen/{groepNaam}/gebeurtenistypes.
    
    Alle mogelijke gebeurtenistypes worden getoond:
    - nl.brp.verhuisd.intergemeentelijk
    - nl.brp.verhuisd.naar-buitenland
    - nl.brp.overleden

    Voor elk gebeurtenistype wordt een checkbox getoond met daarachter de naam van het gebeurtenistype, waarbij het deel 'nl.brp.' wordt weggelaten.
    Voor elk gebeurtenistype dat aan de groep is toegevoegd (komt voor in response van GET /abonnees/{abonneeNaam}/groepen/{groepNaam}/gebeurtenistypes), staat de checkbox aan.
    Voor elk gebeurtenistype dat niet aan de groep is toegevoegd (komt niet voor in response van GET /abonnees/{abonneeNaam}/groepen/{groepNaam}/gebeurtenistypes), staat de checkbox uit.

    Scenario: De gebruiker bewerkt een groep
      Gegeven de gebruiker heeft abonnee 'szw-dtl' geregistreerd
      En de gebruiker heeft groep 'client' aan abonnee 'szw-dtl' toegevoegd
      En de applicatie is geopend en het groepen scherm van abonnee 'szw-dtl' wordt getoond
      Als de gebruiker op de 'bewerken' knop van groep 'client' klikt
      Dan wordt de titel 'Abonnee-beheer' getoond
      En wordt daaronder de 'scherm sluiten' knop getoond
      En wordt daaronder subtitel 'Abonnee szw-dtl - groep client - gebeurtenistypes' getoond
      En wordt daaronder een switch die uit staat getoond met tekst 'verhuisd.intergemeentelijk'
      En wordt daaronder een switch die uit staat getoond met tekst 'verhuisd.naar-buitenland'
      En wordt daaronder een switch die uit staat getoond met tekst 'overleden'

    Scenario: De gebruiker heeft al een gebeurtenistype toegevoegd
      Gegeven de gebruiker heeft abonnee 'szw-dtl' geregistreerd
      En de gebruiker heeft groep 'client' aan abonnee 'szw-dtl' toegevoegd
      En de gebruiker heeft gebeurtenistype 'verhuisd.naar-buitenland' aan groep 'client' van abonnee 'szw-dtl' toegevoegd
      En de gebruiker heeft groep 'derde' aan abonnee 'szw-dtl' toegevoegd
      En de gebruiker heeft gebeurtenistype 'overleden' aan groep 'derde' van abonnee 'szw-dtl' toegevoegd
      En de applicatie is geopend en het groepen scherm van abonnee 'szw-dtl' wordt getoond
      Als de gebruiker op de 'bewerken' knop van groep 'client' klikt
      Dan wordt de titel 'Abonnee-beheer' getoond
      En wordt daaronder de 'scherm sluiten' knop getoond
      En wordt daaronder subtitel 'Abonnee szw-dtl - groep client - gebeurtenistypes' getoond
      En wordt daaronder een switch die uit staat getoond met tekst 'verhuisd.intergemeentelijk'
      En wordt daaronder een switch die aan staat getoond met tekst 'verhuisd.naar-buitenland'
      En wordt daaronder een switch die uit staat getoond met tekst 'overleden'

  Regel: Een gebeurtenistype wordt toegevoegd aan een groep wanneer de gebruiker de switch bij dat gebeurtenistype aan zet
    De applicatie voegt het gebeurtenistype toe met POST /abonnees/{abonneeNaam}/groepen/{groepNaam}/gebeurtenistypes
    en stuurt het betreffende gebeurtenistype in de request body.

    Scenario: De gebruiker voegt een gebeurtenistype toe aan de groep
      Gegeven de gebruiker heeft abonnee 'szw-dtl' geregistreerd
      En de gebruiker heeft groep 'client' aan abonnee 'szw-dtl' toegevoegd
      En de applicatie is geopend en het gebeurtenistypes scherm van groep 'client' van abonnee 'szw-dtl' wordt getoond
      Als de gebruiker de switch bij 'verhuisd.naar-buitenland' aan zet
      Dan is het gebeurtenistype 'nl.brp.verhuisd.naar-buitenland' toegevoegd aan groep 'client' van abonnee 'szw-dtl'

  Regel: Een gebeurtenistype wordt verwijderd uit een groep wanneer de gebruiker de switch bij het gebeurtenistype uit zet
  De applicatie verwijdert het gebeurtenistype met DELETE /abonnees/{abonneeNaam}/groepen/{groepNaam}/gebeurtenistypes/{gebeurtenistype}

    Scenario: De gebruiker verwijdert een gebeurtenistype uit de groep
      Gegeven de gebruiker heeft abonnee 'szw-dtl' geregistreerd
      En de gebruiker heeft groep 'client' aan abonnee 'szw-dtl' toegevoegd
      En de gebruiker heeft gebeurtenistype 'verhuisd.naar-buitenland' aan groep 'client' van abonnee 'szw-dtl' toegevoegd
      En de applicatie is geopend en het gebeurtenistypes scherm van groep 'client' van abonnee 'szw-dtl' wordt getoond
      Als de gebruiker de switch bij 'verhuisd.naar-buitenland' uit zet
      Dan is het gebeurtenistype 'nl.brp.verhuisd.naar-buitenland' toegevoegd aan groep 'client' van abonnee 'szw-dtl'

  Regel: Als op het 'gebeurtenistypes' scherm de 'scherm sluiten' knop wordt geklikt, dan wordt het 'groepen' scherm getoond

    Scenario: De gebruiker sluit het 'groepen' scherm
      Gegeven de gebruiker heeft abonnee 'szw-dtl' geregistreerd
      En de gebruiker heeft groep 'client' aan abonnee 'szw-dtl' toegevoegd
      En de applicatie is geopend en het gebeurtenistypes scherm van groep 'client' van abonnee 'szw-dtl' wordt getoond
      Als de gebruiker op de 'scherm sluiten' knop klikt
      Dan wordt de titel 'Abonnee-beheer' getoond
      En wordt daaronder de 'scherm sluiten' knop getoond
      En wordt daaronder subtitel 'Abonnee szw-dtl - groepen beheren' getoond
      En wordt daaronder groep 'client' getoond met een bewerken knop en een wissen knop
      En wordt daaronder de 'toevoegen' knop getoond tekst 'groep toevoegen'
      