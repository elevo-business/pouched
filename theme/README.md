# POUCHED — Shopify Theme

Ein individualisierbares Shopify **Online Store 2.0** Theme für POUCHED (die Handyhülle mit ausziehbarem Fach). Frauenfokussiert, warm, mit simpler Sans-Typo und voller Ninja-Labs-Conversion-Logik.

## Installieren (2 Wege)

**A) ZIP hochladen (am einfachsten)**
1. Shopify Admin → **Online Store → Themes**
2. **Add theme → Upload zip file** → `pouched-theme.zip` wählen
3. Auf **Customize** klicken (oder erst „Preview"), dann **Publish**

**B) Shopify CLI (für Entwicklung)**
```bash
cd theme
shopify theme dev      # lokale Vorschau mit Live-Reload
shopify theme push     # in den Store schieben
```

## Alles im Editor anpassbar (wie bei jedem Theme)
- **Farben & Schriften:** Theme-Editor → *Theme settings → Colors / Typography* (Standard: warmes Creme/Blush + Rosé, Poppins/Assistant)
- **Produktseite:** Farb- & Modellwähler (aus den Produkt-Optionen „Farbe" + „Modell"), **Bundle-Blöcke** (1/2/3 mit Rabatt %), Rating, Urgency-Texte, Trust-Badges, Akkordeons — alles als Section-Blöcke editierbar
- **Startseite:** Sektionen frei per Drag & Drop (Image Banner, Icon Features, Split Feature, Reviews, FAQ, CTA)

## Damit die Conversion-Logik greift
- Lege ein Produkt mit den Optionen **„Farbe"** (Werte: Blush, Schwarz, Rosé, Mocha, Lavendel, Sage …) und **„Modell"** (iPhone 13–17 …) an. Die Farb-Swatches erkennen die Namen automatisch.
- **Bundle-Rabatte** (2× −15%, 3× −25%) im Frontend sind angezeigt; um sie beim Checkout wirksam zu machen, richte in Shopify eine **automatische Mengenrabatt-Aktion** ein (Discounts → Automatic → „Buy X get Y% off").
- **Klarna / Shop Pay / PayPal / Apple Pay** erscheinen automatisch, sobald sie unter *Settings → Payments* aktiviert sind.
- **Reviews:** aktuell Platzhalter/Foto-Blöcke. Für echte Foto-Reviews eine App wie **Loox** oder **Judge.me** installieren (wie Ninja Labs).

## Struktur
```
layout/theme.liquid          Shell + Theme-CSS-Variablen aus den Settings
config/settings_schema.json  Theme-Settings (Farben, Schriften, Layout …)
sections/main-product.liquid PDP mit Galerie, Optionen, Bundles, Trust, Akkordeons
sections/*.liquid            Home-Sektionen (Banner, Features, Reviews, FAQ, CTA …)
assets/base.css, theme.js    Styles + Warenkorb-/Varianten-/Bundle-Logik
templates/*.json             Seiten-Zusammenstellung (index, product, cart …)
```
