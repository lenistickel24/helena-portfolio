/* "Schaden melden" – Dialog, der sich über jeder Seite öffnet.
   Einbinden mit <script src="schaden-dialog.js" defer></script>.
   Öffnet sich bei Klick auf jeden Link mit href="#schaden-melden"
   und direkt beim Laden, wenn die Adresse auf #schaden-melden endet. */
(function () {
  // PLATZHALTER – von Birgit bestätigen oder ändern (siehe offene-fragen-birgit.md):
  // Wie schnell melden wir uns nach einer Schadensmeldung? Die Texte erscheinen im Dialog und in der Bestätigung.
  const RUECKMELDUNG = 'in der Regel innerhalb von 1 Werktag';
  const WOCHENENDE = 'Meldungen vom Wochenende und von Feiertagen bearbeiten wir am nächsten Werktag.';

  const ICON = {
    wasser: 'M12.66 2.58c-.38-.33-.95-.33-1.33 0C6.45 6.88 4 10.62 4 13.8c0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.18-2.45-6.92-7.34-11.22zM7.83 14c.37 0 .67.26.74.62.41 2.22 2.28 2.98 3.64 2.87.43-.02.79.32.79.75 0 .4-.32.73-.72.75-2.13.13-4.62-1.09-5.19-4.12a.75.75 0 0 1 .74-.87z',
    heizung: 'M15 13V5c0-1.66-1.34-3-3-3S9 3.34 9 5v8c-1.21.91-2 2.37-2 4 0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.63-.79-3.09-2-4zm-2-2h-2V5c0-.55.45-1 1-1s1 .45 1 1h-.5c-.28 0-.5.22-.5.5s.22.5.5.5h.5v2h-.5c-.28 0-.5.22-.5.5s.22.5.5.5h.5v2z',
    strom: 'M10.67 21c-.35 0-.62-.31-.57-.66L11 14H7.5c-.88 0-.33-.75-.31-.78 1.26-2.23 3.15-5.53 5.65-9.93a.577.577 0 0 1 1.07.37l-.9 6.34h3.51c.4 0 .62.19.4.66-3.29 5.74-5.2 9.09-5.75 10.05-.1.18-.29.29-.5.29z',
    sonstiges: 'M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    foto: 'M3 8c0 .55.45 1 1 1s1-.45 1-1V6h2c.55 0 1-.45 1-1s-.45-1-1-1H5V2c0-.55-.45-1-1-1s-1 .45-1 1v2H1c-.55 0-1 .45-1 1s.45 1 1 1h2v2z M21 6h-3.17l-1.24-1.35A1.99 1.99 0 0 0 15.12 4h-6.4c.17.3.28.63.28 1 0 1.1-.9 2-2 2H6v1c0 1.1-.9 2-2 2-.37 0-.7-.11-1-.28V20c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z M13 11a3 3 0 1 0 0 6 3 3 0 1 0 0-6z',
    schliessen: 'M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z',
    tel: 'm19.23 15.26-2.54-.29a1.99 1.99 0 0 0-1.64.57l-1.84 1.84a15.045 15.045 0 0 1-6.59-6.59l1.85-1.85c.43-.43.64-1.03.57-1.64l-.29-2.52a2.001 2.001 0 0 0-1.99-1.77H5.03c-1.13 0-2.07.94-2 2.07.53 8.54 7.36 15.36 15.89 15.89 1.13.07 2.07-.87 2.07-2v-1.73c.01-1.01-.75-1.86-1.76-1.98z',
    haken: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9.29 16.29 5.7 12.7a.996.996 0 1 1 1.41-1.41L10 14.17l6.88-6.88a.996.996 0 1 1 1.41 1.41l-7.59 7.59a.996.996 0 0 1-1.41 0z'
  };
  const svg = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICON[name]}"/></svg>`;
  const kategorie = (wert, label, aktiv) =>
    `<label class="sd-tile"><input type="radio" name="art" value="${wert}"${aktiv ? ' checked' : ''}>${svg(wert)}<span>${label}</span></label>`;

  const css = `
  dialog.sd { width: 100%; max-width: 100%; max-height: 100%; height: 100%; margin: 0; padding: 0; border: 0; background: transparent; color: var(--text); }
  dialog.sd::backdrop { background: rgba(0,0,0,.55); }
  .sd-flaeche { position: absolute; left: 0; right: 0; bottom: 0; top: 24px; background: #fff; border-radius: var(--radius-karte) var(--radius-karte) 0 0; display: flex; flex-direction: column; overflow: hidden; }
  .sd-kopf { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 20px 24px; border-bottom: 1px solid var(--linie); }
  .sd-kopf h2 { margin: 0; font-size: 1.35rem; }
  .sd-zu { width: 40px; height: 40px; border-radius: 999px; border: 1.5px solid var(--linie); background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0; color: var(--text); flex: none; }
  .sd-zu { transition: background-color .2s ease, border-color .2s ease, color .2s ease; }
  .sd-zu:hover { background: var(--red); border-color: var(--red); color: #fff; }
  .sd-zu svg { width: 20px; height: 20px; fill: currentColor; }
  .sd-inhalt { overflow-y: auto; padding: 24px 24px 32px; }
  .sd-intro { color: var(--text-2); margin: 0 0 20px; }
  .sd-notfall { display: flex; gap: 12px; align-items: flex-start; background: var(--gray); border-radius: 24px; padding: 16px 20px; font-size: .9rem; margin-bottom: 32px; }
  .sd-notfall svg { width: 20px; height: 20px; fill: var(--red); flex: none; margin-top: 2px; }
  .sd-notfall a { color: var(--red); font-weight: 700; text-decoration: none; white-space: nowrap; }
  .sd-schritt { font-size: .78rem; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--red); margin: 0 0 16px; display: block; border: 0; padding: 0; }
  fieldset.sd-gruppe { border: 0; margin: 0 0 32px; padding: 0; min-width: 0; }
  .sd-tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .sd-tile { position: relative; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 20px 12px; border: 1.5px solid var(--linie); border-radius: 24px; cursor: pointer; font-weight: 600; font-size: .92rem; }
  .sd-tile input { position: absolute; opacity: 0; pointer-events: none; }
  .sd-tile svg { width: 26px; height: 26px; fill: var(--text-2); }
  .sd-tile:hover { border-color: var(--text); }
  .sd-tile:has(input:checked) { border-color: var(--red); box-shadow: inset 0 0 0 1px var(--red); }
  .sd-tile:has(input:checked) svg { fill: var(--red); }
  .sd-tile:has(input:focus-visible) { outline: 2px solid var(--black); outline-offset: 2px; }
  .sd-kat-hinweis { margin: 16px 0 0; padding: 14px 18px; border-left: 3px solid var(--red); background: var(--gray); border-radius: 0 16px 16px 0; font-size: .92rem; }
  .sd-kat-hinweis:empty { display: none; }
  .sd-kat-hinweis a { color: var(--red); font-weight: 700; text-decoration: none; white-space: nowrap; }
  .sd-felder { display: grid; gap: 16px; grid-template-columns: 1fr; }
  .sd-feld label { display: block; font-weight: 600; font-size: .9rem; margin-bottom: 8px; }
  .sd-feld label small { font-weight: 400; color: var(--text-2); font-size: .84rem; }
  .sd-feld input, .sd-feld textarea { width: 100%; padding: 13px 14px; border: 1.5px solid var(--linie); border-radius: var(--radius-input); font: inherit; font-size: .95rem; background: #fff; color: var(--text); }
  .sd-feld textarea { min-height: 120px; resize: vertical; }
  .sd-feld input:focus, .sd-feld textarea:focus { outline: none; border-color: var(--black); box-shadow: 0 0 0 3px rgba(0,0,0,.08); }
  .sd-feld label.sd-upload { position: relative; display: flex; margin: 0; font-weight: 400; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 28px 16px; border: 1.5px dashed var(--linie); border-radius: 24px; color: var(--text-2); font-size: .9rem; cursor: pointer; text-align: center; }
  .sd-upload:hover { border-color: var(--red); color: var(--text); }
  .sd-upload svg { width: 28px; height: 28px; fill: var(--red); }
  .sd-upload strong { color: var(--text); }
  .sd-upload input { position: absolute; width: 1px; height: 1px; opacity: 0; }
  .sd-dateien { list-style: none; margin: 12px 0 0; padding: 0; font-size: .86rem; color: var(--text-2); }
  .sd-dateien li { padding: 4px 0; }
  .sd-check { display: flex; gap: 12px; align-items: flex-start; font-size: .9rem; margin: 0 0 24px; cursor: pointer; }
  .sd-check input { width: 20px; height: 20px; margin: 2px 0 0; accent-color: var(--red); flex: none; }
  .sd-check a { color: var(--red); font-weight: 600; }
  .sd-weiter { margin: 0 0 24px; padding: 14px 18px; background: var(--gray); border-radius: 16px; font-size: .92rem; color: var(--text-2); }
  .sd-weiter strong { color: var(--text); }
  .sd-senden { width: 100%; justify-content: center; padding: 16px 24px; font-size: 1rem; }
  .sd-danke { text-align: center; padding: 48px 8px; }
  .sd-danke svg { width: 56px; height: 56px; fill: var(--red); margin: 0 auto 20px; }
  .sd-danke p { color: var(--text-2); max-width: 28em; margin: 0 auto 28px; }
  html.sd-offen { overflow: hidden; }
  @media (min-width: 700px) {
    .sd-tiles { grid-template-columns: repeat(4, 1fr); }
    .sd-felder.zwei { grid-template-columns: 1fr 1fr; }
    .sd-senden { width: auto; }
  }
  @media (min-width: 900px) {
    .sd-flaeche { top: 50%; left: 50%; right: auto; bottom: auto; transform: translate(-50%, -50%); width: 720px; max-height: calc(100% - 64px); border-radius: var(--radius-karte); }
    .sd-kopf { padding: 24px 40px; }
    .sd-inhalt { padding: 32px 40px 40px; }
  }`;

  const html = `
  <dialog class="sd" id="schaden-melden" aria-labelledby="sd-titel">
    <div class="sd-flaeche">
      <div class="sd-kopf">
        <h2 id="sd-titel">Schaden melden</h2>
        <button class="sd-zu" type="button" aria-label="Dialog schließen">${svg('schliessen')}</button>
      </div>
      <div class="sd-inhalt">
        <form class="sd-form" novalidate>
          <p class="sd-intro">Je genauer Ihre Angaben, desto schneller können wir helfen.</p>
          <div class="sd-notfall">${svg('tel')}<span>Akuter Notfall, z. B. Wasserrohrbruch? Bitte nicht das Formular nutzen, sondern sofort anrufen: <a href="tel:+4928319363155">02831-9363155</a></span></div>

          <fieldset class="sd-gruppe">
            <legend class="sd-schritt">1 — Was ist passiert?</legend>
            <div class="sd-tiles">
              ${kategorie('wasser', 'Wasser', true)}
              ${kategorie('heizung', 'Heizung')}
              ${kategorie('strom', 'Strom')}
              ${kategorie('sonstiges', 'Sonstiges')}
            </div>
            <p class="sd-kat-hinweis" aria-live="polite"></p>
          </fieldset>

          <fieldset class="sd-gruppe">
            <legend class="sd-schritt">2 — Wo genau?</legend>
            <div class="sd-felder zwei">
              <div class="sd-feld"><label for="sd-strasse">Straße, Hausnummer</label><input id="sd-strasse" name="strasse" autocomplete="street-address" required data-fehler="Bitte geben Sie an, wo der Schaden ist (Straße und Hausnummer)."></div>
              <div class="sd-feld"><label for="sd-wohnung">Wohnung / Etage</label><input id="sd-wohnung" name="wohnung" placeholder="z. B. 2. OG links"></div>
            </div>
          </fieldset>

          <fieldset class="sd-gruppe">
            <legend class="sd-schritt">3 — Beschreibung</legend>
            <div class="sd-felder">
              <div class="sd-feld"><label for="sd-text">Was ist kaputt?</label><textarea id="sd-text" name="beschreibung" placeholder="Seit wann? Wie stark? Ist der Schaden noch aktiv?" required data-fehler="Bitte beschreiben Sie kurz, was kaputt ist."></textarea></div>
              <div class="sd-feld">
                <label for="sd-fotos">Fotos <small>(freiwillig)</small></label>
                <label class="sd-upload" for="sd-fotos">${svg('foto')}<span><strong>Foto hinzufügen</strong><br>oder hierher ziehen</span><input id="sd-fotos" name="fotos" type="file" accept="image/*" multiple></label>
                <ul class="sd-dateien"></ul>
              </div>
            </div>
          </fieldset>

          <fieldset class="sd-gruppe">
            <legend class="sd-schritt">4 — Kontakt</legend>
            <div class="sd-felder zwei">
              <div class="sd-feld"><label for="sd-name">Name</label><input id="sd-name" name="name" autocomplete="name" required data-fehler="Bitte geben Sie Ihren Namen an."></div>
              <div class="sd-feld"><label for="sd-tel">Telefon</label><input id="sd-tel" name="telefon" type="tel" autocomplete="tel" required data-fehler="Bitte geben Sie eine Telefonnummer an, unter der wir Sie erreichen."></div>
            </div>
          </fieldset>

          <p class="sd-weiter"><strong>So geht es weiter:</strong> Wir melden uns telefonisch bei Ihnen, ${RUECKMELDUNG}. ${WOCHENENDE}</p>

          <label class="sd-check"><input type="checkbox" name="datenschutz" required data-fehler="Bitte bestätigen Sie, dass Sie die Datenschutzhinweise gelesen haben."><span>Ich habe die <a href="datenschutz.html" target="_blank">Datenschutzhinweise</a> gelesen.</span></label>
          <button class="btn btn-primary sd-senden" type="submit">Schaden melden</button>
        </form>
        <div class="sd-danke" hidden>
          ${svg('haken')}
          <h3>Vielen Dank – Ihre Meldung ist bei uns.</h3>
          <p>Wir melden uns telefonisch bei Ihnen, ${RUECKMELDUNG}. ${WOCHENENDE} Wird es in der Zwischenzeit schlimmer, rufen Sie uns bitte direkt an.</p>
          <button class="btn btn-ghost sd-fertig" type="button">Schließen</button>
        </div>
      </div>
    </div>
  </dialog>`;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  document.body.insertAdjacentHTML('beforeend', html);

  const dialog = document.getElementById('schaden-melden');
  // Kurzer Hinweis je Schadensart, wann ein Anruf besser ist als das Formular
  const HINWEISE = {
    wasser: 'Tropft es noch oder steht Wasser in der Wohnung? Dann bitte sofort anrufen (Nummer oben).',
    heizung: 'Fällt die Heizung im Winter komplett aus? Dann bitte anrufen (Nummer oben).',
    strom: 'Riecht es verbrannt oder sprühen Funken? Dann sofort <strong>112</strong> wählen.',
    sonstiges: ''
  };
  const katHinweis = dialog.querySelector('.sd-kat-hinweis');
  function hinweisZeigen() {
    const art = dialog.querySelector('input[name="art"]:checked');
    katHinweis.innerHTML = art ? HINWEISE[art.value] : '';
  }
  dialog.querySelectorAll('input[name="art"]').forEach((r) => r.addEventListener('change', hinweisZeigen));
  const form = dialog.querySelector('.sd-form');
  const danke = dialog.querySelector('.sd-danke');
  const dateiListe = dialog.querySelector('.sd-dateien');

  function oeffnen() {
    form.hidden = false;
    danke.hidden = true;
    hinweisZeigen();
    document.documentElement.classList.add('sd-offen');
    dialog.showModal();
    dialog.querySelector('.sd-inhalt').scrollTop = 0;
  }
  function schliessen() { dialog.close(); }

  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('sd-offen');
    if (location.hash === '#schaden-melden') history.replaceState(null, '', location.pathname + location.search);
  });
  // Klick auf den abgedunkelten Hintergrund schließt den Dialog
  dialog.addEventListener('click', (e) => { if (e.target === dialog) schliessen(); });
  dialog.querySelector('.sd-zu').addEventListener('click', schliessen);
  dialog.querySelector('.sd-fertig').addEventListener('click', schliessen);

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href="#schaden-melden"]');
    if (!link) return;
    e.preventDefault();
    oeffnen();
  });

  dialog.querySelector('#sd-fotos').addEventListener('change', (e) => {
    dateiListe.innerHTML = [...e.target.files].map(f => `<li>${f.name.replace(/[<>&]/g, '')}</li>`).join('');
  });

  // Prototyp: kein Versand, nur Prüfung der Pflichtfelder und Bestätigung
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!window.pruefeFormular(form)) return;
    form.reset();
    dateiListe.innerHTML = '';
    form.hidden = true;
    danke.hidden = false;
    dialog.querySelector('.sd-inhalt').scrollTop = 0;
  });

  if (location.hash === '#schaden-melden') oeffnen();
})();
