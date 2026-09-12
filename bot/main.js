'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const CURRENT_SCHEMA_VERSION = 1;
function ensureMemoryDefaults() {
    if (Memory.schemaVersion === undefined) {
        Memory.schemaVersion = CURRENT_SCHEMA_VERSION;
    }
    if (Memory.creeps === undefined) {
        Memory.creeps = {};
    }
}

class MemoryManager {
    static initialize() {
        ensureMemoryDefaults();
        while (Memory.schemaVersion < CURRENT_SCHEMA_VERSION) {
            MemoryManager.migrate(Memory.schemaVersion);
        }
    }
    static migrate(version) {
        switch (version) {
            case 0:
                Memory.schemaVersion = 1;
                break;
            default:
                Memory.schemaVersion = CURRENT_SCHEMA_VERSION;
                break;
        }
    }
    static cleanupDeadCreeps() {
        for (const name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log("Clearing non-existing creep memory:", name);
            }
        }
    }
}

class DefenseManager {
    static run() {
        var _a;
        for (const roomName in Game.rooms) {
            const room = Game.rooms[roomName];
            if (!((_a = room.controller) === null || _a === void 0 ? void 0 : _a.my)) {
                continue;
            }
            const towers = room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => structure.structureType === STRUCTURE_TOWER
            });
            for (const tower of towers) {
                DefenseManager.runTower(tower);
            }
        }
    }
    static runTower(tower) {
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

/** Этап 0 колонии: RCL1, один spawn, без контейнеров. */
function getBootstrapQuotas(room) {
    const sites = room.find(FIND_MY_CONSTRUCTION_SITES).length;
    const quotas = [
        {
            role: "bootstrap",
            maxAmount: 3,
            body: [WORK, CARRY, MOVE]
        }
    ];
    if (sites > 0) {
        quotas.push({
            role: "youngBuilder",
            maxAmount: 1,
            body: [WORK, CARRY, MOVE]
        });
    }
    return quotas;
}

class ColonySpawn {
    static run() {
        for (const spawnName in Game.spawns) {
            const spawn = Game.spawns[spawnName];
            if (!spawn.my) {
                continue;
            }
            ColonySpawn.runSpawn(spawn);
        }
    }
    static runSpawn(spawn) {
        if (spawn.spawning) {
            const spawningCreep = Game.creeps[spawn.spawning.name];
            if (spawningCreep) {
                spawn.room.visual.text(spawningCreep.memory.role, spawn.pos.x + 1, spawn.pos.y, {
                    align: "left",
                    opacity: 0.8
                });
            }
            return;
        }
        const roomCreeps = spawn.room.find(FIND_MY_CREEPS);
        const quotas = getBootstrapQuotas(spawn.room);
        // Аварийный bootstrap: нет крипов — спавним первого любой ценой по энергии.
        if (roomCreeps.length === 0) {
            ColonySpawn.trySpawn(spawn, "bootstrap", "boot", [WORK, CARRY, MOVE]);
            return;
        }
        for (const quota of quotas) {
            const count = _.filter(roomCreeps, (creep) => creep.memory.role === quota.role).length;
            if (count < quota.maxAmount) {
                ColonySpawn.trySpawn(spawn, quota.role, quota.role, quota.body);
                return;
            }
        }
    }
    static trySpawn(spawn, role, prefix, body) {
        const name = `${prefix}-${Game.time}`;
        const result = spawn.spawnCreep(body, name, {
            memory: {
                role
            }
        });
        if (result === OK) {
            console.log(`Spawn ${spawn.name}: ${role} (${name})`);
        }
        else if (result !== ERR_NOT_ENOUGH_ENERGY && result !== ERR_BUSY) {
            console.log(`Spawn ${spawn.name} failed ${role}: ${result}`);
        }
    }
}

/**
 * Универсальный рабочий RCL1:
 * source → spawn/extensions → controller (если склад заполнен).
 */
class BootstrapRole {
    run(creep) {
        if (creep.store.getFreeCapacity() > 0) {
            this.harvest(creep);
            return;
        }
        if (this.deliverToSpawnEconomy(creep)) {
            return;
        }
        this.upgrade(creep);
    }
    harvest(creep) {
        var _a;
        const source = (_a = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE)) !== null && _a !== void 0 ? _a : creep.pos.findClosestByPath(FIND_SOURCES);
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
    deliverToSpawnEconomy(creep) {
        const target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType === STRUCTURE_SPAWN ||
                    structure.structureType === STRUCTURE_EXTENSION) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
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
    upgrade(creep) {
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

class CarrierRole {
    run(creep) {
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
            }
            else {
                const containers = creep.room.find(FIND_STRUCTURES, {
                    filter: (i) => (i.structureType === STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > 0) ||
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
        else {
            const targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType === STRUCTURE_EXTENSION ||
                        structure.structureType === STRUCTURE_SPAWN ||
                        structure.structureType === STRUCTURE_TOWER ||
                        structure.structureType === STRUCTURE_POWER_SPAWN) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
                }
            });
            const targetsStorage = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType === STRUCTURE_STORAGE
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
            }
            else if (targetsStorage[0]) {
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

class HarvesterRole {
    run(creep) {
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
            }
            else {
                for (const resourceType of RESOURCES_ALL) {
                    if (creep.store[resourceType] > 0) {
                        creep.transfer(containers[0], resourceType);
                    }
                }
            }
        }
        else {
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

class BuilderRole {
    run(creep) {
        if (creep.memory.building && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.building = false;
            creep.say("energy");
        }
        if (!creep.memory.building &&
            creep.store[RESOURCE_ENERGY] === creep.store.getCapacity(RESOURCE_ENERGY)) {
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
        }
        else {
            const containers = creep.room.find(FIND_STRUCTURES, {
                filter: (i) => (i.structureType === STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > 0) ||
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

class UpgraderRole {
    run(creep) {
        if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.upgrading = false;
            creep.say("energy");
        }
        if (!creep.memory.upgrading &&
            creep.store[RESOURCE_ENERGY] === creep.store.getCapacity(RESOURCE_ENERGY)) {
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
        }
        else {
            const containers = creep.room.find(FIND_STRUCTURES, {
                filter: (i) => (i.structureType === STRUCTURE_STORAGE && i.store[RESOURCE_ENERGY] > 0) ||
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

class YoungHarvesterRole {
    run(creep) {
        var _a, _b;
        // На RCL1 youngHarvester = bootstrap (spawn полон → upgrade).
        if (creep.store.getFreeCapacity() > 0) {
            const source = (_a = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE)) !== null && _a !== void 0 ? _a : creep.pos.findClosestByPath(FIND_SOURCES);
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
            filter: (structure) => {
                return ((structure.structureType === STRUCTURE_SPAWN ||
                    structure.structureType === STRUCTURE_EXTENSION) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
            }
        });
        if (sink) {
            if (creep.transfer(sink, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(sink, { visualizePathStyle: { stroke: "#ffffff" } });
            }
            creep.say("fill");
            return;
        }
        if ((_b = creep.room.controller) === null || _b === void 0 ? void 0 : _b.my) {
            if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: "#00ff00" } });
            }
            creep.say("upgrade");
        }
    }
}

class YoungBuilderRole {
    run(creep) {
        if (creep.memory.building && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.building = false;
            creep.say("harvest");
        }
        if (!creep.memory.building && creep.store.getFreeCapacity() === 0) {
            creep.memory.building = true;
            creep.say("build");
        }
        if (creep.memory.building) {
            const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if (targets.length) {
                if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], { visualizePathStyle: { stroke: "#ffffff" } });
                }
            }
        }
        else {
            const sources = creep.room.find(FIND_SOURCES);
            if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], { visualizePathStyle: { stroke: "#ffaa00" } });
            }
        }
    }
}

class YoungUpgraderRole {
    run(creep) {
        if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.upgrading = false;
            creep.say("harvest");
        }
        if (!creep.memory.upgrading && creep.store.getFreeCapacity() === 0) {
            creep.memory.upgrading = true;
            creep.say("upgrade");
        }
        if (creep.memory.upgrading) {
            if (creep.room.controller) {
                if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: "#ffffff" } });
                }
            }
        }
        else {
            const sources = creep.room.find(FIND_SOURCES);
            if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], { visualizePathStyle: { stroke: "#ffaa00" } });
            }
        }
    }
}

const roles = {
    bootstrap: new BootstrapRole(),
    carrier: new CarrierRole(),
    harvester: new HarvesterRole(),
    builder: new BuilderRole(),
    upgrader: new UpgraderRole(),
    youngHarvester: new YoungHarvesterRole(),
    youngBuilder: new YoungBuilderRole(),
    youngUpgrader: new YoungUpgraderRole()
};
class CreepManager {
    static run() {
        for (const name in Game.creeps) {
            const creep = Game.creeps[name];
            const role = roles[creep.memory.role];
            if (role) {
                role.run(creep);
            }
            else {
                // Крип без роли / legacy — ведем как bootstrap RCL1.
                roles.bootstrap.run(creep);
            }
        }
    }
}

function loop() {
    MemoryManager.initialize();
    MemoryManager.cleanupDeadCreeps();
    DefenseManager.run();
    ColonySpawn.run();
    CreepManager.run();
}

exports.loop = loop;
//# sourceMappingURL=main.js.map
