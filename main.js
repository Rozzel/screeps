var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');
var spawningPool = require('spawning');
var sporeCrawlerTower = require('towers');

module.exports.loop = function () { 

sporeCrawlerTower();

spawningPool('droneUpgraderBig', 'upgrader', 0, [WORK,WORK,CARRY,MOVE,MOVE,MOVE]);
spawningPool('droneBuilderBig', 'builder', 0, [WORK,WORK,CARRY,MOVE]);
spawningPool('droneUpgrader', 'upgrader', 1, [WORK,WORK,CARRY,MOVE]);
spawningPool('droneHarvester', 'harvester', 8, [WORK,CARRY,MOVE]);
spawningPool('droneHarvesterBig', 'harvester', 1, [WORK,MOVE,CARRY,CARRY]);
spawningPool('droneBuilder', 'builder', 4, [WORK,CARRY,MOVE]);

unitsRole();


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

