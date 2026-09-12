import { Role } from "./Role";

export class BuilderRole implements Role {
  run(creep: Creep): void {
    if (creep.memory.building && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.building = false;
      creep.say("energy");
    }
    if (
      !creep.memory.building &&
      creep.store[RESOURCE_ENERGY] === creep.store.getCapacity(RESOURCE_ENERGY)
    ) {
      creep.memory.building = true;
      creep.say("build");
    }

    if (creep.memory.building) {
      const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], {
            visualizePathStyle: {
              stroke: "#ffffff"
            }
          });
        }
      }
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
  }
}
