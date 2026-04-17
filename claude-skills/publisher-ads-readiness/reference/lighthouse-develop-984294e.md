# Developing Lighthouse (pinned README excerpt)

Upstream: [GoogleChrome/lighthouse @ `984294ef`](https://github.com/GoogleChrome/lighthouse/tree/984294ef4d6fd0288aa234e66c4f987126e1389c) — matches the **Develop → Setup / Run** section in `readme.md` at that commit.

## Setup

```sh
# yarn should be installed first

git clone https://github.com/GoogleChrome/lighthouse

cd lighthouse
yarn
yarn build-all
```

## Run (from source)

```sh
node cli http://example.com
# append --chrome-flags="--no-sandbox --headless --disable-gpu" if you run into problems connecting to Chrome
```

## Notes for this skill

- Most workflows in [lighthouse-modern.md](lighthouse-modern.md) use **`npx lighthouse`** from npm instead of a source build.
- Use the source workflow when contributing to Lighthouse or when you need an unreleased CLI build.
- At this commit, the README also states **Node 22 (LTS) or later** for the Node CLI install path.
