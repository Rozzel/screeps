var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');

module.exports.loop = function () {

    deleteCreepsMemory();

    sporeCrawler();

/*
    Body part       Build cost
    MOVE	        50
    WORK	        100	
    CARRY	        50
    ATTACK	        80
    RANGED_ATTACK	150	
    HEAL            250	
    CLAIM	        600	
    TOUGH	        10
*/

    var controllerLevel = Game.rooms.sim.controller.level;

    if (controllerLevel == 2) {
        spawningPool('droneHarvesterBig', 'harvester', 1, [WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE]);
        spawningPool('droneBuilder', 'builder', 1, [WORK,WORK,CARRY,MOVE]);
        

        
        createExtension();
        var createExtension = function () {
            var HatcheryPosX = Game.spawns['Hatchery'].pos.x;
            var HatcheryPosY = Game.spawns['Hatchery'].pos.y;

            Game.spawns['Hatchery'].room.createConstructionSite( HatcheryPosX - 2, HatcheryPosY, STRUCTURE_EXTENSION );
            Game.spawns['Hatchery'].room.createConstructionSite( HatcheryPosX + 2, HatcheryPosY, STRUCTURE_EXTENSION );
            Game.spawns['Hatchery'].room.createConstructionSite( HatcheryPosX, HatcheryPosY - 2, STRUCTURE_EXTENSION );
            Game.spawns['Hatchery'].room.createConstructionSite( HatcheryPosX - 1, HatcheryPosY + 2, STRUCTURE_EXTENSION );
            Game.spawns['Hatchery'].room.createConstructionSite( HatcheryPosX + 1, HatcheryPosY + 2, STRUCTURE_EXTENSION );
        }
        
    }
    spawningPool('droneUpgrader', 'upgrader', 1, [WORK,WORK,CARRY,MOVE]);
    spawningPool('droneHarvester', 'harvester', 2, [WORK,CARRY,MOVE]);

    unitsRole();


}

var sporeCrawler = function () {
    var tower = Game.getObjectById('d8a55e4264e6dd1431a5dac9');
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
            console.log('Clearing non-existing creep memory:', name);
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

var spawningPool = function (droneName, droneRole, maxAmount, droneBody) {
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == droneRole);

    if(harvesters.length < maxAmount) {
        var newName = droneName + '-' + Game.time;
        Game.spawns['Hatchery'].spawnCreep(droneBody, newName, 
            {memory: {role: droneRole}});        
    }
    
    if(Game.spawns['Hatchery'].spawning) { 
        var spawningCreep = Game.creeps[Game.spawns['Hatchery'].spawning.name];
        Game.spawns['Hatchery'].room.visual.text(
            '🛠 ' + spawningCreep.memory.role,
            Game.spawns['Hatchery'].pos.x + 1, 
            Game.spawns['Hatchery'].pos.y, 
            {align: 'left', opacity: 0.8});
    }

}



/*

console.log(Game.getObjectById('3c7c82645895864c16368215').level
console.log(Game.rooms['sim'].controller.level); 

Game.spawns['Hatchery'].room.createConstructionSite( 20, 22, STRUCTURE_EXTENSION );

Game.spawns['Hatchery'].room.controller.activateSafeMode();

console.log(Game.getObjectById('aa8dcf0f30fd7dbbd40c9799').pos.x);

*/