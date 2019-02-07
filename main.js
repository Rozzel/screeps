var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');
var spawningPool = require('spawning');
var sporeCrawlerTower = require('towers');

module.exports.loop = function () { 

sporeCrawlerTower();

spawningPool('Hatchery', 'droneUpgrader', 'upgrader', 1, [WORK,CARRY,MOVE]);
spawningPool('Hatchery', 'droneHarvester', 'harvester', 8, [MOVE,WORK,CARRY,MOVE]);
spawningPool('Hatchery', 'droneBuilder', 'builder', 3, [WORK,CARRY,CARRY,CARRY,MOVE]);


}