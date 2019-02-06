var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');
var spawningPool = require('spawning');
var sporeCrawlerTower = require('towers');

module.exports.loop = function () { 

sporeCrawlerTower();

spawningPool('droneUpgrader', 'upgrader', 1, [WORK,WORK,CARRY,CARRY,MOVE]); // 100+100+50+50+50=350
spawningPool('droneHarvester', 'harvester', 8, [MOVE,WORK,CARRY,MOVE]); // 50+100+50+50=200
spawningPool('droneBuilder', 'builder', 4, [WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE]); // 100+50+50+50+50+50+50=400

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