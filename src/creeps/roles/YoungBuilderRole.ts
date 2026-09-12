import type { Role } from "./Role";
import { scavengeEnergy } from "creeps/tasks/scavengeEnergy";

/** Строит construction sites: economy-структуры приоритетнее дорог. */
export class YoungBuilderRole implements Role {
  run(creep: Creep): void {
    if (creep.memory.building && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.building = false;
      creep.say("harvest");
    }
    if (!creep.memory.building && creep.store.getFreeCapacity() === 0) {
      creep.memory.building = true;
      creep.say("build");
    }

    if (creep.memory.building) {
      const site =
        creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {
          filter: (s) =>
            s.structureType === STRUCTURE_STORAGE ||
            s.structureType === STRUCTURE_CONTAINER ||
            s.structureType === STRUCTURE_LINK ||
            s.structureType === STRUCTURE_EXTENSION ||
            s.structureType === STRUCTURE_TOWER
        }) ??
        creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {
          filter: (s) => s.structureType === STRUCTURE_ROAD
        }) ??
        creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);

      if (!site) {
        creep.say("no site");
        return;
      }

      if (creep.build(site) === ERR_NOT_IN_RANGE) {
        creep.moveTo(site, { visualizePathStyle: { stroke: "#ffffff" } });
      }
      return;
    }

    if (scavengeEnergy(creep)) {
      return;
    }

    const source =
      creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE) ??
      creep.pos.findClosestByRange(FIND_SOURCES);

    if (!source) {
      creep.say("no src");
      return;
    }

    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
      creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
    }
  }
}
