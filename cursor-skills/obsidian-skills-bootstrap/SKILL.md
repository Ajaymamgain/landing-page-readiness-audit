---
name: obsidian-skills-bootstrap
description: Ensure kepano/obsidian-skills are installed in ~/.codex/skills and ready to use when Obsidian skill setup is requested. Use when the user asks to create or install Obsidian skills from github.com/kepano/obsidian-skills, or to bootstrap defuddle, json-canvas, obsidian-bases, obsidian-cli, or obsidian-markdown.
---

# Obsidian Skills Bootstrap

Upstream: [https://github.com/kepano/obsidian-skills](https://github.com/kepano/obsidian-skills)

## Goal

Install and verify these skills in `~/.codex/skills`:

- `defuddle`
- `json-canvas`
- `obsidian-bases`
- `obsidian-cli`
- `obsidian-markdown`

## Workflow

1. Check whether each skill directory already exists in `~/.codex/skills`.
2. Install only missing skills using:
   `~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py`
3. Verify each installed skill has a `SKILL.md`.
4. Tell the user to restart Codex so newly installed skills are picked up by the session.

## Canonical install command

```bash
cd ~/.codex/skills/.system/skill-installer/scripts && \
python3 install-skill-from-github.py \
  --repo kepano/obsidian-skills \
  --path skills/defuddle skills/json-canvas skills/obsidian-bases skills/obsidian-cli skills/obsidian-markdown
```

If some of these already exist, install the missing ones only.
