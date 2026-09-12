import { MemoryManager } from "memory/MemoryManager";
import { DefenseManager } from "managers/DefenseManager";
import { RoadPlanner } from "managers/RoadPlanner";
import { StructurePlanner } from "managers/StructurePlanner";
import { ColonySpawn } from "spawning/ColonySpawn";
import { CreepManager } from "creeps/CreepManager";

export function loop(): void {
  MemoryManager.initialize();
  MemoryManager.cleanupDeadCreeps();
  DefenseManager.run();
  RoadPlanner.run();
  StructurePlanner.run();
  ColonySpawn.run();
  CreepManager.run();
}
