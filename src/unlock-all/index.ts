/// <reference path="../../node_modules/@openrct2/types/openrct2.d.ts" />

const WINDOW_CLASS = "unlock-all";

registerPlugin({
  name: "UnlockAll",
  version: "5.0",
  authors: ["you"],
  type: "local",
  licence: "MIT",
  targetApiVersion: 77,
  main,
});

function main(): void {
  console.log("[UnlockAll] Plugin loaded");

  ui.registerMenuItem("Unlock All Rides & Scenery", openWindow);
  ui.registerShortcut({
    id: "unlock-all.trigger",
    text: "Open Unlock All window",
    bindings: ["CTRL+SHIFT+U"],
    callback: openWindow,
  });

  context.subscribe("map.changed", onMapChanged);
  onMapChanged();
}

// --- Settings ---

function getAutoUnlock(key: string): boolean {
  return context.sharedStorage.get(`unlock-all.${key}`, true);
}

function setAutoUnlock(key: string, value: boolean): void {
  context.sharedStorage.set(`unlock-all.${key}`, value);
}

// --- Auto-unlock on scenario load ---

function onMapChanged(): void {
  if (getAutoUnlock("rides"))   unlockRides();
  if (getAutoUnlock("scenery")) unlockScenery();
}

// --- Unlock logic ---

function unlockRides(): void {
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

function unlockScenery(): void {
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

function openWindow(): void {
  const existing = ui.getWindow(WINDOW_CLASS);
  if (existing) { existing.bringToFront(); return; }

  ui.openWindow({
    classification: WINDOW_CLASS,
    title: "Unlock All",
    width: 245,
    height: 60,
    widgets: [
      makeRow("Rides & Stalls", "rides",   18, unlockRides),
      makeRow("Scenery",        "scenery", 37, unlockScenery),
    ].flat(),
  });
}

function makeRow(
  label: string,
  key: string,
  y: number,
  onUnlock: () => void
): WidgetDesc[] {
  return [
    {
      type: "checkbox",
      name: `cb-${key}`,
      x: 5, y: y + 1, width: 150, height: 12,
      text: label,
      isChecked: getAutoUnlock(key),
      onChange: (checked: boolean) => setAutoUnlock(key, checked),
    } as CheckboxDesc,
    {
      type: "button",
      x: 160, y: y - 1, width: 78, height: 16,
      text: "Unlock Now",
      onClick: onUnlock,
    } as ButtonDesc,
  ];
}
