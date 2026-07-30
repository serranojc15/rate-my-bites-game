# Character Voice Bible

The permanent, machine-validated Voice Bible lives in
[`voiceBible.js`](../voiceBible.js). It derives one profile for every Character Bible
entry and defines speaking rhythm, vocabulary, humor, emotional range, typical
expressions, forbidden phrasing, example dialogue, performance direction, and a future
ElevenLabs Voice ID placeholder.

Sprint 4 implements recorded dialogue for Pup only. Every other profile remains
`profile-only`.

Pup’s voice is warm, friendly, optimistic, encouraging, playful, and food-loving. The
performance should suggest a friendly maître d’, a gentle attraction host, a loyal
golden retriever, and a helpful dinner companion. It must never become sarcastic,
loud, obnoxious, overly cartoonish, or condescending.

The five approved Episode 3 recordings are declared with their exact captions in
`episodes.js` and shipped under `assets/audio/`. Playback is handled by `pupAudio.js`.
The game makes no runtime voice-generation request.

Every spoken line must:

- appear as visible text
- remain optional to progression
- obey the saved mute preference
- stop any prior clip before playing
- fail safely when playback is blocked or a file is unavailable
