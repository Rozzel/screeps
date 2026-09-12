import type { Role } from "./Role";

export class CarrierRole implements Role {
  run(creep: Creep): void {
    if (creep.store[RESOURCE_ENERGY] !== creep.store.getCapacity(RESOURCE_ENERGY)) {
      const dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
      if (dropped) {
        if (creep.pickup(dropped) === ERR_NOT_IN_RANGE) {
          creep.moveTo(dropped, {
            visualizePathStyle: {
              stroke: "#ffaa00"
            }
          });
        }
        creep.say("drop");
      } else {
        const containers = creep.room.find(FIND_STRUCTURES, {
          filter: (i) =>
            (i.structureType === STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > 0) ||
            (i.structureType === STRUCTURE_STORAGE && i.store[RESOURCE_ENERGY] > 0)
        });

        if (creep.withdraw(containers[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(containers[0], {
            visualizePathStyle: {
              stroke: "#ffaa00"
            }
          });
        }
      }
    } else {
      const targets = creep.room.find(FIND_STRUCTURES, {
        filter: (
          structure
        ): structure is
          StructureExtension | StructureSpawn | StructureTower | StructurePowerSpawn => {
          return (
            (structure.structureType === STRUCTURE_EXTENSION ||
              structure.structureType === STRUCTURE_SPAWN ||
              structure.structureType === STRUCTURE_TOWER ||
              structure.structureType === STRUCTURE_POWER_SPAWN) &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
          );
        }
      });

      const targetsStorage = creep.room.find(FIND_STRUCTURES, {
        filter: (structure): structure is StructureStorage =>
          structure.structureType === STRUCTURE_STORAGE
      });

      if (targets.length > 0) {
        if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          for (const resourceType of RESOURCES_ALL) {
            if (creep.store[resourceType] > 0) {
              creep.transfer(targets[0], resourceType);
            }
          }
          creep.moveTo(targets[0], {
            visualizePathStyle: {
              stroke: "#ffffff"
            }
          });
        }
      } else if (targetsStorage[0]) {
        if (creep.transfer(targetsStorage[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          for (const resourceType of RESOURCES_ALL) {
            if (creep.store[resourceType] > 0) {
              creep.transfer(targetsStorage[0], resourceType);
            }
          }
          creep.moveTo(targetsStorage[0], {
            visualizePathStyle: {
              stroke: "#ffffff"
            }
          });
        }
      }
    }
  }
}
