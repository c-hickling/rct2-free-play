/// <reference path="../node_modules/@openrct2/types/openrct2.d.ts" />
import { describe, it, expect, beforeEach, vi } from "vitest";
import { applyFreePlay, addMoney } from "../src/free-play/index";

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

describe("addMoney", () => {
  beforeEach(() => {
    vi.stubGlobal("park", { cash: 0 });
  });

  it("adds 10000 to park cash", () => {
    addMoney();
    expect(park.cash).toBe(10000);
  });

  it("adds 10000 on each call", () => {
    addMoney();
    addMoney();
    expect(park.cash).toBe(20000);
  });
});
