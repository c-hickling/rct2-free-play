/// <reference path="../../node_modules/@openrct2/types/openrct2.d.ts" />

const WINDOW_CLASS = "free-play";

if (typeof registerPlugin !== "undefined") registerPlugin({
  name: "FreePlay",
  version: "1.0",
  authors: ["you"],
  type: "local",
  licence: "MIT",
  targetApiVersion: 77,
  main,
});

function main(): void {
  ui.registerMenuItem("Free Play", openWindow);

  context.subscribe("map.changed", applySettings);
  applySettings();
}

// --- Settings ---

export function isFreePlayEnabled(): boolean {
  return context.sharedStorage.get("free-play.freePlay", false);
}

export function isUnlimitedMoneyEnabled(): boolean {
  return context.sharedStorage.get("free-play.unlimitedMoney", false);
}

function setSetting(key: string, value: boolean): void {
  context.sharedStorage.set(key, value);
}

// --- Apply ---

export function applySettings(): void {
  applyFreePlay(isFreePlayEnabled());
  applyUnlimitedMoney(isUnlimitedMoneyEnabled());
}

export function applyFreePlay(enabled: boolean): void {
  if (enabled) {
    // Remove the scenario win/fail objective
    scenario.objective.type = "none";
    // Force park rating high so the "park is failing" countdown never starts.
    // forcedParkRating = 0 means "use real rating", any other value overrides it.
    cheats.forcedParkRating = 999;
    // Reset any existing countdown so a nearly-failed park recovers immediately
    scenario.parkRatingWarningDays = 0;
  } else {
    cheats.forcedParkRating = 0;
    // Note: the objective type cannot be restored once cleared — the player
    // would need to reload the scenario to get it back.
  }
}

export function applyUnlimitedMoney(enabled: boolean): void {
  park.setFlag("noMoney", enabled);
}

// --- Window ---

function openWindow(): void {
  const existing = ui.getWindow(WINDOW_CLASS);
  if (existing) { existing.bringToFront(); return; }

  ui.openWindow({
    classification: WINDOW_CLASS,
    title: "Free Play",
    width: 220,
    height: 55,
    widgets: [
      {
        type: "checkbox",
        x: 5, y: 18, width: 208, height: 12,
        text: "Disable scenario objectives",
        isChecked: isFreePlayEnabled(),
        onChange: (checked: boolean) => {
          setSetting("free-play.freePlay", checked);
          applyFreePlay(checked);
        },
      } as CheckboxDesc,
      {
        type: "checkbox",
        x: 5, y: 37, width: 208, height: 12,
        text: "Unlimited money",
        isChecked: isUnlimitedMoneyEnabled(),
        onChange: (checked: boolean) => {
          setSetting("free-play.unlimitedMoney", checked);
          applyUnlimitedMoney(checked);
        },
      } as CheckboxDesc,
    ],
  });
}
