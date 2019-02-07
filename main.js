let roleHarvester = require('role.harvester');
let roleBuilder = require('role.builder');
let roleUpgrader = require('role.upgrader');
let spawningPool = require('spawning');
let sporeCrawlerTower = require('towers');

module.exports.loop = function () { 

sporeCrawlerTower('5c55df5e6f956a230b9ebfe8');
sporeCrawlerTower('5c57064bb9349812e0eca6d0');

spawningPool('Hatchery', 'droneUpgrader', 'upgrader', 1, [WORK,CARRY,MOVE]);
spawningPool('Hatchery', 'droneHarvester', 'harvester', 8, [MOVE,WORK,CARRY,MOVE]);
spawningPool('Hatchery', 'droneBuilder', 'builder', 3, [WORK,CARRY,CARRY,CARRY,MOVE]);

unitsRole();


}

let unitsRole = function () {
    for(let name in Game.creeps) {
        let creep = Game.creeps[name];
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