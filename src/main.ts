import { MemoryManager } from "memory/MemoryManager";
import { DefenseManager } from "managers/DefenseManager";
import { ColonySpawn } from "spawning/ColonySpawn";
import { CreepManager } from "creeps/CreepManager";

export function loop(): void {
  MemoryManager.initialize();
  MemoryManager.cleanupDeadCreeps();
  DefenseManager.run();
  ColonySpawn.run();
  CreepManager.run();
}
