# Episode Production Framework

Every playable episode is one data definition in `episodes.js` and must separate three
layers:

## Canonical

The canonical layer contains the official episode title, restaurant, attending Party,
central mystery, required clues, solution, ending, continuity changes, and fixed
opening/closing scene IDs. These values never change during a replay.

## Living

The living layer contains small, authored alternatives such as greetings, banter,
restaurant specials, environmental states, optional observations, and safe clue
orders. `livingEpisode.js` chooses them with a deterministic seed and materializes a
playable episode without mutating the catalog.

Every clue-order option must include each required clue exactly once. Selection avoids
recent full variation signatures when alternatives are available. The selected set is
stored for the active playthrough, so refresh or resume never reshuffles dinner.

Living content may change presentation but may not:

- change the attending Party, restaurant, mystery, solution, or ending
- remove or rewrite a required clue
- contradict the Character or Voice Bible
- reveal future information early
- affect fairness, scoring, or completion
- require replay to understand the story

## Media

The media layer maps canonical portrait, restaurant, and food asset IDs plus packaged
audio, visible captions, and fallback text. Runtime content uses only local,
build-validated files.

## Production checklist

1. Reuse canonical character and restaurant IDs.
2. Update durable appearances and continuity records.
3. Author the canonical episode before any living alternatives.
4. Add only controlled, character-consistent living options.
5. Register all media and captions.
6. Validate every seed family and required clue order.
7. Test first play, resume, completion, and replay.
8. Regression-test Episodes 1 and 2.
9. Test muted, blocked, missing, and rapid audio behavior.
10. Audit narrow mobile, phone landscape, tablet, and desktop layouts.
