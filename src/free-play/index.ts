/// <reference path="../../node_modules/@openrct2/types/openrct2.d.ts" />

const WINDOW_CLASS = "free-play";

if (typeof registerPlugin !== "undefined") registerPlugin({
  name: "FreePlay",
  version: "2.0",
  authors: ["you"],
  type: "local",
  licence: "MIT",
  targetApiVersion: 77,
  main,
});

function main(): void {
  ui.registerMenuItem("Free Play", openWindow);
  ui.registerShortcut({
    id: "free-play.open",
    text: "Open Free Play window",
    bindings: ["CTRL+SHIFT+U"],
    callback: openWindow,
  });
}

// --- Free play ---

export function applyFreePlay(enabled: boolean): void {
  if (enabled) {
    scenario.objective.type = "none";
    cheats.forcedParkRating = 999;
    scenario.parkRatingWarningDays = 0;
  } else {
    cheats.forcedParkRating = 0;
  }
}

// --- Add money ---

export function addMoney(): void {
  park.cash += 10000;
}

// --- Unlock rides & stalls ---

export function unlockRides(): void {
  loadAllInstalled("ride");
  const research = park.research;

  const knownKeys = new Set(
    [...research.inventedItems, ...research.uninventedItems]
      .filter(i => i.type === "ride")
      .map(i => `${(i as RideResearchItem).rideType}:${i.object}`)
  );

  const extras: RideResearchItem[] = [];
  for (const obj of objectManager.getAllObjects("ride")) {
    for (const rideType of obj.rideType) {
      if (!knownKeys.has(`${rideType}:${obj.index}`)) {
        extras.push({ type: "ride", category: "gentle", rideType, object: obj.index });
      }
    }
  }

  research.inventedItems = [
    ...research.inventedItems,
    ...research.uninventedItems.filter(i => i.type === "ride"),
    ...extras,
  ];
  research.uninventedItems = research.uninventedItems.filter(i => i.type !== "ride");
}

// --- Unlock scenery ---

export function unlockScenery(): void {
  const types: ObjectType[] = ["scenery_group", "small_scenery", "large_scenery", "wall", "footpath_addition"];
  for (const t of types) loadAllInstalled(t);

  const research = park.research;
  const knownScenery = new Set(
    [...research.inventedItems, ...research.uninventedItems]
      .filter(i => i.type === "scenery")
      .map(i => i.object)
  );

  const extras: SceneryResearchItem[] = objectManager.getAllObjects("scenery_group")
    .filter(o => !knownScenery.has(o.index))
    .map(o => ({ type: "scenery" as const, category: "scenery" as const, object: o.index }));

  research.inventedItems = [
    ...research.inventedItems,
    ...research.uninventedItems.filter(i => i.type === "scenery"),
    ...extras,
  ];
  research.uninventedItems = research.uninventedItems.filter(i => i.type !== "scenery");
}

// --- Helpers ---

function loadAllInstalled(type: ObjectType): void {
  objectManager.load(
    objectManager.installedObjects.filter(o => o.type === type).map(o => o.identifier)
  );
}

// --- Window ---

function button(text: string, y: number, onClick: () => void): ButtonDesc {
  return { type: "button", x: 5, y, width: 208, height: 14, text, onClick };
}

function openWindow(): void {
  const existing = ui.getWindow(WINDOW_CLASS);
  if (existing) { existing.bringToFront(); return; }

  ui.openWindow({
    classification: WINDOW_CLASS,
    title: "Free Play",
    width: 245,
    height: 96,
    widgets: [
      button("Disable Scenario Objectives", 19, () => applyFreePlay(true)),
      button("Add 10,000",                  38, addMoney),
      button("Unlock Rides & Stalls",       57, unlockRides),
      button("Unlock Scenery",              76, unlockScenery),
    ],
  });
}
