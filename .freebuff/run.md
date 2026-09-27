# Running the Braintech Placement Platform

MERN app: Express API (`server/`) + Vite/React client (`client/`). Default ports:
API `5000`, Vite dev server `5173` (the Vite dev server proxies `/api` and `/uploads` to the API, so the preview URL is `http://localhost:5173/`).

## Reproduce the artifacts (fresh checkout)

1. **Install dependencies** (three package.json files: root, server, client):
   ```bash
   npm install --no-audit --no-fund
   npm install --prefix server --no-audit --no-fund
   npm install --prefix client --no-audit --no-fund
   ```
   Note: `server/package.json` must NOT contain the stray `"braintech-placement-platform": "file:.."` dependency (it was removed; re-adding it breaks installs).

2. **Create `server/.env`** (used automatically regardless of CWD — loaded via `server/src/config/env.js`):
   ```
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/braintech
   JWT_SECRET=braintech_dev_secret_change_in_production
   CLIENT_URL=http://localhost:5173
   ```
   No local MongoDB? The API falls back to an in-memory MongoDB automatically (data resets on restart). If the OS exports a bogus `PORT` (e.g. `0`), `config/env.js` falls back to `5000`.

3. **Demo data**: seeding is automatic — on boot, an empty database is filled by `server/src/seedData.js`. To re-seed manually: `npm run seed --prefix server`.

4. **Optional production build** (served by Express at `/` when `client/dist` exists):
   ```bash
   npm run build --prefix client
   ```

## Run the servers

- API: `cd server && node src/index.js` (or `npm run dev --prefix server`)
- Client: `npm run dev --prefix client` → http://localhost:5173
- Both together from the root: `npm run dev`

Demo logins (seeded):
- Admin: `admin@braintech.com` / `admin123`
- Candidate: `sumit@example.com` / `candidate123`
- Recruiter: `hr@abctech.com` / `recruiter123`

## Resume auto-fill (server-side parsing)

Resume uploads (`POST /api/candidates/me/resume`) are parsed with `pdf-parse` (PDF) and
`mammoth` (DOCX). Extracted fields — name, email, phone, skills, qualification, experience,
designation, city/state, expected salary, working status, gender, DOB — auto-fill only EMPTY
profile fields (existing user input is never overwritten); parsed skills are merged into the
existing list. The response includes `parsedFields`, `autofill` (changed keys) and a
human-readable `parseNote` for UI feedback. Image resumes (jpg/png) are stored but not
auto-read (no OCR); the UI tells the user to fill details manually. Test artifact:
`.freebuff/test-resume.pdf` + generator `.freebuff/make-test-resume.mjs`.## Home city-search autocomplete (2026-09-27 fix)

Two bugs fixed:

1. **White page on clicking the city field** — `suggest()` in `client/src/lib/suggestions.js`
   double-wrapped `{label,count}` objects when the query was empty: the empty-query shortcut
   did `list.slice(0,limit).map((label) => ({ label }))`, turning `{label:'Jaipur, Rajasthan',count:3}`
   into `{label:{label,count}}`, which React cannot render → exception in Autocomplete's `<span>` →
   blank page the moment the dropdown opened on focus (before typing anything). `suggest()` now
   normalizes both strings and `{label,count}` objects in every branch and always returns
   `{label, count?}`. This also fixes the two-children-same-key console warnings (the object
   became the React key).
2. **Enter key did nothing** — `Autocomplete.jsx` always called `preventDefault()` on Enter.
   It now takes a `submitOnEnter` prop (enabled on the Home hero + Jobs searchbar): Enter with no
   highlighted suggestion lets the form submit; long forms (profile, post job) keep the old
   "commit typed text" behavior. A single visible suggestion is auto-picked on Enter.

Backend `GET /api/jobs/search-meta` was verified healthy (skills/titles/locations + counts).

## Contact page redesign (2026-09-27)

`client/src/pages/Contact.jsx` rebuilt as a conversion page: split hero ("Let's talk about your
next opportunity."), "How can we help?" selector (job-seeker / hiring / general → panel + scroll
to form), message form with reason pills (auto-subject: Candidate/Recruitment/General enquiry,
company field shown for hiring), direct-contact rows (real phone +91 9587254540, 3 WhatsApp
numbers, admin@braintechplacement.com, Jaipur address), callback band (name/phone/preferred
time), real Google Maps embed + Get Directions, FAQ accordion, and role-aware final CTA
(guest → Find Jobs/Post a Job; candidate → Find Jobs/My Applications; recruiter → Post a Job/
My Jobs; admin → Contact Requests). CSS appended in `client/src/index.css` (`.c-*` classes).

Backend: `ContactRequest` model now has `kind` (message|callback) + `callback.preferredTime`;
email no longer required (callbacks have no email). `createContact` validates per kind
(callback needs name+phone; message needs name+email+message) and whitelists body fields.
Admin → Contact Requests shows a "Callback" badge with preferred time. No office hours are
displayed (not verified with the business).

## Google Sign-In on the login page (2026-09-27)

