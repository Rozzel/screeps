var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');

module.exports.loop = function () { 

    deleteCreepsMemory();

    sporeCrawler();

var controllerLevel = Game.rooms['W36N43'].controller.level;

if (controllerLevel > 1) {
    spawningPool('droneHarvesterBig', 'harvester', 6, [WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE]);
    spawningPool('droneUpgraderBig', 'upgrader', 6, [WORK,WORK,CARRY,MOVE,MOVE,MOVE]);
    spawningPool('droneBuilder', 'builder', 0, [WORK,WORK,CARRY,MOVE]);

    var HatcheryPosX = Game.spawns['Hatchery'].pos.x;
    var HatcheryPosY = Game.spawns['Hatchery'].pos.y;
    createExtension(HatcheryPosX, HatcheryPosY);
}
spawningPool('droneUpgrader', 'upgrader', 4, [WORK,WORK,CARRY,MOVE]);
spawningPool('droneHarvester', 'harvester', 3, [WORK,CARRY,MOVE]);

unitsRole();


}

var createExtension = function (x, y) {
    Game.spawns['Hatchery'].room.createConstructionSite( x - 2, y,      STRUCTURE_EXTENSION );
    Game.spawns['Hatchery'].room.createConstructionSite( x + 2, y,      STRUCTURE_EXTENSION );
    Game.spawns['Hatchery'].room.createConstructionSite( x    , y - 2,  STRUCTURE_EXTENSION );
    Game.spawns['Hatchery'].room.createConstructionSite( x - 1, y + 2,  STRUCTURE_EXTENSION );
    Game.spawns['Hatchery'].room.createConstructionSite( x + 1, y + 2,  STRUCTURE_EXTENSION );
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
            spawningCreep.memory.role,
            Game.spawns['Hatchery'].pos.x + 1, 
            Game.spawns['Hatchery'].pos.y, 
            {align: 'left', opacity: 0.8});
    }

}



/*

console.log(Game.getObjectById('3c7c82645895864c16368215').level
console.log(Game.rooms['sim'].controller.level); 

Game.spawns['Hatchery'].room.createConstructionSite( 20, 22, STRUCTURE_EXTENSION );

/*
console.log(Game.getObjectById('3c7c82645895864c16368215').level
console.log(Game.rooms['sim'].controller.level); 
Game.spawns['Hatchery'].room.createConstructionSite( 20, 22, STRUCTURE_EXTENSION );
Game.spawns['Hatchery'].room.controller.activateSafeMode();
console.log(Game.getObjectById('aa8dcf0f30fd7dbbd40c9799').pos.x);
Game.map.isRoomAvailable(room.name)
console.log(Game.map.Memory.rooms[room.name]);
*/