import { Role } from "./Role";

/**
 * Универсальный рабочий RCL1:
 * source → spawn/extensions → controller (если склад заполнен).
 */
export class BootstrapRole implements Role {
  run(creep: Creep): void {
    if (creep.store.getFreeCapacity() > 0) {
      this.harvest(creep);
      return;
    }

    if (this.deliverToSpawnEconomy(creep)) {
      return;
    }

    this.upgrade(creep);
  }

  private harvest(creep: Creep): void {
    const source =
      creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE) ??
      creep.pos.findClosestByPath(FIND_SOURCES);

    if (!source) {
      creep.say("no src");
      return;
    }

    const result = creep.harvest(source);
    if (result === ERR_NOT_IN_RANGE) {
      creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
    }
    creep.say("harvest");
  }

  private deliverToSpawnEconomy(creep: Creep): boolean {
    const target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
      filter: (structure): structure is StructureSpawn | StructureExtension => {
        return (
          (structure.structureType === STRUCTURE_SPAWN ||
            structure.structureType === STRUCTURE_EXTENSION) &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        );
      }
    });

    if (!target) {
      return false;
    }

    if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
    }
    creep.say("fill");
    return true;
  }

  private upgrade(creep: Creep): void {
    const controller = creep.room.controller;
    if (!controller || !controller.my) {
      creep.say("idle");
      return;
    }

    if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
      creep.moveTo(controller, { visualizePathStyle: { stroke: "#00ff00" } });
    }
    creep.say("upgrade");
  }
}