Flow: Google Identity Services button on `/login` → GSI returns an ID token
(`credential`) → `POST /api/auth/google` verifies it server-side with
google-auth-library against the same client ID → issues the app's normal JWT.
Response shape matches email login: `{token, user:{id,name,email,role}}`.

- **Client ID (both sides must match):** `178344765253-a0uqhpg5o89pm6lsg1kn908nnpc70dap.apps.googleusercontent.com`
  - `client/.env` → `VITE_GOOGLE_CLIENT_ID=...` (create this file; Vite restart needed after)
  - `server/.env` → `GOOGLE_CLIENT_ID=...`
  - No client secret anywhere — the browser flow uses the client ID only.
- `client/index.html` loads `https://accounts.google.com/gsi/client` (async defer).
- `client/src/components/GoogleLoginButton.jsx` initializes `google.accounts.id` once
  (module-level flag guards StrictMode double-mount) and renders the official button;
  hidden entirely (clean fallback) when `VITE_GOOGLE_CLIENT_ID` is unset.
- `AuthContext.loginWithGoogle(credential)` reuses the exact email-login storage path
  (`bt_token`/`bt_user`) — one auth system, role-aware redirect via `dashboardPath`.
- Server `googleAuth`: 400 no credential, 401 invalid/expired token, 401 unverified
  Google email, 403 blocked account, 501 if `GOOGLE_CLIENT_ID` missing. **New Google
  users are ALWAYS role `candidate`** (+ Candidate profile, `isVerified: true`);
  existing users (any role) get linked by email and keep their role.
- `User.password` now `required: fn → authProvider === 'local'` so password-less
  Google users validate; all other create paths still send a password.
- Verified live: button renders on /login (screenshot), `POST /api/auth/google` →
  401 bogus token / 400 missing / 200 email login still fine; production build clean.
- **Google Cloud prerequisite:** the OAuth web client's *Authorized JavaScript
  origins* must include `http://localhost:5173` and the production origin
  (e.g. `https://braintechplacement.com`) or the popup fails with `origin_mismatch`.
  Final click-through needs a signed-in Google account in the browser (preview
  browser has none) — test manually in your normal browser.

## Login tabs + Google loginType routing (2026-09-27)

The navbar "Login Account" is now a dropdown (hover/focus on desktop, static list in
the mobile menu) linking to `/login` and `/login?as=company`. The login page has
Candidate/Company tabs driven by the `?as=` param.

- Google button accepts `loginType` ('candidate'|'company'), held in a ref so the
  one-time GSI callback always uses the currently selected tab; sent to
  `POST /api/auth/google` as `{credential, loginType}`.
- Server routing rules (`googleAuth`):
  - New Google email + Candidate tab → candidate account created (as before).
  - New Google email + Company tab → **403 "register your company first"** — Google
    sign-in never auto-creates recruiters.
  - Existing candidate + Company tab → 403 "use Candidate Login".
  - Existing recruiter + Candidate tab → 403 "use Company Login".
  - Existing recruiter/admin + Company tab → signs in, role preserved.
  - Roles are never created or changed by loginType alone; Google only authenticates.
- Login.jsx shows a "Register your company" hint under the Google button on the
  Company tab. Verified: tabs switch via URL, dropdown links correct, endpoint
  still 401s bad tokens, email login unaffected, production build clean.

## Smart Apply flow + resume persistence fix (2026-09-27)

**Bug fixed — "resume not saved":** `uploadResume` only ran the final
`findOneAndUpdate` ... actually it only called `profile.save()` when at least one
auto-fill field changed, so resumes that parsed to nothing (plain/image PDFs) were
NEVER persisted even though the UI said success. Now the resume + name +
`resumeUploadedAt` are always written (`POST /candidates/me/resume` →
`Candidate.findOneAndUpdate($set)`), and `updateMyProfile` whitelists editable
fields so `PUT /candidates/me` can never wipe resume data. `PUT` with
`resume: null` etc. is ignored server-side.

**Smart Apply (JobDetail.jsx):** Apply Now fetches `/candidates/me` first, then:
- Resume exists → confirm modal: filename + uploaded date + View link +
  "Confirm & Apply" + "Upload a new one" switch.
- No resume → upload modal: dashed drop zone (PDF/DOC/DOCX, max 5 MB) +
  "Upload & Apply" which uploads and immediately submits the application.
- The old static red "Please upload your resume in your profile before applying"
  warning is gone; the message area is only used for real outcomes now.
- Modal closes on overlay click / ✕; busy states disable double submits.

**Resume snapshot per application:** `Application` model gained `resumeName`;
`applyToJob` stores `resume` + `resumeName` at apply time so later profile
replacements don't alter what recruiters see for that application.

**Candidate model:** added `resumeUploadedAt` (shown in profile + modal).
Profile "Resume" panel now shows a styled row (icon, filename, upload date, View).

Verified E2E with API tests + a real UI session in the preview: unparseable PDF
upload persists (was the bug), upload-then-apply modal completes an application,
confirm modal shows correct file/date/View, duplicate apply rejected, snapshot
visible in /applications/mine. Production build clean.
