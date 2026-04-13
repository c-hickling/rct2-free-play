# OpenRCT2 Plugins

## Plugins

| Plugin | Description |
|--------|-------------|
| [hello-world](src/hello-world/index.ts) | Starter plugin — adds a "Hello World" entry to the map menu |

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
cp dist/hello-world.js ~/.config/OpenRCT2/plugin/
```

OpenRCT2 loads plugins automatically when you start a game. To reload a plugin without restarting, open the in-game console and run `loadplugin <filename>`.

## Development

Each plugin lives in its own folder under `src/`. To add a new plugin, create `src/<name>/index.ts` and call `registerPlugin()` at the bottom. Running `npm run watch` rebuilds all plugins on save.
