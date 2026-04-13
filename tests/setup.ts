// Stub OpenRCT2 globals that are referenced at module import time.
// Functions that call park/objectManager/context only need them stubbed before
// the function is called, which happens in each test's beforeEach.

(globalThis as Record<string, unknown>).registerPlugin = () => {};
