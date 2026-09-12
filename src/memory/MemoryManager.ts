import { CURRENT_SCHEMA_VERSION, ensureMemoryDefaults } from "./defaults";

export class MemoryManager {
  static initialize(): void {
    ensureMemoryDefaults();

    while (Memory.schemaVersion < CURRENT_SCHEMA_VERSION) {
      MemoryManager.migrate(Memory.schemaVersion);
    }
  }

  private static migrate(version: number): void {
    switch (version) {
      case 0:
        Memory.schemaVersion = 1;
        break;
      default:
        Memory.schemaVersion = CURRENT_SCHEMA_VERSION;
        break;
    }
  }

  static cleanupDeadCreeps(): void {
    for (const name in Memory.creeps) {
      if (!Game.creeps[name]) {
        delete Memory.creeps[name];
        console.log("Clearing non-existing creep memory:", name);
      }
    }
  }
}
