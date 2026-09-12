import type { Role } from "./Role";

export class UpgraderRole implements Role {
  run(creep: Creep): void {
    if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.upgrading = false;
      creep.say("energy");
    }
    if (
      !creep.memory.upgrading &&
      creep.store[RESOURCE_ENERGY] === creep.store.getCapacity(RESOURCE_ENERGY)
    ) {
      creep.memory.upgrading = true;
      creep.say("upgrade");
    }

    if (creep.memory.upgrading) {
      if (creep.room.controller) {
        if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
          creep.moveTo(creep.room.controller, {
            visualizePathStyle: {
              stroke: "#ffffff"
            }
          });
        }
      }
    } else {
      const containers = creep.room.find(FIND_STRUCTURES, {
        filter: (i) =>
          (i.structureType === STRUCTURE_STORAGE && i.store[RESOURCE_ENERGY] > 0) ||
          (i.structureType === STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > 0)
      });
      if (creep.withdraw(containers[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(containers[0], {
          visualizePathStyle: {
            stroke: "#ffaa00"
          }
        });
      }
    }
  }
}
