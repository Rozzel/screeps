export const CURRENT_SCHEMA_VERSION = 1;

export function ensureMemoryDefaults(): void {
  if (Memory.schemaVersion === undefined) {
    Memory.schemaVersion = CURRENT_SCHEMA_VERSION;
  }
  if (Memory.creeps === undefined) {
    Memory.creeps = {};
  }
}
