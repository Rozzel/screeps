import { Role } from "./Role";

export class YoungHarvesterRole implements Role {
  run(creep: Creep): void {
    // На RCL1 youngHarvester = bootstrap (spawn полон → upgrade).
    if (creep.store.getFreeCapacity() > 0) {
      const source =
        creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE) ??
        creep.pos.findClosestByPath(FIND_SOURCES);
      if (!source) {
        return;
      }
      if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
      creep.say("harvest");
      return;
    }

    const sink = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
      filter: (structure): structure is StructureSpawn | StructureExtension => {
        return (
          (structure.structureType === STRUCTURE_SPAWN ||
            structure.structureType === STRUCTURE_EXTENSION) &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        );
      }
    });

    if (sink) {
      if (creep.transfer(sink, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(sink, { visualizePathStyle: { stroke: "#ffffff" } });
      }
      creep.say("fill");
      return;
    }

    if (creep.room.controller?.my) {
      if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: "#00ff00" } });
      }
      creep.say("upgrade");
    }
  }
}
