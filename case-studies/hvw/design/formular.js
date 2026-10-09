/* Eigene Fehlermeldungen für Formulare (Kontaktformular und Schaden-Dialog).
   Statt der Standard-Sprechblasen des Browsers steht unter jedem Feld ein roter Hinweis.
   Aufruf: window.pruefeFormular(form) gibt true zurück, wenn alles ausgefüllt ist.
   Die Texte stehen als data-fehler (Pflichtfeld leer) und data-fehler-format (falsches Format) am Feld. */
(function () {
  const STANDARD = 'Bitte füllen Sie dieses Feld aus.';
  const FORMAT = 'Diese Angabe scheint nicht zu stimmen. Bitte prüfen Sie sie.';
  let zaehler = 0;

  function meldungsort(feld) {
    // Checkbox: die ganze Zeile, sonst der Kasten des Feldes
    return feld.type === 'checkbox' ? feld.closest('label') : feld.parentElement;
  }

  function fehlerFeld(feld) {
    let p = feld.fehlerElement;
    if (!p) {
      p = document.createElement('p');
      p.className = 'feld-fehler';
      p.id = 'fehler-' + (feld.id || feld.name || 'feld') + '-' + ++zaehler;
      p.hidden = true;
      const ort = meldungsort(feld);
      ort.insertAdjacentElement(feld.type === 'checkbox' ? 'afterend' : 'beforeend', p);
      feld.fehlerElement = p;
    }
    return p;
  }

  function setze(feld, text) {
    const p = fehlerFeld(feld);
    if (text) {
      p.textContent = text;
      p.hidden = false;
      feld.setAttribute('aria-invalid', 'true');
      feld.setAttribute('aria-describedby', p.id);
    } else {
      p.hidden = true;
      feld.removeAttribute('aria-invalid');
      feld.removeAttribute('aria-describedby');
    }
  }

  function text(feld) {
    if (feld.validity.valueMissing) return feld.dataset.fehler || STANDARD;
    if (feld.validity.typeMismatch || feld.validity.patternMismatch) return feld.dataset.fehlerFormat || FORMAT;
    return feld.validationMessage || FORMAT;
  }

  const FELDER = 'input:not([type=hidden]):not([type=file]):not([type=radio]):not([type=submit]), textarea, select';

  window.pruefeFormular = function (form) {
    let erstes = null;
    form.querySelectorAll(FELDER).forEach((feld) => {
      const ok = feld.checkValidity();
      setze(feld, ok ? '' : text(feld));
      if (!ok && !erstes) erstes = feld;
    });
    if (erstes) erstes.focus();
    return !erstes;
  };

  window.loescheFehler = function (form) {
    form.querySelectorAll(FELDER).forEach((feld) => { if (feld.fehlerElement) setze(feld, ''); });
  };

  // Hinweis verschwindet, sobald das Feld wieder passt
  // (und bleibt der Fehler, passt sich der Text an: erst „fehlt“, dann „falsches Format“)
  function nachAenderung(e) {
    const feld = e.target;
    if (!feld.getAttribute || feld.getAttribute('aria-invalid') !== 'true') return;
    setze(feld, feld.checkValidity() ? '' : text(feld));
  }
  document.addEventListener('input', nachAenderung);
  document.addEventListener('change', nachAenderung);
  document.addEventListener('reset', (e) => window.loescheFehler(e.target));
})();
