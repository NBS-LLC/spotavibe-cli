# spotavibe-cli

A zero-configuration command-line tool built with Deno and Docker that reads any public Spotify playlist and exports a comprehensive DJ-ready CSV containing tempo, musical key, Camelot notation, and energy metrics.

---

## Features

- **Zero API Credentials Required**: Scrapes playlist metadata directly from Spotify public embeds—no Spotify Developer account, OAuth tokens, or client secrets needed.
- **Audio Intelligence**: Resolves BPM, Musical Key, and Energy via the free [ReccoBeats API](https://reccobeats.com).
- **Harmonic Mixing Ready**: Automatically converts pitch classes to Camelot Wheel notation (e.g., `8B`, `11A`) for DJs and music curation.
- **Standards-Compliant CSV Output**: Outputs structured CSV files with semicolon-separated artists and properly escaped special characters.
- **Fully Containerized**: Ready to run in VS Code Dev Containers or headless Docker environments without installing Deno locally.

---

## Output CSV Schema

The generated CSV contains the following columns:

| Column | Description | Example |
| :--- | :--- | :--- |
| `song title` | Track title | `Get Lucky` |
| `artists` | Semicolon-separated artist list | `Daft Punk; Pharrell Williams; Nile Rodgers` |
| `bpm` | Tempo rounded to one decimal place | `116.0` |
| `key` | Musical Key (Root + Mode) | `F# Minor` |
| `camelot notation` | Harmonic Camelot Wheel key code | `11A` |
| `energy` | Energy metric (0.0 to 1.0) | `0.811` |

---

## Prerequisites

- **Docker Desktop** (or Docker Engine with Docker Compose)
- **Visual Studio Code** with the **[Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)** extension *(Recommended)*
- *(Optional)* **Deno 2+** if running directly on host without Docker

---

## Getting Started (VS Code Dev Container)

The recommended development workflow runs entirely inside a pre-configured Docker container:

1. Clone the repository:
   ```bash
   git clone <repo-url> spotavibe-cli
   cd spotavibe-cli
   ```

2. Open the project in VS Code:
   ```bash
   code .
   ```

3. When prompted, click **"Reopen in Container"** (or press `F1` → select `Dev Containers: Reopen in Container`).

4. Open the integrated terminal (`Ctrl+\`` or `Cmd+\``) and run:
   ```bash
   deno task start "https://open.spotify.com/playlist/5Jo5zTyCP5gc51Zrkb42NI"
   ```

The generated CSV file will be written to `./out/playlist.csv` and immediately visible on your host filesystem.

---

## Usage Guide

### Basic Run
```bash
deno task start "<SPOTIFY_PLAYLIST_URL_OR_ID>"
```

Supported playlist input formats:
- Full URL: `https://open.spotify.com/playlist/5Jo5zTyCP5gc51Zrkb42NI?si=...`
- Clean URL: `https://open.spotify.com/playlist/5Jo5zTyCP5gc51Zrkb42NI`
- Spotify URI: `spotify:playlist:5Jo5zTyCP5gc51Zrkb42NI`
- Raw ID: `5Jo5zTyCP5gc51Zrkb42NI`

### Custom Output Destination
Use `-o` or `--output` to specify a custom CSV file path:
```bash
deno task start "https://open.spotify.com/playlist/5Jo5zTyCP5gc51Zrkb42NI" -o out/summer_vibes.csv
```

### Watch Mode (Live Reloading)
Restart and re-execute automatically upon modifying source files:
```bash
deno task dev "https://open.spotify.com/playlist/5Jo5zTyCP5gc51Zrkb42NI"
```

---

## Alternative: Headless Docker Execution

If you prefer running the CLI directly from your host shell without opening VS Code:

Make the helper scripts executable:
```bash
chmod +x run.sh dev.sh test.sh
```

Run the containerized CLI:
```bash
./run.sh "https://open.spotify.com/playlist/5Jo5zTyCP5gc51Zrkb42NI" -o out/my_playlist.csv
```

Run test suite via Docker:
```bash
./test.sh
```

---

## Development & Quality Tasks

All development workflows are managed through built-in `deno task` commands inside the container:

| Task | Command | Description |
| :--- | :--- | :--- |
| **All Checks** | `deno task ok` | Formats, lints, type-checks, and tests the entire project |
| **CI Mode** | `deno task ci` | Checks formatting without modifying files, lints, checks types, and tests |
| **Test** | `deno task test` | Runs unit test suite using `@std/assert` |
| **Type Check** | `deno task check` | Statically type-checks TypeScript entry points in strict mode |
| **Format** | `deno task fmt` | Formats code with Deno\x27s built-in opinionated formatter |
| **Lint** | `deno task lint` | Statically inspects code using recommended Deno lint rules |

---

## Architecture Overview

```text
spotavibe-cli/
├── .devcontainer/
│   └── devcontainer.json    # VS Code Dev Container definition with Git & Deno tooling
├── src/
│   ├── main.ts              # CLI argument parser and pipeline orchestrator
│   ├── spotify.ts           # Spotify embed scraper (HTML / __NEXT_DATA__ parser)
│   ├── reccobeats.ts        # ReccoBeats audio features client (BPM, key, energy)
│   ├── music_theory.ts      # Pitch class to musical key & Camelot notation converter
│   ├── csv.ts               # RFC-compliant CSV generator using @std/csv
│   └── types.ts             # Domain TypeScript interfaces
├── tests/
│   ├── csv_test.ts          # CSV generation and quote-escaping tests
│   ├── music_theory_test.ts # Harmonic key and Camelot mapping tests
│   └── spotify_test.ts      # Playlist ID parsing and input sanitization tests
├── deno.json                # Project configuration, task aliases, and pinned JSR imports
├── Dockerfile               # Production and CI container image
├── run.sh                   # Headless Docker runner script
├── dev.sh                   # Interactive watch-mode Docker runner script
└── test.sh                  # Docker test runner script
```
