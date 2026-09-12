import type { Role } from "./Role";

export class HarvesterRole implements Role {
  run(creep: Creep): void {
    if (creep.store[RESOURCE_ENERGY] === creep.store.getCapacity(RESOURCE_ENERGY)) {
      const containers = creep.room.find(FIND_STRUCTURES, {
        filter: {
          structureType: STRUCTURE_CONTAINER
        }
      });
      if (creep.transfer(containers[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(containers[0], {
          visualizePathStyle: {
            stroke: "#ffaa00"
          }
        });
      } else {
        for (const resourceType of RESOURCES_ALL) {
          if (creep.store[resourceType] > 0) {
            creep.transfer(containers[0], resourceType);
          }
        }
      }
    } else {
      const sources = creep.room.find(FIND_SOURCES);
      if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], {
          visualizePathStyle: {
            stroke: "#ffaa00"
          }
        });
      }
    }
  }
}
