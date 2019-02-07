var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');
var spawningPool = require('spawning');
var sporeCrawlerTower = require('towers');

module.exports.loop = function () { 

sporeCrawlerTower('5c55df5e6f956a230b9ebfe8');
sporeCrawlerTower('5c57064bb9349812e0eca6d0');

spawningPool('Hatchery', 'droneUpgrader', 'upgrader', 1, [WORK,CARRY,MOVE]);
spawningPool('Hatchery', 'droneHarvester', 'harvester', 8, [MOVE,WORK,CARRY,MOVE]);
spawningPool('Hatchery', 'droneBuilder', 'builder', 3, [WORK,CARRY,CARRY,CARRY,MOVE]);

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