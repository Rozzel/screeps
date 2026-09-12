/**
 * Авто-маршруты дорог: Spawn → Sources (FIND_SOURCES).
 * @see https://docs.screeps.com/api/#Room.findPath
 * @see https://docs.screeps.com/api/#Room.createConstructionSite
 */
export class RoadPlanner {
  private static readonly MAX_SITES_PER_TICK = 5;

  static run(): void {
    for (const spawnName in Game.spawns) {
      const spawn = Game.spawns[spawnName];
      if (!spawn.my) {
        continue;
      }
      RoadPlanner.planSpawnToSources(spawn);
    }
  }

  private static planSpawnToSources(spawn: StructureSpawn): void {
    let placed = 0;
    const sources = spawn.room.find(FIND_SOURCES);

    for (const source of sources) {
      if (placed >= RoadPlanner.MAX_SITES_PER_TICK) {
        return;
      }

      const path = spawn.room.findPath(spawn.pos, source.pos, {
        ignoreCreeps: true,
        range: 1,
        maxOps: 2000
      });

      for (const step of path) {
        if (placed >= RoadPlanner.MAX_SITES_PER_TICK) {
          return;
        }

        if (RoadPlanner.hasRoadOrSite(spawn.room, step.x, step.y)) {
          continue;
        }

        const result = spawn.room.createConstructionSite(step.x, step.y, STRUCTURE_ROAD);
        if (result === OK) {
          placed++;
        } else if (result === ERR_FULL) {
          return;
        }
      }
    }
  }

  private static hasRoadOrSite(room: Room, x: number, y: number): boolean {
    const structures = room.lookForAt(LOOK_STRUCTURES, x, y);
    for (const structure of structures) {
      if (structure.structureType === STRUCTURE_ROAD) {
        return true;
      }
    }

    const sites = room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y);
    for (const site of sites) {
      if (site.structureType === STRUCTURE_ROAD) {
        return true;
      }
    }

    return false;
  }
}
