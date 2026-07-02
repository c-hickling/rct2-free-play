/// <reference path="../../node_modules/@openrct2/types/openrct2.d.ts" />

const SCENARIOS_MODE_KEY = "interface.scenarios_select_mode";
const SCENARIOS_MODE_ALL = 0;
const SCENARIOS_MODE_DEFAULT = 1;

export function allScenariosUnlocked(): boolean {
  return (context.configuration.get<number>(SCENARIOS_MODE_KEY) ?? SCENARIOS_MODE_DEFAULT) === SCENARIOS_MODE_ALL;
}

export function toggleUnlockAllScenarios(): void {
  context.configuration.set(SCENARIOS_MODE_KEY, allScenariosUnlocked() ? SCENARIOS_MODE_DEFAULT : SCENARIOS_MODE_ALL);
}
