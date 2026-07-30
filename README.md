# rate-my-bites-game
A standalone Rate My Bites group dining mystery series featuring cinematic stories, recurring people and places, restaurant and order predictions, scoring, and local episode progress.

Release `v0.5.1` reuses Episode 3’s canonical character titles on individual Party cards. The Party, Episode 3, packaged Pup audio, deterministic living variation, and gentle local story memory were introduced in `v0.5.0`. Stable identities and artwork live in `worldBible.js`; the detailed Character, Voice, and Season Bibles have dedicated executable sources; episode content and the centralized catalog remain in `episodes.js`.

Developer references:

- [Story Bible](docs/story-bible.md)
- [Story Architecture](docs/story-architecture.md)
- [Adding an Episode](docs/adding-an-episode.md)
- [Artwork Audit](docs/image-audit.md)
- [Character Bible](docs/character-bible.md)
- [Voice Bible](docs/voice-bible.md)
- [Season 1 Bible](docs/season-1-bible.md)
- [Episode Production Framework](docs/episode-production-framework.md)

Validate the production content with:

```bash
node scripts/validate-assets.cjs
node tests/sprint31.test.cjs
node tests/sprint4Party.test.cjs
```
