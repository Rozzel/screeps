/*
 * EDUCATIONAL BUNDLE — не загружать в Screeps.
 * Читаемая сборка: комментарии сохранены, без минификации.
 * В игру идет только dist/main.js (сжатый).
 * screeps bot v0.1.0
 * built: 2026-09-12T14:16:56.037Z
 * git: 7d744ba
 */
// @ts-nocheck
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

/**
 * Авто-маршруты дорог: Spawn → Sources (FIND_SOURCES).
 * @see https://docs.screeps.com/api/#Room.findPath
 * @see https://docs.screeps.com/api/#Room.createConstructionSite
 */
class RoadPlanner {
    static run() {
        for (const spawnName in Game.spawns) {
            const spawn = Game.spawns[spawnName];
            if (!spawn.my) {
                continue;
            }
            RoadPlanner.planSpawnToSources(spawn);
        }
    }
    static planSpawnToSources(spawn) {
        let placed = 0;
        const sources = spawn.room.find(FIND_SOURCES);
        for (const source of sources) {
            if (placed >= RoadPlanner.MAX_SITES_PER_TICK) {
                return;
            }
            const path = spawn.room.findPath(spawn.pos, source.pos, {
                ignoreCreeps: true,
                range: 1,
                maxOps: 2000
            });
            for (const step of path) {
                if (placed >= RoadPlanner.MAX_SITES_PER_TICK) {
                    return;
                }
                if (RoadPlanner.hasRoadOrSite(spawn.room, step.x, step.y)) {
                    continue;
                }
                const result = spawn.room.createConstructionSite(step.x, step.y, STRUCTURE_ROAD);
                if (result === OK) {
                    placed++;
                }
                else if (result === ERR_FULL) {
                    return;
                }
            }
        }
    }
    static hasRoadOrSite(room, x, y) {
        const structures = room.lookForAt(LOOK_STRUCTURES, x, y);
        for (const structure of structures) {
            if (structure.structureType === STRUCTURE_ROAD) {
                return true;
            }
        }
        const sites = room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y);
        for (const site of sites) {
            if (site.structureType === STRUCTURE_ROAD) {
                return true;
            }
        }
        return false;
    }
}
RoadPlanner.MAX_SITES_PER_TICK = 5;

/**
 * Авто-планирование container / storage / link по RCL-воротам.
 * @see docs/strategies/structure-planning.md
 * @see https://docs.screeps.com/api/#StructureContainer
 * @see https://docs.screeps.com/api/#StructureStorage
 * @see https://docs.screeps.com/api/#StructureLink
 */
