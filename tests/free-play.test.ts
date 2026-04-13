/// <reference path="../node_modules/@openrct2/types/openrct2.d.ts" />
import { describe, it, expect, beforeEach, vi } from "vitest";
import { applyFreePlay, applyUnlimitedMoney, applySettings, isFreePlayEnabled, isUnlimitedMoneyEnabled } from "../src/free-play/index";

// --- Helpers ---

function makeScenario(objectiveType: ScenarioObjectiveType = "guestsAndRating"): Scenario {
  return {
    name: "Test",
    details: "",
    completedBy: "",
    filename: "test.sc6",
    objective: { type: objectiveType, guests: 1000, year: 4, length: 1200, excitement: 600, parkValue: 10000, monthlyIncome: 1000 },
    parkRatingWarningDays: 0,
    completedCompanyValue: undefined,
    status: "inProgress",
    companyValueRecord: 0,
  };
}

function makeCheats(): Cheats {
  return {
    allowArbitraryRideTypeChanges: false,
    allowSpecialColourSchemes: false,
    allowTrackPlaceInvalidHeights: false,
    buildInPauseMode: false,
    disableAllBreakdowns: false,
    disableBrakesFailure: false,
    disableClearanceChecks: false,
    disableLittering: false,
    disablePlantAging: false,
    disableRideValueAging: false,
    disableSupportLimits: false,
    disableTrainLengthLimit: false,
    disableVandalism: false,
    enableAllDrawableTrackPieces: false,
    enableChainLiftOnAllTrack: false,
    fastLiftHill: false,
    forcedParkRating: 0,
    freezeWeather: false,
    ignoreResearchStatus: false,
    ignoreRideIntensity: false,
    ignoreRidePrice: false,
    neverendingMarketing: false,
    makeAllDestructible: false,
    sandboxMode: false,
    showAllOperatingModes: false,
    showVehiclesFromOtherTrackTypes: false,
    allowRegularPathAsQueue: false,
  };
}

// --- Tests ---

describe("applyFreePlay", () => {
  let testScenario: Scenario;
  let testCheats: Cheats;

  beforeEach(() => {
    testScenario = makeScenario();
    testCheats = makeCheats();

    vi.stubGlobal("scenario", testScenario);
    vi.stubGlobal("cheats", testCheats);
  });

  it("sets objective type to none when enabled", () => {
    applyFreePlay(true);
    expect(testScenario.objective.type).toBe("none");
  });

  it("forces park rating to 999 when enabled", () => {
    applyFreePlay(true);
    expect(testCheats.forcedParkRating).toBe(999);
  });

  it("resets park rating warning days to 0 when enabled", () => {
    testScenario.parkRatingWarningDays = 120;
    applyFreePlay(true);
    expect(testScenario.parkRatingWarningDays).toBe(0);
  });

  it("clears forced park rating when disabled", () => {
    testCheats.forcedParkRating = 999;
    applyFreePlay(false);
    expect(testCheats.forcedParkRating).toBe(0);
  });

  it("does not touch the objective when disabled", () => {
    applyFreePlay(false);
    expect(testScenario.objective.type).toBe("guestsAndRating");
  });
});

describe("applyUnlimitedMoney", () => {
  let flags: Partial<Record<ParkFlags, boolean>>;

  beforeEach(() => {
    flags = {};
    vi.stubGlobal("park", {
      getFlag: (f: ParkFlags) => flags[f] ?? false,
      setFlag: (f: ParkFlags, v: boolean) => { flags[f] = v; },
    });
  });

  it("sets noMoney flag when enabled", () => {
    applyUnlimitedMoney(true);
    expect(flags["noMoney"]).toBe(true);
  });

  it("clears noMoney flag when disabled", () => {
    flags["noMoney"] = true;
    applyUnlimitedMoney(false);
    expect(flags["noMoney"]).toBe(false);
  });
});

describe("applySettings", () => {
  let testScenario: Scenario;
  let testCheats: Cheats;
  let flags: Partial<Record<ParkFlags, boolean>>;
  const storage = new Map<string, unknown>();

  beforeEach(() => {
    testScenario = makeScenario();
    testCheats = makeCheats();
    flags = {};
    storage.clear();

    vi.stubGlobal("scenario", testScenario);
    vi.stubGlobal("cheats", testCheats);
    vi.stubGlobal("park", {
      getFlag: (f: ParkFlags) => flags[f] ?? false,
      setFlag: (f: ParkFlags, v: boolean) => { flags[f] = v; },
    });
    vi.stubGlobal("context", {
      sharedStorage: {
        get: (key: string, def: unknown) => storage.get(key) ?? def,
        set: (key: string, val: unknown) => storage.set(key, val),
        has: (key: string) => storage.has(key),
        getAll: () => Object.fromEntries(storage),
      },
    });
  });

  it("applies free play when setting is enabled", () => {
    storage.set("free-play.freePlay", true);
    applySettings();
    expect(testScenario.objective.type).toBe("none");
    expect(testCheats.forcedParkRating).toBe(999);
  });

  it("applies unlimited money when setting is enabled", () => {
    storage.set("free-play.unlimitedMoney", true);
    applySettings();
    expect(flags["noMoney"]).toBe(true);
  });

  it("does not apply free play when setting is disabled", () => {
    storage.set("free-play.freePlay", false);
    applySettings();
    expect(testScenario.objective.type).toBe("guestsAndRating");
    expect(testCheats.forcedParkRating).toBe(0);
  });

  it("defaults both settings to off", () => {
    applySettings();
    expect(testScenario.objective.type).toBe("guestsAndRating");
    expect(flags["noMoney"]).toBeFalsy();
  });
});
