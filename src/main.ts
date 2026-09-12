import { MemoryManager } from "memory/MemoryManager";
import { DefenseManager } from "managers/DefenseManager";
import { LegacySpawn } from "spawning/LegacySpawn";
import { CreepManager } from "creeps/CreepManager";

export function loop(): void {
  MemoryManager.initialize();
  MemoryManager.cleanupDeadCreeps();
  DefenseManager.run();
  LegacySpawn.run();
  CreepManager.run();
}
