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

  context.subscribe("map.changed", applySettings);
  applySettings();
}

// --- Settings ---

function getSetting(key: string, defaultValue: boolean): boolean {
  return context.sharedStorage.get(`free-play.${key}`, defaultValue);
}

function setSetting(key: string, value: boolean): void {
  context.sharedStorage.set(`free-play.${key}`, value);
}

export function isFreePlayEnabled():      boolean { return getSetting("freePlay",       false); }
export function isUnlimitedMoneyEnabled(): boolean { return getSetting("unlimitedMoney", false); }
export function isUnlockRidesEnabled():   boolean { return getSetting("unlockRides",    true);  }
export function isUnlockSceneryEnabled(): boolean { return getSetting("unlockScenery",  true);  }

// --- Apply all settings ---

export function applySettings(): void {
  applyFreePlay(isFreePlayEnabled());
  applyUnlimitedMoney(isUnlimitedMoneyEnabled());
  if (isUnlockRidesEnabled())   unlockRides();
  if (isUnlockSceneryEnabled()) unlockScenery();
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

// --- Unlimited money ---

export function applyUnlimitedMoney(enabled: boolean): void {
  park.setFlag("noMoney", enabled);
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

function openWindow(): void {
  const existing = ui.getWindow(WINDOW_CLASS);
  if (existing) { existing.bringToFront(); return; }

  ui.openWindow({
    classification: WINDOW_CLASS,
    title: "Free Play",
    width: 245,
    height: 96,
    widgets: [
      checkbox("Disable scenario objectives", "freePlay",       false, 18, applyFreePlay),
      checkbox("Unlimited money",             "unlimitedMoney", false, 37, applyUnlimitedMoney),
      ...makeUnlockRow("Rides & Stalls", "unlockRides",   56, unlockRides),
      ...makeUnlockRow("Scenery",        "unlockScenery", 75, unlockScenery),
    ],
  });
}

function checkbox(
  text: string,
  key: string,
  defaultValue: boolean,
  y: number,
  onToggle: (v: boolean) => void
): CheckboxDesc {
  return {
    type: "checkbox",
    x: 5, y: y + 1, width: 208, height: 12,
    text,
    isChecked: getSetting(key, defaultValue),
    onChange: (checked: boolean) => {
      setSetting(key, checked);
      onToggle(checked);
    },
  };
}

function makeUnlockRow(
  label: string,
  key: string,
  y: number,
  onUnlock: () => void
): WidgetDesc[] {
  return [
    {
      type: "checkbox",
      x: 5, y: y + 1, width: 150, height: 12,
      text: label,
      isChecked: getSetting(key, true),
      onChange: (checked: boolean) => setSetting(key, checked),
    } as CheckboxDesc,
    {
      type: "button",
      x: 160, y: y - 1, width: 78, height: 16,
      text: "Unlock Now",
      onClick: onUnlock,
    } as ButtonDesc,
  ];
}
