let roleHarvester = require('_role.harvester');
let roleBuilder = require('_role.builder');
let roleUpgrader = require('_role.upgrader');
let spawningPool = require('_spawning');
let sporeCrawlerTower = require('_towers');

module.exports.loop = function () { 

sporeCrawlerTower('5c55df5e6f956a230b9ebfe8');
sporeCrawlerTower('5c57064bb9349812e0eca6d0');

spawningPool('Hatchery', 'droneUpgrader', 'upgrader', 3, [WORK,CARRY,CARRY,MOVE,MOVE,MOVE]);
spawningPool('Hatchery', 'droneHarvester', 'harvester', 14, [MOVE,WORK,CARRY,MOVE]);
spawningPool('Hatchery', 'droneBuilder', 'builder', 2, [WORK,CARRY,CARRY,MOVE]);

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