# Faheem Ahmed — One-page portfolio + Portfolio Studio

An original, responsive one-page portfolio built with plain HTML/CSS/JavaScript. No hosting bill, paid domain, backend, framework, build step, or third-party account is required to *view the files locally*. To put it on the public web for free, use GitHub Pages.

## Files

- `index.html`: public one-page website
- `styles.css`: responsive website design
- `app.js`: renders all sections from content
- `content.json`: **editable public content** (projects, skills, experience, copy, links)
- `fallback.js`: bundled starting content for opening HTML files without a web server
- `admin.html`: browser-based admin panel, called **Portfolio Studio**
- `admin.css`, `admin.js`: editor styles and editing + GitHub publishing code
- `favicon.svg`: custom browser icon
- `.nojekyll`: GitHub Pages compatibility

## 1. Preview locally

For a quick preview, open `index.html` in a browser. For the most accurate preview, launch a local static web server from the unzipped folder:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000/`. Open `http://localhost:8000/admin.html` to edit content. You can **Export JSON** from the admin page even before GitHub is connected.

## 2. Publish for $0 on GitHub Pages

1. Create a free GitHub account at https://github.com/ if you do not have one.
2. Create a **public** repository named exactly `YOUR-USERNAME.github.io` (replace with your username).
3. Unzip this package and upload all files, including `content.json`, `index.html`, and `admin.html`, to the repository **root** using `Add file` → `Upload files`. Commit.
4. Open repository `Settings` → `Pages` → `Build and deployment` → `Source: Deploy from a branch` → `main` → `/(root)` → **Save**.
5. Your portfolio URL will be `https://YOUR-USERNAME.github.io/` after Pages publishes it. Your editor will be `https://YOUR-USERNAME.github.io/admin.html`.
6. If your repository is called something else (e.g. `portfolio`), the URL is normally `https://YOUR-USERNAME.github.io/portfolio/`. This site also supports that arrangement because it uses relative paths.

**No domain purchase is required.** This uses a free `github.io` subdomain rather than a custom `.com` domain. GitHub Pages free hosting requires a public repository. The website and public data in `content.json` can be viewed by anyone.

## 3. Edit content with the admin panel

Open `/admin.html`. You can edit these sections:

- Profile, intro, contact and highlighted numbers
- Portfolio projects, tags, themes, filters and external links
- Work experience and dates
- Skill groups and software list
- Social links

Edits show in the live preview immediately. They are **drafts** until saved.

### Option A: No token, manual publishing

Click **Export JSON**. Upload the resulting `content.json` to your GitHub repository root, replacing the existing file, and commit. GitHub Pages will publish the new data automatically. This method does not need a token.

### Option B: Publish directly from the admin panel

1. On GitHub, go to your profile → `Settings` → `Developer settings` → `Personal access tokens` → `Fine-grained tokens` → create a token.
2. Restrict it to your portfolio repository only. Give it **Contents: Read and write** permissions. Choose an expiration date. Do not give any wider permissions.
3. In `/admin.html`, choose **Publishing**, enter your GitHub username, repository name, branch (`main`) and token, then click **Connect & load GitHub content**.
4. Edit your sections and click **Publish changes**.
5. The panel commits the updated `content.json` using GitHub's Contents API. GitHub Pages rebuilds automatically. Wait until the deployment completes to see edits on the public website.

**IMPORTANT SECURITY NOTES**

- The admin page URL is public, but only a person with appropriate GitHub repository permissions and a valid token can publish changes.
- This is **not** a server-backed username/password CMS. It is a browser-based editor that uses GitHub as the publishing backend.
- Tokens are kept only in the editor's JavaScript memory until reload or disconnect; they are not included in exported JSON, not saved in localStorage/cookies and never committed to your repository.
- Never paste the token into content, screenshots, public messages, your repository or shared documents. Revoke a token immediately if it leaks.
- Only GitHub username, repository and branch are remembered locally for convenience.
- Do not publish private CV references, phone numbers or other sensitive details without deciding you want them public.

## Notes

- Portfolio content is adapted from the supplied CV. Verify project links and wording before public launch.
- The cards use original CSS illustrations by default, **not** screenshots from live products or copied Dribbble/Behance designs. The project editor supports optional cover image URLs, including relative paths for image files uploaded to your repo.
- The current version intentionally omits the personal phone number and professional reference details from the public site.
- External project links may change over time.
- The **title and email** are editable in the admin page. Add your own photos/screenshots later if desired.
- Google Fonts load if online. System fallbacks work without them.
- The website does not use analytics, trackers, a database, or paid services.

## Design references reviewed

- Dribbble: https://dribbble.com/shots/27045839-Product-Designer-Portfolio-One-Page-Website
- Dribbble: https://dribbble.com/shots/25656625-Norden-Minimal-Portfolio-Website
- Behance: https://www.behance.net/gallery/247135551/Personal-Portfolio-Website
- Behance: https://www.behance.net/gallery/244411605/Personal-Portfolio-Website-UIUX-Case-Study

The final portfolio is an original implementation informed by large type, clean project grids, white space, and clear calls to action.