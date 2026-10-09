/* Mobile feste Leisten: schaffen mehr Platz zum Lesen.
   – Der Header blendet sich beim Runterscrollen aus und beim Hochscrollen wieder ein.
   – Die Aktionsleiste unten blendet sich aus, solange auf der Seite schon dieselbe Aktion zu sehen ist
     (Elemente mit data-leiste-aus, z. B. der Schaden-melden-Button im Kopfbereich der Mieter-Seite). */
(function () {
  const mobil = window.matchMedia('(max-width: 899px)');
  const header = document.querySelector('header');
  const menue = document.getElementById('menu-toggle');
  if (!header) return;

  // Header
  let letzterWert = window.scrollY;
  let wartet = false;
  function pruefen() {
    wartet = false;
    const y = Math.max(0, window.scrollY);
    const unterschied = y - letzterWert;
    if (!mobil.matches || (menue && menue.checked) || y < 80) {
      header.classList.remove('header-weg');
    } else if (unterschied > 6) {
      header.classList.add('header-weg');
    } else if (unterschied < -6) {
      header.classList.remove('header-weg');
    }
    if (Math.abs(unterschied) > 6) letzterWert = y;
  }
  window.addEventListener('scroll', () => {
    if (!wartet) { wartet = true; requestAnimationFrame(pruefen); }
  }, { passive: true });
  // Wer per Tastatur in den Header springt, soll ihn auch sehen
  header.addEventListener('focusin', () => header.classList.remove('header-weg'));
  if (menue) menue.addEventListener('change', () => header.classList.remove('header-weg'));

  // Aktionsleiste
  const ziele = document.querySelectorAll('[data-leiste-aus]');
  if (ziele.length && 'IntersectionObserver' in window) {
    const sichtbar = new Set();
    const beobachter = new IntersectionObserver((eintraege) => {
      eintraege.forEach((e) => (e.isIntersecting ? sichtbar.add(e.target) : sichtbar.delete(e.target)));
      document.body.classList.toggle('leiste-aus', sichtbar.size > 0);
    }, { threshold: 0.15 });
    ziele.forEach((z) => beobachter.observe(z));
  }
})();