class StructurePlanner {
    static run() {
        var _a, _b;
        for (const spawnName in Game.spawns) {
            const spawn = Game.spawns[spawnName];
            if (!spawn.my) {
                continue;
            }
            const room = spawn.room;
            const rcl = (_b = (_a = room.controller) === null || _a === void 0 ? void 0 : _a.level) !== null && _b !== void 0 ? _b : 0;
            let placed = 0;
            placed += StructurePlanner.planContainers(room, rcl, placed);
            if (placed >= StructurePlanner.MAX_SITES_PER_TICK) {
                continue;
            }
            placed += StructurePlanner.planStorage(room, spawn, rcl, placed);
            if (placed >= StructurePlanner.MAX_SITES_PER_TICK) {
                continue;
            }
            StructurePlanner.planLinks(room, rcl, placed);
        }
    }
    /** RCL ≥ 2: container у каждого source. */
    static planContainers(room, rcl, alreadyPlaced) {
        var _a;
        if (rcl < 2) {
            return 0;
        }
        const maxContainers = (_a = CONTROLLER_STRUCTURES[STRUCTURE_CONTAINER][rcl]) !== null && _a !== void 0 ? _a : 0;
        if (maxContainers <= 0) {
            return 0;
        }
        const existing = room.find(FIND_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_CONTAINER })
            .length +
            room.find(FIND_MY_CONSTRUCTION_SITES, {
                filter: (s) => s.structureType === STRUCTURE_CONTAINER
            }).length;
        if (existing >= maxContainers) {
            return 0;
        }
        let placed = 0;
        const budget = StructurePlanner.MAX_SITES_PER_TICK - alreadyPlaced;
        const sources = room.find(FIND_SOURCES);
        for (const source of sources) {
            if (placed >= budget) {
                break;
            }
            if (StructurePlanner.hasStructureOrSiteNear(source.pos, STRUCTURE_CONTAINER, 1)) {
                continue;
            }
            const spot = StructurePlanner.findBuildSpot(source.pos, room, 1);
            if (!spot) {
                continue;
            }
            if (room.createConstructionSite(spot.x, spot.y, STRUCTURE_CONTAINER) === OK) {
                placed++;
            }
        }
        return placed;
    }
    /** RCL ≥ 4: один storage у spawn. */
    static planStorage(room, spawn, rcl, alreadyPlaced) {
        var _a;
        if (rcl < 4) {
            return 0;
        }
        const maxStorage = (_a = CONTROLLER_STRUCTURES[STRUCTURE_STORAGE][rcl]) !== null && _a !== void 0 ? _a : 0;
        if (maxStorage <= 0) {
            return 0;
        }
        const hasStorage = room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_STORAGE })
            .length > 0 ||
            room.find(FIND_MY_CONSTRUCTION_SITES, {
                filter: (s) => s.structureType === STRUCTURE_STORAGE
            }).length > 0;
        if (hasStorage) {
            return 0;
        }
        if (alreadyPlaced >= StructurePlanner.MAX_SITES_PER_TICK) {
            return 0;
        }
        const spot = StructurePlanner.findBuildSpot(spawn.pos, room, 2);
        if (!spot) {
            return 0;
        }
        return room.createConstructionSite(spot.x, spot.y, STRUCTURE_STORAGE) === OK ? 1 : 0;
    }
    /**
     * RCL ≥ 5 + storage/site: hub-link у storage и source-link у source.
     * Передача энергии — отдельный LinkManager (этап 4).
     */
    static planLinks(room, rcl, alreadyPlaced) {
        var _a, _b, _c;
        if (rcl < 5) {
            return 0;
        }
        const maxLinks = (_a = CONTROLLER_STRUCTURES[STRUCTURE_LINK][rcl]) !== null && _a !== void 0 ? _a : 0;
        if (maxLinks < 2) {
            return 0;
        }
        const storage = (_b = room.find(FIND_MY_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_STORAGE
        })[0]) !== null && _b !== void 0 ? _b : null;
        const storageSite = room.find(FIND_MY_CONSTRUCTION_SITES, {
            filter: (s) => s.structureType === STRUCTURE_STORAGE
        })[0];
        if (!storage && !storageSite) {
            return 0;
        }
        const hubAnchor = (_c = storage === null || storage === void 0 ? void 0 : storage.pos) !== null && _c !== void 0 ? _c : storageSite.pos;
        const existingLinks = room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_LINK }).length +
            room.find(FIND_MY_CONSTRUCTION_SITES, {
                filter: (s) => s.structureType === STRUCTURE_LINK
            }).length;
        if (existingLinks >= maxLinks) {
            return 0;
        }
        let placed = 0;
        let budget = StructurePlanner.MAX_SITES_PER_TICK - alreadyPlaced;
        if (!StructurePlanner.hasStructureOrSiteNear(hubAnchor, STRUCTURE_LINK, 1) && budget > 0) {
            const hubSpot = StructurePlanner.findBuildSpot(hubAnchor, room, 1);
            if (hubSpot && room.createConstructionSite(hubSpot.x, hubSpot.y, STRUCTURE_LINK) === OK) {
                placed++;
                budget--;
            }
        }
        const sources = room.find(FIND_SOURCES);
        for (const source of sources) {
            if (budget <= 0 || existingLinks + placed >= maxLinks) {
                break;
            }
            if (StructurePlanner.hasStructureOrSiteNear(source.pos, STRUCTURE_LINK, 1)) {
                continue;
            }
            const spot = StructurePlanner.findBuildSpot(source.pos, room, 1);
            if (!spot) {
                continue;
            }
            if (room.createConstructionSite(spot.x, spot.y, STRUCTURE_LINK) === OK) {
                placed++;
                budget--;
            }
        }
        return placed;
    }
    static hasStructureOrSiteNear(pos, structureType, range) {
        const structures = pos.findInRange(FIND_STRUCTURES, range, {
            filter: (s) => s.structureType === structureType
        });
        if (structures.length > 0) {
            return true;
        }
        const sites = pos.findInRange(FIND_CONSTRUCTION_SITES, range, {
            filter: (s) => s.structureType === structureType
        });
        return sites.length > 0;
    }
    /** Ближайшая walkable клетка в range без блокирующих структур (дорога ок). */
    static findBuildSpot(center, room, range) {
        const terrain = room.getTerrain();
        let best = null;
        let bestScore = Infinity;
        for (let dx = -range; dx <= range; dx++) {
            for (let dy = -range; dy <= range; dy++) {
                if (dx === 0 && dy === 0) {
                    continue;
                }
                const x = center.x + dx;
                const y = center.y + dy;
                if (x < 1 || x > 48 || y < 1 || y > 48) {
                    continue;
                }
                if (terrain.get(x, y) === TERRAIN_MASK_WALL) {
                    continue;
                }
                const structs = room.lookForAt(LOOK_STRUCTURES, x, y);
                const blocked = structs.some((s) => s.structureType !== STRUCTURE_ROAD && s.structureType !== STRUCTURE_RAMPART);
                if (blocked) {
                    continue;
                }
                if (room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y).length > 0) {
                    continue;
                }
                const score = Math.max(Math.abs(dx), Math.abs(dy)) * 10 +
                    (terrain.get(x, y) === TERRAIN_MASK_SWAMP ? 5 : 0);
                if (score < bestScore) {
                    bestScore = score;
                    best = new RoomPosition(x, y, room.name);
                }
            }
        }
        return best;
    }
}
StructurePlanner.MAX_SITES_PER_TICK = 3;

