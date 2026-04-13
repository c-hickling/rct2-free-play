/// <reference path="../../node_modules/@openrct2/types/openrct2.d.ts" />

registerPlugin({
  name: "UnlockAll",
  version: "1.0",
  authors: ["you"],
  type: "local",
  licence: "MIT",
  targetApiVersion: 77,
  main,
});

function main(): void {
  ui.registerMenuItem("Unlock All Rides & Scenery", showConfirmWindow);
}

function showConfirmWindow(): void {
  const uninvented = park.research.uninventedItems;

  if (uninvented.length === 0) {
    ui.showError("Unlock All", "Everything is already unlocked.");
    return;
  }

  const rideCount = uninvented.filter((i) => i.type === "ride").length;
  const sceneryCount = uninvented.filter((i) => i.type === "scenery").length;

  ui.openWindow({
    classification: "unlock-all-confirm",
    title: "Unlock All Rides & Scenery",
    width: 300,
    height: 100,
    widgets: [
      {
        type: "label",
        x: 10,
        y: 20,
        width: 280,
        height: 14,
        text: `This will unlock ${rideCount} ride(s) and ${sceneryCount} scenery set(s).`,
      },
      {
        type: "button",
        x: 10,
        y: 70,
        width: 130,
        height: 16,
        text: "Unlock All",
        onClick: () => {
          unlockAll();
          const win = ui.getWindow("unlock-all-confirm");
          if (win) win.close();
        },
      },
      {
        type: "button",
        x: 155,
        y: 70,
        width: 130,
        height: 16,
        text: "Cancel",
        onClick: () => {
          const win = ui.getWindow("unlock-all-confirm");
          if (win) win.close();
        },
      },
    ],
  });
}

function unlockAll(): void {
  const research = park.research;
  const unlocked = research.uninventedItems.length;

  research.inventedItems = [...research.inventedItems, ...research.uninventedItems];
  research.uninventedItems = [];

  park.postMessage(`Unlocked ${unlocked} item(s). All rides and scenery are now available!`);
}
