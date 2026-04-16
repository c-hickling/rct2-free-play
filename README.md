# OpenRCT2 Plugins

## Free Play

A plugin that provides one-click cheats via a UI window accessible from the map menu or with Ctrl+Shift+U.

| Button | Effect |
|--------|--------|
| Disable Scenario Objectives | Removes win/loss conditions and locks the park rating at 999 |
| Add 10,000 | Adds 10,000 to your park cash |
| Unlock Rides & Stalls | Instantly researches all installed ride and stall types |
| Unlock Scenery | Instantly researches all installed scenery groups |

## Installation

Build the plugin you want:

```sh
npm install
npm run build
```

Then copy the output file from `dist/` to your OpenRCT2 plugins directory:

| OS | Path |
|----|------|
| Windows | `%APPDATA%\OpenRCT2\plugin\` |
| Linux | `~/.config/OpenRCT2/plugin\` |
| macOS | `~/Library/Application Support/OpenRCT2/plugin/` |

For example on Linux:

```sh
cp dist/free-play.js ~/.config/OpenRCT2/plugin/
```

OpenRCT2 loads plugins automatically when you start a game. To reload a plugin without restarting, open the in-game console and run `loadplugin <filename>`.

## Development

Each plugin lives in its own folder under `src/`. To add a new plugin, create `src/<name>/index.ts` and call `registerPlugin()` at the bottom. Running `npm run watch` rebuilds all plugins on save.