/** Этап 0 колонии: RCL1 bootstrap + строители при любых sites. */
function getBootstrapQuotas(room) {
    const sites = room.find(FIND_MY_CONSTRUCTION_SITES).length;
    const quotas = [
        {
            role: "bootstrap",
            maxAmount: 3,
            body: [WORK, CARRY, MOVE]
        }
    ];
    // Строители — пока есть любые construction sites (дороги, container, storage, link).
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
            const count = roomCreeps.filter((creep) => creep.memory.role === quota.role).length;
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
 * Подбор энергии с tombstone / земли после смерти крипа.
 * @see https://docs.screeps.com/api/#Creep.withdraw
 * @see https://docs.screeps.com/api/#Creep.pickup
 */
function scavengeEnergy(creep) {
    const tombstone = creep.pos.findClosestByRange(FIND_TOMBSTONES, {
        filter: (tomb) => tomb.store.getUsedCapacity(RESOURCE_ENERGY) > 0
    });
    if (tombstone) {
        if (creep.withdraw(tombstone, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(tombstone, { visualizePathStyle: { stroke: "#ffaa00" } });
        }
        creep.say("loot");
        return true;
    }
    const dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
        filter: (res) => res.resourceType === RESOURCE_ENERGY && res.amount > 0
    });
    if (dropped) {
        if (creep.pickup(dropped) === ERR_NOT_IN_RANGE) {
            creep.moveTo(dropped, { visualizePathStyle: { stroke: "#ffaa00" } });
        }
        creep.say("pickup");
        return true;
    }
    return false;
}

/**
 * Универсальный рабочий RCL1:
 * loot/pickup → source → spawn/extensions → controller (если склад заполнен).
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
        if (scavengeEnergy(creep)) {
            return;
        }
        // Range, не Path: findClosestByPath дает null, если путь временно забит другими крипами.
        const source = (_a = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE)) !== null && _a !== void 0 ? _a : creep.pos.findClosestByRange(FIND_SOURCES);
        if (!source) {
            creep.say("no src");
            return;
        }
        const result = creep.harvest(source);
        if (result === ERR_NOT_IN_RANGE) {
            creep.moveTo(source, {
                reusePath: 10,
                ignoreCreeps: false,
                visualizePathStyle: { stroke: "#ffaa00" }
            });
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
        if (!(controller === null || controller === void 0 ? void 0 : controller.my)) {
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

/** Строит construction sites: economy-структуры приоритетнее дорог. */
class YoungBuilderRole {
    run(creep) {
        var _a, _b, _c;
        if (creep.memory.building && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.building = false;
            creep.say("harvest");
        }
        if (!creep.memory.building && creep.store.getFreeCapacity() === 0) {
            creep.memory.building = true;
            creep.say("build");
        }
        if (creep.memory.building) {
            const site = (_b = (_a = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {
                filter: (s) => s.structureType === STRUCTURE_STORAGE ||
                    s.structureType === STRUCTURE_CONTAINER ||
                    s.structureType === STRUCTURE_LINK ||
                    s.structureType === STRUCTURE_EXTENSION ||
                    s.structureType === STRUCTURE_TOWER
            })) !== null && _a !== void 0 ? _a : creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {
                filter: (s) => s.structureType === STRUCTURE_ROAD
            })) !== null && _b !== void 0 ? _b : creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
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
        const source = (_c = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE)) !== null && _c !== void 0 ? _c : creep.pos.findClosestByRange(FIND_SOURCES);
        if (!source) {
            creep.say("no src");
            return;
        }
        if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
            creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
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
    RoadPlanner.run();
    StructurePlanner.run();
    ColonySpawn.run();
    CreepManager.run();
}

exports.loop = loop;
