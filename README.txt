=====================================================
  assets/  —  put the birthday song here
=====================================================

Drop your music file in THIS folder and name it exactly:

    birthday-song.mp3

Full path:

    PaingThant/assets/birthday-song.mp3

Used by index.html:

    <audio id="song" src="./assets/birthday-song.mp3" preload="none" playsinline></audio>

Notes
-----
* Something soft, sweet and romantic works best (a slow acoustic or
  music-box version of "Happy Birthday" is perfect).
* Keep it under ~5 MB so the page stays fast on phones. 128 kbps is plenty.
* The song NEVER autoplays. It starts the moment the cake is tapped
  (that tap is a real user gesture, which is exactly what mobile browsers
  require) and it fades in gently over ~1.5 seconds.
* A tiny ⏸ / ▶ control appears in the bottom-right corner once the song
  has started, so nothing ever becomes annoying.
* No file here? No problem. The page still works perfectly and plays a
  soft, synthesised magical arpeggio instead, so nothing ever breaks.
  (There is no placeholder file right now — just drop the real song in
  whenever you are ready and the fallback quietly stops being used.)

Checklist
---------
[x] assets/birthday-song.mp3 exists   (currently: MPEG-1 Layer III, 128 kbps,
                                       44.1 kHz, ~3:46, 3.4 MB)
[ ] It plays from a normal double-click / browser tab
[ ] File name is lower-case with a dash (birthday-song.mp3), not spaces

Replacing the song
------------------
The file name and folder never change, so you can simply overwrite
birthday-song.mp3 with your own track at any time. Nothing in index.html,
style.css or script.js needs to be edited — unless you want a different
file name, in which case update the src of <audio id="song"> in index.html.
