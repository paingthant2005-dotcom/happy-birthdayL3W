# Happy 21st Birthday 💜 — A Little Birthday Surprise

A tiny, static, magical birthday mini‑site: a unicorn landing screen, a pastel
21‑candle cake you blow out, a softly typed birthday letter, and a celebration
of confetti, hearts, sparkles and fireworks. Built with **only**
HTML + CSS + vanilla JavaScript — no build step, no frameworks, no external
images, no tracking. Ready for GitHub Pages.

```
PaingThant/
├── index.html                 document + inline SVG unicorn sprite
├── style.css                  design system, animated background, all animations
├── script.js                  every interaction (vanilla JS, no libraries)
├── assets/
│   ├── README.txt             where to drop the song
│   └── birthday-song.mp3      ← the birthday song (optional, already added)
└── README.md                  this file
```

---

## 1. The experience

| Step | What happens |
|------|--------------|
| 1 | **Landing screen** — “Happy 21st Birthday 💜” in elegant script type, floating unicorn, “Open Your Surprise 🎁”. |
| 2 | Tap the button → a magical sparkle flash wipes the screen, the cake experience fades in. |
| 3 | **The cake** — pastel unicorn cake with exactly **21 candles** (laid out 7 + 7 + 7). |
| 4 | Tap the cake → flames flicker hard and shake → shrink → go out **one by one** (a soft wave across the cake), each leaving a tiny trail of smoke. |
| 5 | The birthday song fades in **inside that same tap** (mobile‑safe, no autoplay). The cake starts to glow. |
| 6 | **Celebration** — confetti falls, hearts float up, sparkles pop and pastel fireworks burst over the screen, with “May all your wishes come true! 💜✨”. |
| 7 | **The message** — the birthday card fades and slides in and your exact words are typed out, paragraph by paragraph. |
| 8 | **Final section** — “From the one 💜” and a “Replay the Magic ✨” button that resets everything (song, candles, message, effects) back to the start. |

Extras:

* **🎤 Optional microphone** — an optional “Blow into the mic instead” button
  is offered. If allowed, a puff of air into the phone genuinely blows the
  candles out. Denied / unsupported / silent → it quietly hands control back;
  tapping the cake always works.
* **Tiny music control** — a ⏸ / ▶ button appears in the bottom‑right corner
  only after the song has started.
* **Skip typing** — a button in the card shows the whole message instantly
  (clicking the card works too).
* **Reduced motion** — everything animates less on `prefers-reduced-motion`;
  the message appears fully typed, no confetti storms.
* **Keyboard & screen readers** — the cake is a real `<button>`, status text
  uses `aria-live="polite"`, focus rings are preserved.
* **Print friendly** — printing gives a clean dark‑on‑white letter.

---

## 2. Run it locally

Because everything is relative‑path and dependency‑free, you can simply open
`index.html` in a browser. To be closest to production (and to allow the
optional microphone permission), serve it over HTTP:

```powershell
# from this folder, either of these:
python -m http.server 8080
# or
npx --yes serve .
```

Then visit <http://localhost:8080>.

---

## 3. Add the birthday song (optional)

The page looks for `./assets/birthday-song.mp3`.

1. Drop your file in the `assets` folder.
2. Name it exactly `birthday-song.mp3` (lower‑case, with a dash).

The song that ships here is a real MP3 (MPEG‑1 Layer III, 128 kbps,
44.1 kHz, about 3:46, 3.4 MB) — replace it with any other `birthday-song.mp3`
whenever you like and nothing else needs to change.

If the file is missing or unplayable, **nothing breaks** — the site plays a
soft synthesised arpeggio in the browser instead, and the music control simply
stays hidden. See `assets/README.txt` for tips.

> The song never autoplays. It starts on the cake tap (a real user gesture),
> which is the only way mobile browsers allow audio to begin.

---

## 4. Deploy on GitHub Pages

1. Create a repository and push these files **at the repository root**
   (`index.html` must be at the top level):

   ```powershell
   git init
   git add .
   git commit -m "Happy 21st birthday 💜"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```

2. On GitHub: **Settings → Pages**.
3. Under *Build and deployment* → **Source: Deploy from a branch**,
   choose **Branch: `main`** and **Folder: `/ (root)`**, then **Save**.
4. Wait about a minute, then open:

   ```
   https://<your-username>.github.io/<your-repo>/
   ```

All paths are relative (`./style.css`, `./script.js`, `./assets/birthday-song.mp3`),
so the site works perfectly inside the `/<your-repo>/` sub‑directory. No
`base href` juggling needed.

**Tip:** the only external request is Google Fonts. Offline (or if fonts are
blocked) the page falls back to the built‑in serif / cursive / rounded stacks
and still looks lovely.

---

## 5. Customising

| Want to change… | Edit |
|---|---|
| the birthday letter | the `<p>` lines inside `#message` in `index.html` (the typewriter replays exactly what is written there) |
| colours / fonts / spacing | the design tokens at the top of `style.css` (`:root { … }`) |
| number of candles | `CANDLE_COUNT` in `script.js` (and the “21” on the tier in `index.html`) |
| how long the blow sequence takes | `timings()` in `script.js` |
| how much confetti / hearts / fireworks | `celebrate()` and `burstConfetti()` in `script.js` |
| the optional microphone sensitivity | the `level > 34` threshold in `micLoop()` in `script.js` |

Made with love. Enjoy the magic, and happy birthday 🎂✨💜
