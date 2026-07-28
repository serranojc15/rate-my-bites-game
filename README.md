# rate-my-bites-game
A standalone Rate My Bites group dining mystery series featuring cinematic stories, recurring people and places, restaurant and order predictions, scoring, and local episode progress.

Release `v0.4.6.1` adds Sprint 3.1 series polish. Canonical characters, restaurants, seasons, and artwork live in `worldBible.js`; episode content and the centralized catalog live in `episodes.js`; progress remains local-only and backward-compatible in `episodeProgress.js`.

Developer references:

- [Story Bible](docs/story-bible.md)
- [Story Architecture](docs/story-architecture.md)
- [Adding an Episode](docs/adding-an-episode.md)
- [Artwork Audit](docs/image-audit.md)

Validate the production content with:

```bash
node scripts/validate-assets.cjs
node tests/sprint31.test.cjs
```
