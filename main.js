var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');
var spawningPool = require('spawning');

module.exports.loop = function () { 

    deleteCreepsMemory();

    sporeCrawler();

spawningPool('droneUpgraderBig', 'upgrader', 0, [WORK,WORK,CARRY,MOVE,MOVE,MOVE]);
spawningPool('droneBuilderBig', 'builder', 1, [WORK,WORK,CARRY,MOVE]);
spawningPool('droneUpgrader', 'upgrader', 1, [WORK,WORK,CARRY,MOVE]);
spawningPool('droneHarvester', 'harvester', 12, [WORK,CARRY,MOVE]);
spawningPool('droneHarvesterBig', 'harvester', 0, [WORK,MOVE,CARRY,CARRY]);
spawningPool('droneBuilder', 'builder', 4, [WORK,CARRY,MOVE]);

unitsRole();


}

var sporeCrawler = function () {
    var tower = Game.getObjectById('5c264590bffc212cf45a352a');
    if(tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }

        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }
}


var deleteCreepsMemory = function () {
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }
}


var unitsRole = function () {
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
    }
}

