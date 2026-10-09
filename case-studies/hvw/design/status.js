/* Öffnungsstatus: füllt alle Elemente mit [data-oeffnungsstatus] anhand der Öffnungszeiten.
   Grundlage ist immer die Uhrzeit in Geldern (Europe/Berlin), egal wo die Besucher:in gerade ist.
   An gesetzlichen Feiertagen in Nordrhein-Westfalen ist das Büro geschlossen. */
(function () {
  // Wochentag 0 = Sonntag … 6 = Samstag, Zeiten in Minuten ab Mitternacht
  const ZEITEN = {
    1: [510, 990], 2: [510, 990], 3: [510, 990], 4: [510, 990], // Mo–Do 8:30–16:30
    5: [510, 750]                                              // Fr 8:30–12:30
  };
  const TAGE_LANG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const uhr = (min) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}`;
  const schluessel = (d) => d.toISOString().slice(0, 10); // d ist ein UTC-Datum ohne Uhrzeit

  // Ostersonntag nach der Gaußschen Osterformel (gregorianischer Kalender)
  function ostern(jahr) {
    const a = jahr % 19, b = Math.floor(jahr / 100), c = jahr % 100;
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const monat = Math.floor((h + l - 7 * m + 114) / 31);
    const tag = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(Date.UTC(jahr, monat - 1, tag));
  }

  const cache = {};
  function feiertage(jahr) {
    if (cache[jahr]) return cache[jahr];
    const o = ostern(jahr);
    const nachOstern = (tage) => schluessel(new Date(o.getTime() + tage * 86400000));
    const fest = (m, t) => schluessel(new Date(Date.UTC(jahr, m - 1, t)));
    return (cache[jahr] = new Set([
      fest(1, 1),          // Neujahr
      nachOstern(-2),      // Karfreitag
      nachOstern(1),       // Ostermontag
      fest(5, 1),          // Tag der Arbeit
      nachOstern(39),      // Christi Himmelfahrt
      nachOstern(50),      // Pfingstmontag
      nachOstern(60),      // Fronleichnam (NRW)
      fest(10, 3),         // Tag der Deutschen Einheit
      fest(11, 1),         // Allerheiligen (NRW)
      fest(12, 25),        // 1. Weihnachtstag
      fest(12, 26)         // 2. Weihnachtstag
    ]));
  }
  const istFeiertag = (d) => feiertage(d.getUTCFullYear()).has(schluessel(d));

  function jetztInGeldern() {
    const teile = new Intl.DateTimeFormat('de-DE', {
      timeZone: 'Europe/Berlin', year: 'numeric', month: 'numeric', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date());
    const wert = (typ) => Number(teile.find((t) => t.type === typ).value);
    return {
      datum: new Date(Date.UTC(wert('year'), wert('month') - 1, wert('day'))),
      minuten: wert('hour') * 60 + wert('minute')
    };
  }

  function status() {
    const { datum, minuten } = jetztInGeldern();
    const feiertagHeute = istFeiertag(datum);
    const heute = feiertagHeute ? null : ZEITEN[datum.getUTCDay()];
    if (heute && minuten >= heute[0] && minuten < heute[1]) {
      return { offen: true, text: `Jetzt geöffnet · bis ${uhr(heute[1])} Uhr` };
    }
    // nächste Öffnung suchen (heute später oder an einem der nächsten Tage, Feiertage überspringen)
    const kopf = feiertagHeute ? 'Heute Feiertag – geschlossen' : 'Gerade geschlossen';
    for (let i = 0; i < 14; i++) {
      const tag = new Date(datum.getTime() + i * 86400000);
      const z = ZEITEN[tag.getUTCDay()];
      if (!z || istFeiertag(tag) || (i === 0 && minuten >= z[0])) continue;
      const wann = i === 0 ? 'heute' : i === 1 ? 'morgen' : `am ${TAGE_LANG[tag.getUTCDay()]}`;
      return { offen: false, text: `${kopf} · wieder ${wann} ab ${uhr(z[0])} Uhr` };
    }
    return { offen: false, text: kopf };
  }

  function aktualisieren() {
    const s = status();
    document.querySelectorAll('[data-oeffnungsstatus]').forEach((el) => {
      if (el.dataset.oeffnungsstatus === 'notfall') {
        // Zweizeilig: Zustand fett, darunter die Erklärung
        const [kopf, rest] = s.text.split(' · ');
        const text = document.createElement('span');
        const strong = document.createElement('strong');
        strong.textContent = kopf;
        text.append(strong, document.createElement('br'),
          rest ? (s.offen ? rest : rest.charAt(0).toUpperCase() + rest.slice(1) + '. Im Notfall trotzdem anrufen.')
               : 'Im Notfall trotzdem anrufen.');
        el.replaceChildren(text);
      } else {
        el.textContent = s.text;
      }
      el.classList.toggle('zu', !s.offen);
      el.hidden = false;
    });
  }

  aktualisieren();
  setInterval(aktualisieren, 60 * 1000);
})();
