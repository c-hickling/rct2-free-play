/// <reference path="../node_modules/@openrct2/types/openrct2.d.ts" />
import { describe, it, expect, beforeEach, vi } from "vitest";
import { unlockRides, unlockScenery } from "../src/free-play/index";

// --- Helpers ---

function makeRideItem(rideType: number, object: number): RideResearchItem {
  return { type: "ride", category: "rollercoaster", rideType, object };
}

function makeSceneryItem(object: number): SceneryResearchItem {
  return { type: "scenery", category: "scenery", object };
}

function makeResearch(
  invented: ResearchItem[] = [],
  uninvented: ResearchItem[] = []
): Research {
  return {
    inventedItems: invented,
    uninventedItems: uninvented,
    lastResearchedItem: null,
    expectedItem: null,
    funding: 0,
    priorities: [],
    stage: "initial_research",
    progress: 0,
    expectedMonth: null,
    expectedDay: null,
    isObjectResearched: vi.fn().mockReturnValue(false),
  };
}

function makeRideObject(index: number, rideTypes: number[]): RideObject {
  return { type: "ride", index, rideType: rideTypes } as unknown as RideObject;
}

function makeSceneryGroupObject(index: number): SceneryGroupObject {
  return { type: "scenery_group", index } as unknown as SceneryGroupObject;
}

// --- Tests ---

describe("unlockRides", () => {
  let research: Research;

  beforeEach(() => {
    research = makeResearch();

    vi.stubGlobal("park", { research });
    vi.stubGlobal("objectManager", {
      installedObjects: [],
      getAllObjects: vi.fn().mockReturnValue([]),
      load: vi.fn(),
    });
  });

  it("moves uninvented ride items to invented", () => {
    research.uninventedItems = [makeRideItem(0, 1), makeRideItem(1, 2)];

    unlockRides();

    expect(research.inventedItems).toHaveLength(2);
    expect(research.uninventedItems).toHaveLength(0);
  });

  it("leaves uninvented scenery items in place", () => {
    research.uninventedItems = [makeRideItem(0, 1), makeSceneryItem(5)];

    unlockRides();

    expect(research.inventedItems.every(i => i.type === "ride")).toBe(true);
    expect(research.uninventedItems).toEqual([makeSceneryItem(5)]);
  });

  it("preserves already-invented items", () => {
    research.inventedItems = [makeRideItem(0, 1)];
    research.uninventedItems = [makeRideItem(1, 2)];

    unlockRides();

    expect(research.inventedItems).toHaveLength(2);
  });

  it("adds loaded ride objects missing from the research queue", () => {
    // rideType 5 / object 10 is loaded but not in any research list
    (objectManager.getAllObjects as ReturnType<typeof vi.fn>).mockReturnValue([
      makeRideObject(10, [5]),
    ]);

    unlockRides();

    const extras = research.inventedItems.filter(
      i => i.type === "ride" && (i as RideResearchItem).object === 10
    );
    expect(extras).toHaveLength(1);
  });

  it("does not duplicate items already in invented", () => {
    research.inventedItems = [makeRideItem(5, 10)];
    (objectManager.getAllObjects as ReturnType<typeof vi.fn>).mockReturnValue([
      makeRideObject(10, [5]),
    ]);

    unlockRides();

    const dupes = research.inventedItems.filter(
      i => i.type === "ride" &&
        (i as RideResearchItem).rideType === 5 &&
        (i as RideResearchItem).object === 10
    );
    expect(dupes).toHaveLength(1);
  });

  it("loads all installed ride objects", () => {
    (objectManager as ReturnType<typeof vi.fn & typeof objectManager>).installedObjects = [
      { type: "ride", identifier: "rct2.ride.a" } as InstalledObject,
      { type: "ride", identifier: "rct2.ride.b" } as InstalledObject,
      { type: "scenery_group", identifier: "rct2.scenery.x" } as InstalledObject,
    ];

    unlockRides();

    expect(objectManager.load).toHaveBeenCalledWith(["rct2.ride.a", "rct2.ride.b"]);
  });

  it("handles an empty research queue without throwing", () => {
    expect(() => unlockRides()).not.toThrow();
  });
});

describe("unlockScenery", () => {
  let research: Research;

  beforeEach(() => {
    research = makeResearch();

    vi.stubGlobal("park", { research });
    vi.stubGlobal("objectManager", {
      installedObjects: [],
      getAllObjects: vi.fn().mockReturnValue([]),
      load: vi.fn(),
    });
  });

  it("moves uninvented scenery items to invented", () => {
    research.uninventedItems = [makeSceneryItem(1), makeSceneryItem(2)];

    unlockScenery();

    expect(research.inventedItems).toHaveLength(2);
    expect(research.uninventedItems).toHaveLength(0);
  });

  it("leaves uninvented ride items in place", () => {
    research.uninventedItems = [makeSceneryItem(1), makeRideItem(0, 3)];

    unlockScenery();

    expect(research.inventedItems.every(i => i.type === "scenery")).toBe(true);
    expect(research.uninventedItems).toEqual([makeRideItem(0, 3)]);
  });

  it("preserves already-invented items", () => {
    research.inventedItems = [makeSceneryItem(1)];
    research.uninventedItems = [makeSceneryItem(2)];

    unlockScenery();

    expect(research.inventedItems).toHaveLength(2);
  });

  it("adds loaded scenery groups missing from the research queue", () => {
    (objectManager.getAllObjects as ReturnType<typeof vi.fn>).mockReturnValue([
      makeSceneryGroupObject(99),
    ]);

    unlockScenery();

    const extras = research.inventedItems.filter(
      i => i.type === "scenery" && i.object === 99
    );
    expect(extras).toHaveLength(1);
  });

  it("does not duplicate scenery groups already in invented", () => {
    research.inventedItems = [makeSceneryItem(99)];
    (objectManager.getAllObjects as ReturnType<typeof vi.fn>).mockReturnValue([
      makeSceneryGroupObject(99),
    ]);

    unlockScenery();

    const dupes = research.inventedItems.filter(
      i => i.type === "scenery" && i.object === 99
    );
    expect(dupes).toHaveLength(1);
  });

  it("loads all scenery-related object types", () => {
    (objectManager as ReturnType<typeof vi.fn & typeof objectManager>).installedObjects = [
      { type: "scenery_group",    identifier: "sg1" } as InstalledObject,
      { type: "small_scenery",    identifier: "ss1" } as InstalledObject,
      { type: "large_scenery",    identifier: "ls1" } as InstalledObject,
      { type: "wall",             identifier: "w1"  } as InstalledObject,
      { type: "footpath_addition",identifier: "fa1" } as InstalledObject,
      { type: "ride",             identifier: "r1"  } as InstalledObject, // should be ignored
    ];

    unlockScenery();

    expect(objectManager.load).toHaveBeenCalledWith(["sg1"]);
    expect(objectManager.load).toHaveBeenCalledWith(["ss1"]);
    expect(objectManager.load).toHaveBeenCalledWith(["ls1"]);
    expect(objectManager.load).toHaveBeenCalledWith(["w1"]);
    expect(objectManager.load).toHaveBeenCalledWith(["fa1"]);
    expect(objectManager.load).not.toHaveBeenCalledWith(["r1"]);
  });

  it("handles an empty research queue without throwing", () => {
    expect(() => unlockScenery()).not.toThrow();
  });
});

