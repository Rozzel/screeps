/**
 * Авто-планирование container / storage / link по RCL-воротам.
 * @see docs/strategies/structure-planning.md
 * @see https://docs.screeps.com/api/#StructureContainer
 * @see https://docs.screeps.com/api/#StructureStorage
 * @see https://docs.screeps.com/api/#StructureLink
 */
export class StructurePlanner {
  private static readonly MAX_SITES_PER_TICK = 3;

  static run(): void {
    for (const spawnName in Game.spawns) {
      const spawn = Game.spawns[spawnName];
      if (!spawn.my) {
        continue;
      }

      const room = spawn.room;
      const rcl = room.controller?.level ?? 0;
      let placed = 0;

      placed += StructurePlanner.planContainers(room, rcl, placed);
      if (placed >= StructurePlanner.MAX_SITES_PER_TICK) {
        continue;
      }

      placed += StructurePlanner.planStorage(room, spawn, rcl, placed);
      if (placed >= StructurePlanner.MAX_SITES_PER_TICK) {
        continue;
      }

      StructurePlanner.planLinks(room, rcl, placed);
    }
  }

  /** RCL ≥ 2: container у каждого source. */
  private static planContainers(room: Room, rcl: number, alreadyPlaced: number): number {
    if (rcl < 2) {
      return 0;
    }

    const maxContainers = CONTROLLER_STRUCTURES[STRUCTURE_CONTAINER][rcl] ?? 0;
    if (maxContainers <= 0) {
      return 0;
    }

    const existing =
      room.find(FIND_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_CONTAINER })
        .length +
      room.find(FIND_MY_CONSTRUCTION_SITES, {
        filter: (s) => s.structureType === STRUCTURE_CONTAINER
      }).length;

    if (existing >= maxContainers) {
      return 0;
    }

    let placed = 0;
    const budget = StructurePlanner.MAX_SITES_PER_TICK - alreadyPlaced;
    const sources = room.find(FIND_SOURCES);

    for (const source of sources) {
      if (placed >= budget) {
        break;
      }

      if (StructurePlanner.hasStructureOrSiteNear(source.pos, STRUCTURE_CONTAINER, 1)) {
        continue;
      }

      const spot = StructurePlanner.findBuildSpot(source.pos, room, 1);
      if (!spot) {
        continue;
      }

      if (room.createConstructionSite(spot.x, spot.y, STRUCTURE_CONTAINER) === OK) {
        placed++;
      }
    }

