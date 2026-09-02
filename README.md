# Helena Stickelbroeck — Portfolio

Statische Portfolio-Website (einfaches HTML/CSS, kein Build-Prozess).

## Struktur

```
index.html              Startseite (Hero, About, Experience, Work-Vorschau, Contact)
case-studies/            Eine Unterseite pro Projekt
  swell.html
  fitness-first.html
  project-3.html
css/style.css            Gesamtes Styling (Farben/Fonts als CSS-Variablen oben in der Datei)
assets/                  Bilder etc.
```

## Lokal ansehen

Einfach `index.html` im Browser öffnen, oder z. B.:

```
python3 -m http.server 8000
```

und dann `http://localhost:8000` aufrufen.

## Offene Punkte

- [ ] Projektbeschreibungen für die 3 Work-Karten (Swell, Fitness First, drittes Projekt)
- [ ] Case-Study-Seiten inhaltlich füllen
- [ ] Contact-E-Mail eintragen (aktuell Platzhalter `PLATZHALTER@example.com`)
- [ ] LinkedIn-Link eintragen (aktuell Platzhalter)
- [ ] Entscheidung: "People talk about me" Sektion (Testimonials) hinzufügen oder nicht
- [ ] Deployment auf Netcup einrichten (ersetzt aktuelle WordPress-Seite)
