# Image Generation Runbook (Dirgha Farms)

This repo includes conceptual SVG visuals under `images/concepts/` and a production-ready prompt set for generating additional hero/content images.

## Prerequisites
- Set `OPENAI_API_KEY` in your shell.
- Ensure Python is available.

## Generate assets
From this repo root:

```powershell
$env:CODEX_HOME = $env:CODEX_HOME -ne $null ? $env:CODEX_HOME : "$HOME/.codex"
$IMAGE_GEN = "$env:CODEX_HOME/skills/imagegen/scripts/image_gen.py"
python "$IMAGE_GEN" generate-batch --input docs/imagegen-prompts.jsonl --out-dir output/imagegen --concurrency 3
```

## Suggested placements after generation
- Hero candidate -> `images/gallery/dirgha-hero-generated.png`
- Community storytelling -> `images/gallery/dirgha-community-generated.png`
- Infographic candidate -> `images/concepts/dirgha-trust-generated.png`

Review outputs for authenticity and replace only if quality improves over real farm photos.