    return placed;
  }

  /** RCL ≥ 4: один storage у spawn. */
  private static planStorage(
    room: Room,
    spawn: StructureSpawn,
    rcl: number,
    alreadyPlaced: number
  ): number {
    if (rcl < 4) {
      return 0;
    }

    const maxStorage = CONTROLLER_STRUCTURES[STRUCTURE_STORAGE][rcl] ?? 0;
    if (maxStorage <= 0) {
      return 0;
    }

    const hasStorage =
      room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_STORAGE })
        .length > 0 ||
      room.find(FIND_MY_CONSTRUCTION_SITES, {
        filter: (s) => s.structureType === STRUCTURE_STORAGE
      }).length > 0;

    if (hasStorage) {
      return 0;
    }

    if (alreadyPlaced >= StructurePlanner.MAX_SITES_PER_TICK) {
      return 0;
    }

    const spot = StructurePlanner.findBuildSpot(spawn.pos, room, 2);
    if (!spot) {
      return 0;
    }

    return room.createConstructionSite(spot.x, spot.y, STRUCTURE_STORAGE) === OK ? 1 : 0;
  }

  /**
   * RCL ≥ 5 + storage/site: hub-link у storage и source-link у source.
   * Передача энергии — отдельный LinkManager (этап 4).
   */
  private static planLinks(room: Room, rcl: number, alreadyPlaced: number): number {
    if (rcl < 5) {
      return 0;
    }

    const maxLinks = CONTROLLER_STRUCTURES[STRUCTURE_LINK][rcl] ?? 0;
    if (maxLinks < 2) {
      return 0;
    }

    const storage =
      room.find(FIND_MY_STRUCTURES, {
        filter: (s): s is StructureStorage => s.structureType === STRUCTURE_STORAGE
      })[0] ?? null;

    const storageSite = room.find(FIND_MY_CONSTRUCTION_SITES, {
      filter: (s) => s.structureType === STRUCTURE_STORAGE
    })[0];

    if (!storage && !storageSite) {
      return 0;
    }

    const hubAnchor = storage?.pos ?? storageSite.pos;

    const existingLinks =
      room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_LINK }).length +
      room.find(FIND_MY_CONSTRUCTION_SITES, {
        filter: (s) => s.structureType === STRUCTURE_LINK
      }).length;

    if (existingLinks >= maxLinks) {
      return 0;
    }

    let placed = 0;
    let budget = StructurePlanner.MAX_SITES_PER_TICK - alreadyPlaced;

    if (!StructurePlanner.hasStructureOrSiteNear(hubAnchor, STRUCTURE_LINK, 1) && budget > 0) {
      const hubSpot = StructurePlanner.findBuildSpot(hubAnchor, room, 1);
      if (hubSpot && room.createConstructionSite(hubSpot.x, hubSpot.y, STRUCTURE_LINK) === OK) {
        placed++;
        budget--;
      }
    }

    const sources = room.find(FIND_SOURCES);
    for (const source of sources) {
      if (budget <= 0 || existingLinks + placed >= maxLinks) {
        break;
      }
      if (StructurePlanner.hasStructureOrSiteNear(source.pos, STRUCTURE_LINK, 1)) {
        continue;
      }

      const spot = StructurePlanner.findBuildSpot(source.pos, room, 1);
      if (!spot) {
        continue;
      }

      if (room.createConstructionSite(spot.x, spot.y, STRUCTURE_LINK) === OK) {
        placed++;
        budget--;
      }
    }

    return placed;
  }

  private static hasStructureOrSiteNear(
    pos: RoomPosition,
    structureType: BuildableStructureConstant,
    range: number
  ): boolean {
    const structures = pos.findInRange(FIND_STRUCTURES, range, {
      filter: (s) => s.structureType === structureType
    });
    if (structures.length > 0) {
      return true;
    }

    const sites = pos.findInRange(FIND_CONSTRUCTION_SITES, range, {
      filter: (s) => s.structureType === structureType
    });
    return sites.length > 0;
  }

  /** Ближайшая walkable клетка в range без блокирующих структур (дорога ок). */
  private static findBuildSpot(
    center: RoomPosition,
    room: Room,
    range: number
  ): RoomPosition | null {
    const terrain = room.getTerrain();
    let best: RoomPosition | null = null;
    let bestScore = Infinity;

    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        if (dx === 0 && dy === 0) {
          continue;
        }

        const x = center.x + dx;
        const y = center.y + dy;
        if (x < 1 || x > 48 || y < 1 || y > 48) {
          continue;
        }

        if (terrain.get(x, y) === TERRAIN_MASK_WALL) {
          continue;
        }

        const structs = room.lookForAt(LOOK_STRUCTURES, x, y);
        const blocked = structs.some(
          (s) => s.structureType !== STRUCTURE_ROAD && s.structureType !== STRUCTURE_RAMPART
        );
        if (blocked) {
          continue;
        }

        if (room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y).length > 0) {
          continue;
        }

        const score =
          Math.max(Math.abs(dx), Math.abs(dy)) * 10 +
          (terrain.get(x, y) === TERRAIN_MASK_SWAMP ? 5 : 0);
        if (score < bestScore) {
          bestScore = score;
          best = new RoomPosition(x, y, room.name);
        }
      }
    }

    return best;
  }
}
