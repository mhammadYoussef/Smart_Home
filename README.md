# Smart Home

**A local-first, bilingual home energy dashboard that runs in your browser — no accounts, no cloud, no build step.**

Smart Home turns timestamped readings from your home (solar generation, power consumption, grid exchange, battery charge, hot-water and outdoor temperature, heat-pump compressor activity) into a clear, calm dashboard. It is built on plain HTML, CSS and JavaScript, plus a small optional Node.js server and recorder. It has zero npm dependencies.

Smart Home is an independent project built on the open-source [PRMGR Observatory Starter](#license-and-attribution) (MIT). It is not an official PRMGR product.

---

## Contents

- [Project overview](#project-overview)
- [Features](#features)
- [Technology stack](#technology-stack)
- [Project architecture](#project-architecture)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Language support](#language-support)
- [Navigation customization](#navigation-customization)
- [Data sources](#data-sources)
- [Testing](#testing)
- [Project structure](#project-structure)
- [Roadmap](#roadmap)
- [License and attribution](#license-and-attribution)

---

## Project overview

Home energy data usually lives in separate vendor apps, each with its own login, layout and idea of what matters. Smart Home gives you **one local page** that answers a simple question: *what is happening at home right now, and how did we get here?*

Design principles:

- **Local first.** Readings stay on your computer. The optional server only listens on `127.0.0.1` and is read-only.
- **Honest data.** Missing readings stay visible as gaps. Nothing is interpolated, and derived values such as the house load are only shown when the inputs support them.
- **Simple to own.** No framework, bundler, database or package install. Every file is readable and editable.
- **Bring your own adapter.** Smart Home does not talk to devices. You (or a script you write) produce JSON in a documented format, and the dashboard and recorder take it from there.

## Features

All features below are implemented in the current code.

### Dashboard

- **Home overview** with cards for solar generation, site consumption, grid import/export and battery charge.
- An illustrated home scene. The default artwork is generic and replaceable.
- **Buildings split:** total site, garage and house load (house = site − garage). It is shown only when both readings exist and the site load is not smaller than the garage load.
- A data-source badge that distinguishes the synthetic demo, imported files and recorder history (recent or stale).

### Energy and heat-pump monitoring

- A **solar vs. consumption chart** with selectable ranges: last 24 hours, 6 hours or 1 hour.
- A **heat pump** view: hot-water, outdoor and compressor cards, plus hot-water temperature and compressor-frequency charts.
- Charts are drawn as inline SVG at the container's actual size, so labels stay legible on any screen. Hovering over a point shows its value and time; isolated single points can also be reached with the keyboard.
- Lines break wherever a value is missing or samples are more than 10 minutes apart.

### Historical readings

- An **Explore readings** view: pick any measurement, see it over the full dataset, and read how many samples contain it.
- A table of the **12 most recent samples** for the selected measurement. It scrolls horizontally on narrow screens.
- **JSON import** (validated, up to 2 MB) and **JSON export** of the current dataset.
- **Load local recorder:** load history saved by the optional recorder (requires the local server).

### Bilingual interface and RTL

- **English and Arabic** for every piece of interface text, including messages, chart labels, tooltips and import-validation errors.
- Full **right-to-left layout** in Arabic. Readings, units and chart timelines stay left-to-right so numbers remain readable.
- Switching is instant, with no page reload. The choice is remembered.

### Responsive design

- Layouts for desktop, laptop, tablet and phone. The project was checked at 320, 375, 425, 768, 1024, 1440 and 1920 px wide, with no horizontal page overflow.
- Larger 44 px controls on touch screens.
- Respects `prefers-reduced-motion`.

### Customizable navigation

- A sidebar that can be **expanded**, **collapsed** to an icon rail, or **hidden** (reopened with a *Menu* button).
- The sidebar can sit on the **left or right**, independent of the language.
- On phones it becomes a **slide-out drawer** that closes on Escape, a tap outside, a navigation choice, or its close button.
- All preferences are remembered between visits.

## Technology stack

| Layer | Technology |
| --- | --- |
| User interface | HTML5, CSS3 (custom properties, grid, flexbox, logical properties), vanilla JavaScript (ES2022, no framework) |
| Charts | Inline SVG generated in `public/app.js` |
| Localization | A small dictionary module, `public/i18n.js` (no i18n library) |
| Fonts | System font stacks only (sans-serif for text, monospace for labels) |
| Local server and recorder | Node.js 22 or later, built-in modules only (`node:http`, `node:fs`, `node:path`) |
| Tests | Node's built-in test runner (`node --test`) |
| Optional container | `Dockerfile` based on `node:24-alpine` that runs the recorder |
| Preferences | Browser `localStorage` (language, sidebar position, sidebar state) |

There is no `node_modules`, no `npm install` step and no build step.

## Project architecture

```text
 Your equipment ──► your own adapter ──► readings JSON (schema 1)
                                              │
            ┌─────────────────────────────────┼──────────────────────────┐
            │                                 │                          │
   Import in the browser            collector.mjs (recorder)     tools/simulate.mjs
   (stays in the tab)               polls the file every 30 s    (synthetic input for
            │                       ──► data/history.json         practice runs)
            │                                 │
            │                         server.mjs (127.0.0.1 only)
            │                         GET /api/history
            ▼                                 ▼
   ┌──────────────────────── Browser dashboard (public/) ───────────────────────┐
   │ model.js  – metric definitions, schema validation, demo data, house split  │
   │ i18n.js   – English/Arabic dictionaries, error translation                  │
   │ app.js    – rendering, charts, import/export, language and sidebar state    │
   │ config.js – your labels and illustration path                               │
   └─────────────────────────────────────────────────────────────────────────────┘
```

- **Frontend (`public/`).** A static page. `model.js` is shared with Node, so the browser and the recorder validate data with exactly the same rules. The page works without a server, using the built-in demo or imported files.
- **Local server (`server.mjs`).**
  - Binds to `127.0.0.1` (port `8780` by default, or `PORT` from 1024–65535).
  - Accepts only `GET`/`HEAD` requests whose `Host` is `localhost` or `127.0.0.1`.
  - Serves an explicit allow-list of files, plus images under `public/assets/`.
  - Sends a strict Content-Security-Policy.
  - `/api/history` returns the validated recorder history. It responds 404 if there is none yet and 422 if the file is invalid or too large.
- **Data collector (`collector.mjs` + `history.mjs`).**
  - Reads a JSON file that your adapter keeps up to date, every 30 seconds or once with `--once`.
  - Appends only samples newer than the last recorded one and keeps the most recent 5,000.
  - Refuses to mix data from a different `source`.
  - Writes `data/history.json` atomically (temporary file, then rename).
- **JSON processing.** Every dataset, whether demo, import or history, goes through `validate()` in `model.js`. It checks:
  - schema version 1 and 1–5,000 samples;
  - ISO timestamps with a timezone, no more than 5 minutes in the future;
  - known metric keys only;
  - finite numbers or `null`, within each metric's valid range;
  - no duplicate timestamps.

## Getting started

### Prerequisites

- A modern browser. Development testing used Microsoft Edge (Chromium).
- **Optional:** [Node.js](https://nodejs.org/en/download) **22 or later**, for the local server, recorder and tests.

### Get the code

```sh
git clone https://github.com/mhammadYoussef/Smart_Home.git
cd Smart_Home
```

No installation step is needed. The project has no dependencies.

### Option A: open the page directly

Open `public/index.html` in your browser. The synthetic demo loads immediately, and you can import JSON files. *Load local recorder* needs Option B.

### Option B: run the local server (recommended)

```sh
npm start
```

This is equivalent to `node server.mjs`. Then open <http://127.0.0.1:8780>. To use another port, set `PORT`; for example, in PowerShell: `$env:PORT=8790; npm start`. Stop the server with Ctrl+C.

Double-click launchers are included: `start-windows.cmd` (Windows) and `start.command` (macOS). Both check that Node.js is installed, then run `node server.mjs`.

### Try the recorder with synthetic data

Use three terminals, all in the project folder:

```sh
# 1. Generate a synthetic reading into examples/current-reading.json every 30 s
node tools/simulate.mjs

# 2. Record new samples from that file into data/history.json every 30 s
npm run record

# 3. Serve the dashboard
npm start
```

Open the dashboard and click **Load local recorder**. Click it again to refresh; each load is a snapshot. Both `tools/simulate.mjs` and the recorder accept `--once` for a single run. To record your own adapter's output, run `node collector.mjs --input path/to/your-readings.json`.

## Configuration

Edit **`public/config.js`**:

| Key | Purpose |
| --- | --- |
| `title` | Overview page heading. Leave empty to use the built-in English/Arabic text. |
| `subtitle` | Text under the heading. Leave empty for the translated default. |
| `houseLabel`, `garageLabel` | Names used in the buildings split. Leave empty for the translated defaults. |
| `illustration` | Path to a local SVG/PNG/WebP image for the overview scene. |

Text you set in `config.js` is shown as-is in both languages. Remote URLs are ignored for the illustration. If your image fails to load, the generic artwork is used and a message explains why.

Other customization points:

- **Interface text:** `public/i18n.js`.
- **Metrics, units and colours:** `public/model.js`.
- **Look and layout:** `public/style.css`. Colours are CSS variables in `:root`.

Never put passwords, tokens or device addresses in `public/`. Those belong in your private adapter.

## Language support

- **Languages:** English (default) and Arabic.
- **Switching:** use the button in the page header. It shows *العربية* in English and *English* in Arabic. The change applies immediately: text, `lang`, `dir`, accessible labels, chart labels and any message currently on screen.
- **Saved preference:** stored in `localStorage` under `smart-home-lang` and restored on the next visit.
- **RTL:**
  - Arabic sets `dir="rtl"` and `lang="ar"`; layout uses CSS logical properties.
  - Readings, units (`kW`, `°C`, `Hz`, `%`) and chart time axes stay left-to-right.
  - Arabic dates use Western digits to match the readings.
  - Letter-spacing is turned off and the sans-serif system font is used, so Arabic letters join correctly.
- **What is not translated:** JSON property names, metric keys, units, and text that comes from your data (for example an imported dataset's `source`).
- **Adding or editing text:** each language is a flat dictionary in `public/i18n.js` with identical keys. Static page text is wired with `data-i18n`, `data-i18n-label` (for `aria-label`) and `data-i18n-alt` attributes. The test suite fails if a key is missing in either language.

## Navigation customization

| Control | Where | What it does |
| --- | --- | --- |
| « / » | Sidebar header | Collapse the sidebar to an icon rail, or expand it again. In the rail, labels remain available to screen readers and as tooltips. |
| ⇄ | Sidebar header | Move the sidebar to the other side of the screen. |
| × | Sidebar header | Hide the sidebar completely. On phones, close the drawer. |
| ☰ Menu | Page header | Shown when the sidebar is hidden, and always on phones. Reopens the sidebar, or opens the drawer. |

- **Position is independent of language.** Arabic can use a left sidebar and English a right one; the text direction does not change. Until you choose, the sidebar follows the reading direction: left in English, right in Arabic.
- **Content adapts automatically.** The dashboard expands into the freed space, and charts redraw at the new width.
- **Phones (≤ 700 px):** the sidebar becomes a drawer that slides in from the chosen side, with a dimmed backdrop. While the drawer is open:
  - the page behind it cannot be focused;
  - keyboard focus moves into the drawer;
  - Escape, a tap outside, choosing a page or the close button closes it, and focus returns to the Menu button.
- **Persistence:** stored in `localStorage` as `smart-home-nav-side` (`left`/`right`) and `smart-home-nav-state` (`expanded`/`collapsed`/`hidden`).
- **Keyboard:** all controls are native buttons. A hidden sidebar is skipped when you press Tab.

## Data sources

| Source | What it is | Where it lives |
| --- | --- | --- |
| **Synthetic demo** (default) | 24 hours of generated 5-minute samples, including a deliberate gap. Clearly labelled as not a real home. | Generated in the browser on every load |
| **Imported file** | Any schema-1 JSON you choose with *Import readings*, for example `examples/readings.json` (also synthetic). | Only in the current tab's memory. Reloading returns to the demo; use *Export JSON* to keep a copy. |
| **Recorder history** | Samples saved by `collector.mjs` from a file your adapter writes. | `data/history.json` on your computer (git-ignored) |

**Real device readings require your own adapter.** Smart Home does not include device drivers, automatic discovery, authentication, live streaming or device control. The included `examples/homey-export.homeyscript.js` is a manual, read-only HomeyScript template that you configure with your own device IDs. It is not an automatic integration and has not been validated against live hardware in this project.

- Data format reference: [`docs/DATA-FORMAT.md`](docs/DATA-FORMAT.md)
- Adapter guidance: [`docs/CONNECTIONS.md`](docs/CONNECTIONS.md)

Supported measurements:

| Key | Unit | Meaning |
| --- | --- | --- |
| `solar` | W | Solar generation |
| `siteLoad` | W | Total site consumption |
| `garage` | W | Garage submeter (part of `siteLoad`) |
| `gridNet` | W | Grid exchange: positive import, negative export |
| `batterySOC` | % | Battery state of charge |
| `hotWater` | °C | Hot-water temperature |
| `outdoor` | °C | Outdoor temperature |
| `compressor` | Hz | Heat-pump compressor frequency (not power) |

## Testing

```sh
npm test
```

This runs `node --test test/*.test.mjs` with Node's built-in runner and needs no dependencies. The suite covers:

- **`test/starter.test.mjs`:**
  - demo data validity and real gaps;
  - rejection of malformed imports (types, ranges, unknown keys, bad or future timestamps, duplicates);
  - the house-split rules and chart gap handling;
  - recorder deduplication and source separation;
  - server behaviour: allow-listed files only, blocked writes and foreign `Host` headers, validated history and CSP.
- **`test/i18n.test.mjs`:**
  - English and Arabic have identical, non-empty keys, and the Arabic entries are actually translated;
  - every key used by the page and the app exists;
  - interpolation and fallback work;
  - all validation errors translate to Arabic and stay unchanged in English.

Browser layout checks (viewports, RTL, sidebar states, drawer behaviour) were run during development with a headless browser. They are not part of the repository's automated suite.

## Project structure

```text
Smart_Home/
├── public/                     # The dashboard (static files)
│   ├── index.html              # Page structure, translation keys
│   ├── style.css               # Theme, responsive layout, RTL, sidebar states
│   ├── app.js                  # Rendering, charts, import/export, language & navigation state
│   ├── model.js                # Metrics, validation, demo data (shared with Node)
│   ├── i18n.js                 # English/Arabic dictionaries and helpers
│   ├── config.js               # Your labels and illustration path
│   └── assets/
│       └── starter-house.svg   # Generic home illustration (MIT)
├── server.mjs                  # Local read-only server (127.0.0.1)
├── collector.mjs               # Recorder CLI: input file → data/history.json
├── history.mjs                 # Recorder storage logic (validate, dedupe, atomic write)
├── tools/
│   ├── simulate.mjs            # Writes synthetic readings for practice
│   └── package.mjs             # Builds a release ZIP from an allow-list into release/
├── examples/
│   ├── readings.json           # Synthetic dataset to import
│   ├── current-reading.json    # Synthetic recorder input (updated by tools/simulate.mjs)
│   └── homey-export.homeyscript.js  # Manual, read-only HomeyScript template
├── docs/
│   ├── DATA-FORMAT.md          # Schema 1 reference
│   ├── CONNECTIONS.md          # Writing your own adapter
│   └── VERIFICATION.md         # Verification record from the upstream v1.0.0 release
├── test/
│   ├── starter.test.mjs        # Model, recorder and server tests
│   └── i18n.test.mjs           # Translation coverage tests
├── Dockerfile                  # Optional container that runs the recorder
├── start-windows.cmd           # Windows launcher for the server
├── start.command               # macOS launcher for the server
├── package.json                # npm scripts (no dependencies)
├── CHANGELOG.md
├── THIRD-PARTY-NOTICES.md
└── LICENSE                     # MIT
```

Generated at runtime: `data/` (recorder history, git-ignored) and `release/` (written by `npm run package`; the ZIP and checksum are git-ignored).

**npm scripts** (from `package.json`):

| Command | Runs |
| --- | --- |
| `npm start` | `node server.mjs` |
| `npm run record` | `node collector.mjs --input examples/current-reading.json` |
| `npm test` | `node --test test/*.test.mjs` |
| `npm run package` | `node tools/package.mjs` (release ZIP, checksum and manifest in `release/`) |

**Docker:** the `Dockerfile` builds a `node:24-alpine` image that runs the recorder as the unprivileged `node` user, reading `/input/readings.json`. It exposes no port, because the server is designed for loopback use. Mount your input file and a writable data location yourself.

## Roadmap

> **Planned. None of the items below is implemented yet.** They are ideas under consideration, not commitments.

- Rename the remaining upstream identifiers: the package name and release ZIP name, and the internal `ObservatoryModel` / `OBSERVATORY_CONFIG` globals.
- Add the headless-browser layout and navigation checks to the automated test suite.
- A site icon (favicon) and an installable web-app manifest.
- More interface languages, using the existing dictionary structure.
- Optional automatic refresh of recorder history (it is currently a manual snapshot).
- Example adapters for specific devices, kept read-only and separate from the dashboard.
- An accessibility review with real screen readers.

## License and attribution

Smart Home is released under the **MIT License**. See [`LICENSE`](LICENSE). The original copyright notice, *Copyright (c) 2026 Peter Lindgren*, is preserved and applies to the upstream code this project builds on.

**Upstream project:** Smart Home is built on the **PRMGR Observatory Starter** v1.0.0, an open-source, local-first home dashboard starter. Its data model, validation rules, recorder, local server, generic house illustration and documentation in `docs/` come from that project. Smart Home adds:

- its own branding;
- the English/Arabic interface with RTL support;
- container-sized responsive charts and mobile layouts;
- the customizable sidebar and drawer navigation.

Smart Home is **not** an official PRMGR release and is not endorsed by its authors. "PRMGR" is used here only to credit the source. Homey and other equipment names belong to their respective owners.

Third-party notices, including asset provenance, are in [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md).
