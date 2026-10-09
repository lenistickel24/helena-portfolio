/* Karte erst nach Klick laden (Datenschutz): Solange niemand auf „Karte laden“ klickt,
   wird keine Verbindung zu Google aufgebaut. Die Adresse der Karte steht in data-karte. */
document.addEventListener('click', (e) => {
  const knopf = e.target.closest('[data-karte-laden]');
  if (!knopf) return;
  const feld = knopf.closest('[data-karte]');
  if (!feld) return;
  const rahmen = document.createElement('iframe');
  rahmen.src = feld.dataset.karte;
  rahmen.title = feld.dataset.titel || 'Karte';
  rahmen.referrerPolicy = 'no-referrer-when-downgrade';
  feld.replaceChildren(rahmen);
  feld.classList.add('geladen');
});
