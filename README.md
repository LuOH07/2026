# XMU-China 2026 Wiki

Flask/Jinja wiki for the [iGEM](https://igem.org/) competition, built with [Frozen-Flask](https://frozen-flask.readthedocs.io/) for static export and deployed to GitHub Pages by GitHub Actions. All pages share a single layout, header, and footer. The **Members** page is implemented at `/members/` (also `/team/`). The home page and other pages are English placeholders using the shared header and footer. Navigation links open their corresponding pages.

## Quick start

Requires Python 3.12+ and network access (most assets load from `static.igem.wiki` via `asset-map.json`).

Create a virtual environment **outside** the repo (keeps the working tree clean):

```powershell
python -m venv ..\26web-local\venv
..\26web-local\venv\Scripts\python.exe -m pip install -r dependencies.txt
```

Run the dev server:

```powershell
..\26web-local\venv\Scripts\python.exe -B app.py
```

Open http://127.0.0.1:8080/members/

## Static build

**Local** — output goes to `../26web-local/preview/`:

```powershell
$env:FLASK_APP = "app.py"
..\26web-local\venv\Scripts\python.exe -m flask freeze
```

Preview the build:

```powershell
..\26web-local\venv\Scripts\python.exe -m http.server 8081 --bind 127.0.0.1 --directory ..\26web-local\preview
```

**GitHub Pages** — `.github/workflows/deploy.yml` runs on every push to `main` (and can be started manually from the Actions tab). To enable it once in the repository:

1. Open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main`; the workflow publishes the generated `public/` directory.

The workflow installs the pinned dependencies, fetches the large home-page videos from the public [`LuOH07/2026_home`](https://github.com/LuOH07/2026_home) repository, builds with `FLASK_APP=app.py flask freeze`, copies those videos and `static/home/5.css` to the published site root, adds `public/.nojekyll`, and uploads `public/` as the Pages artifact. It sets `GITHUB_ACTIONS=true` automatically, so `app.py` writes the build to `public/` instead of the local preview directory.

Page URLs are directory URLs with a trailing slash (for example `/members/` and `/description/`). This is required because GitHub Pages serves a directory's `index.html`; it does not treat an extensionless file as HTML. All template links are generated as relative URLs by `relative_url_for()` in `app.py`, so the site also works below the project path of a GitHub Pages site (`https://<user>.github.io/<repo>/`).

**GitLab Pages (legacy)** — `.gitlab-ci.yml` is still included for the iGEM GitLab mirror. It runs the same frozen build and publishes `public/` as its Pages artifact. GitHub Actions is the primary deployment path.

## Project layout

| Path | Purpose |
|---|---|
| `app.py` | Routes, asset resolution, member data, static build |
| `.github/workflows/deploy.yml` | GitHub Pages deployment |
| `.gitlab-ci.yml` | Legacy GitLab Pages deployment |
| `asset-map.json` | Local path → iGEM CDN URL mapping (80 assets) |
| `data/members.json` | Member names and mottos |
| `wiki/layout.html` | Shared HTML shell |
| `wiki/menu.html`, `wiki/footer.html` | Shared header and footer |
| `wiki/pages/` | Simple pages as `<page>.html`; complex pages in subdirectories |
| `wiki/pages/members/` | Members entry and its hero, map, and card sections |
| `static/` | CSS and JS served by Flask |
| `notices/` | Font licenses and attribution |

## Adding a page

Create `wiki/pages/example.html`:

```jinja
{% extends "layout.html" %}
{% block title %}Example{% endblock %}
{% block page_content %}
<section style="padding: 120px 24px 40px;">Page content here</section>
{% endblock %}
```

The generic route serves it at `/example/` and the freezer includes it in the build. Override `page_styles` and `page_scripts` blocks as needed — no need to duplicate header or footer markup.

To enable navigation, update `wiki/menu.html`: add `href="{{ url_for('pages', page='example') }}"` and remove `aria-disabled` from the matching link.

## Assets & license

Most images and fonts are hosted on iGEM servers. `asset-map.json` keys are lookup paths, not local files. Invalid or missing URLs cause a startup error with the affected keys listed.

The home-page videos are too large for the iGEM GitLab repository and are ignored by git. They are kept in the public `LuOH07/2026_home` repository. The home-page scripts reference them with page-relative paths (`./title.mp4`, `./model.mp4`, …), so the GitHub Pages workflow copies the videos and `static/home/5.css` into the published site root after freezing. If that media repository moves, update `HOME_MEDIA_REPOSITORY` in `.github/workflows/deploy.yml`.

Font licenses live in `notices/`. Project code is under [LICENSE](LICENSE); content follows [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## Page development

Edit `wiki/pages/<page>.html` and replace its under-development message with page content. Every page extends `wiki/layout.html`; shared navigation and footer live in `wiki/menu.html` and `wiki/footer.html`. Placeholder pages use `static/content-page.css`; use the `page_styles` and `page_scripts` blocks for page-specific code. Members content and interactions remain separate in `wiki/pages/members/`. All page templates are included in static builds, including pages not listed in the navigation.

Complex pages may use `wiki/pages/<page>/index.html` with section templates alongside it. Both forms keep the same URL. When converting a simple page, remove its old flat file after migrating the content; flat files take precedence when both exist. Members already uses its directory entry.

### Styling units

The root font size is pinned to `16px` in `static/head_foot/head_foot.css`, so `1rem`
is exactly `16px` on every machine and the browser/OS default font size (system text
size, 125%/150% settings) no longer changes the layout. Write all lengths as `rem`
(or `%`, `vw`, `vh`, `cqw`/`cqh` for viewport/container-relative sizing) and keep
`px` only in media-query breakpoints, which must never follow the font size.

## Pending manual cleanup

Keep all 28 simple `.html` files directly inside `wiki/pages/` and keep `wiki/pages/members/`. Delete only the redundant `wiki/pages/members.html`, the old `wiki/members/` directory, and the 28 other subdirectories directly inside `wiki/pages/` (each contains a duplicate `index.html`). No files were deleted automatically.
