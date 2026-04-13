/// <reference path="../../node_modules/@openrct2/types/openrct2.d.ts" />

registerPlugin({
  name: "UnlockAll",
  version: "3.0",
  authors: ["you"],
  type: "local",
  licence: "MIT",
  targetApiVersion: 77,
  main,
});

function main(): void {
  console.log("[UnlockAll] Plugin loaded");

  ui.registerMenuItem("Unlock All Rides & Scenery", unlockAll);
  ui.registerShortcut({
    id: "unlock-all.trigger",
    text: "Unlock All Rides & Scenery",
    bindings: ["CTRL+SHIFT+U"],
    callback: unlockAll,
  });

  context.subscribe("map.changed", () => {
    console.log("[UnlockAll] map.changed fired");
    unlockAll();
  });

  unlockAll();
}

function unlockAll(): void {
  console.log("[UnlockAll] unlockAll called");

  // Load every installed ride and scenery group into the park.
  // objectManager.load skips objects that are already loaded.
  const rideIdentifiers = objectManager.installedObjects
    .filter(o => o.type === "ride")
    .map(o => o.identifier);

  const sceneryTypes: ObjectType[] = ["scenery_group", "small_scenery", "large_scenery", "wall", "footpath_addition"];
  const sceneryByType = sceneryTypes.map(type => ({
    type,
    identifiers: objectManager.installedObjects.filter(o => o.type === type).map(o => o.identifier),
  }));

  console.log(`[UnlockAll] Loading ${rideIdentifiers.length} ride(s), ` +
    sceneryByType.map(s => `${s.identifiers.length} ${s.type}`).join(", "));

  objectManager.load(rideIdentifiers);
  for (const { identifiers } of sceneryByType) {
    objectManager.load(identifiers);
  }

  // Move all uninvented items to invented, then add any loaded objects
  // that the scenario left out of the research queue entirely.
  const research = park.research;

  const knownRideKeys = new Set<string>();
  for (const item of [...research.inventedItems, ...research.uninventedItems]) {
    if (item.type === "ride") {
      knownRideKeys.add(`${item.rideType}:${item.object}`);
    }
  }

  const extraRideItems: RideResearchItem[] = [];
  for (const obj of objectManager.getAllObjects("ride")) {
    for (const rideType of obj.rideType) {
      if (!knownRideKeys.has(`${rideType}:${obj.index}`)) {
        extraRideItems.push({ type: "ride", category: "gentle", rideType, object: obj.index });
      }
    }
  }

  const knownSceneryObjects = new Set<number>();
  for (const item of [...research.inventedItems, ...research.uninventedItems]) {
    if (item.type === "scenery") {
      knownSceneryObjects.add(item.object);
    }
  }

  const extraSceneryItems: SceneryResearchItem[] = [];
  for (const obj of objectManager.getAllObjects("scenery_group")) {
    if (!knownSceneryObjects.has(obj.index)) {
      extraSceneryItems.push({ type: "scenery", category: "scenery", object: obj.index });
    }
  }

  console.log(`[UnlockAll] ${research.uninventedItems.length} from queue, ${extraRideItems.length} extra rides, ${extraSceneryItems.length} extra scenery`);

  research.inventedItems = [
    ...research.inventedItems,
    ...research.uninventedItems,
    ...extraRideItems,
    ...extraSceneryItems,
  ];
  research.uninventedItems = [];

  console.log("[UnlockAll] Done");
}
