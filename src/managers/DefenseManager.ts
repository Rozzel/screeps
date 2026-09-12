export class DefenseManager {
  static run(): void {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (!room.controller?.my) {
        continue;
      }

      const towers = room.find(FIND_MY_STRUCTURES, {
        filter: (structure): structure is StructureTower =>
          structure.structureType === STRUCTURE_TOWER
      });

      for (const tower of towers) {
        DefenseManager.runTower(tower);
      }
    }
  }

  private static runTower(tower: StructureTower): void {
    const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
      tower.attack(closestHostile);
      return;
    }

    const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (structure) => structure.hits < structure.hitsMax
    });
    if (closestDamagedStructure) {
      tower.repair(closestDamagedStructure);
    }
  }
}
