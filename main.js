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

/** Новая колония: один Spawn1, тела под RCL1 (300 energy). */
const SPAWN_SPECS = [
    {
        spawnName: "Spawn1",
        droneName: "droneHarvester",
        droneRole: "youngHarvester",
        maxAmount: 2,
        droneBody: [WORK, CARRY, MOVE]
    },
    {
        spawnName: "Spawn1",
        droneName: "droneUpgrader",
        droneRole: "youngUpgrader",
        maxAmount: 1,
        droneBody: [WORK, CARRY, MOVE]
    },
    {
        spawnName: "Spawn1",
        droneName: "droneBuilder",
        droneRole: "youngBuilder",
        maxAmount: 1,
        droneBody: [WORK, CARRY, MOVE]
    }
];
class LegacySpawn {
    static run() {
        for (const spec of SPAWN_SPECS) {
            LegacySpawn.spawning(spec.spawnName, spec.droneName, spec.droneRole, spec.maxAmount, spec.droneBody);
        }
    }
    static spawning(spawnName, droneName, droneRole, maxAmount, droneBody) {
        const spawn = Game.spawns[spawnName];
        if (!spawn) {
            return;
        }
        const creeps = _.filter(Game.creeps, (creep) => creep.memory.role === droneRole);
        if (creeps.length < maxAmount) {
            const newName = `${droneName}-${Game.time}`;
            spawn.spawnCreep(droneBody, newName, {
                memory: {
                    role: droneRole
                }
            });
        }
        if (spawn.spawning) {
            const spawningCreep = Game.creeps[spawn.spawning.name];
            if (spawningCreep) {
                spawn.room.visual.text(spawningCreep.memory.role, spawn.pos.x + 1, spawn.pos.y, {
                    align: "left",
                    opacity: 0.8
                });
            }
        }
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
        if (creep.store.getFreeCapacity() > 0) {
            const sources = creep.room.find(FIND_SOURCES);
            if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], { visualizePathStyle: { stroke: "#ffaa00" } });
            }
            creep.say("harvest");
        }
        else {
            const targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType === STRUCTURE_EXTENSION ||
                        structure.structureType === STRUCTURE_SPAWN) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
                }
            });
            if (targets.length > 0) {
                if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], { visualizePathStyle: { stroke: "#ffffff" } });
                }
            }
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
        }
    }
}

function loop() {
    MemoryManager.initialize();
    MemoryManager.cleanupDeadCreeps();
    DefenseManager.run();
    LegacySpawn.run();
    CreepManager.run();
}

exports.loop = loop;
//# sourceMappingURL=main.js.map
