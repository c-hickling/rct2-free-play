/// <reference path="../../node_modules/@openrct2/types/openrct2.d.ts" />

const pluginMetadata: PluginMetadata = {
  name: "HelloWorld",
  version: "1.0",
  authors: ["you"],
  type: "local",
  licence: "MIT",
  targetApiVersion: 77,
  main,
};

function main(): void {
  console.log("Hello from HelloWorld plugin!");

  // Example: add a menu item under the map menu
  if (typeof ui !== "undefined") {
    ui.registerMenuItem("Hello World", () => {
      ui.showTextInput({
        title: "Hello World",
        description: "Plugin is working!",
        initialValue: "Hello, OpenRCT2!",
        callback: (value) => {
          console.log("Got:", value);
        },
      });
    });
  }
}

registerPlugin(pluginMetadata);
