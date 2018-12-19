var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');

module.exports.loop = function () {

    deleteCreepsMemory();

    sporeCrawler();

    spawningPool('droneHarvesterBig', 'harvester', 1, [WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE]);
    spawningPool('droneBuilder', 'builder', 1, [WORK,CARRY,MOVE]);
    spawningPool('droneUpgrader', 'upgrader', 1, [WORK,CARRY,MOVE]);
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
    console.log(droneName + 's: ' + harvesters.length);

    if(harvesters.length < maxAmount) {
        var newName = droneName + '-' + Game.time;
        console.log('Spawning new' + droneName + ': ' + newName);
        Game.spawns['Hatchery-1'].spawnCreep(droneBody, newName, 
            {memory: {role: droneRole}});        
    }
    
    if(Game.spawns['Hatchery-1'].spawning) { 
        var spawningCreep = Game.creeps[Game.spawns['Hatchery-1'].spawning.name];
        Game.spawns['Hatchery-1'].room.visual.text(
            '🛠' + spawningCreep.memory.role,
            Game.spawns['Hatchery-1'].pos.x + 1, 
            Game.spawns['Hatchery-1'].pos.y, 
            {align: 'left', opacity: 0.8});
    }

}

/*

var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

module.exports.loop = function () {

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

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }
}


var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

module.exports.loop = function () {

    var tower = Game.getObjectById('d8a55e4264e6dd1431a5dac9');
    if(tower) {
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }
}


Game.spawns['Hatchery-1'].room.createConstructionSite( 23, 22, STRUCTURE_TOWER );
Game.spawns['Hatchery-1'].room.controller.activateSafeMode();



    //energyAvailable
    for(var name in Game.rooms) {
        console.log('Room "'+name+'" has '+Game.rooms[name].energyAvailable+' energy');
    }




    Game.spawns['Hatchery-1'].spawnCreep( [WORK, CARRY, MOVE], 'Harvester1', { memory: { role: 'harvester' } } );
    Game.spawns['Hatchery-1'].spawnCreep( [WORK, CARRY, MOVE], 'Builder1', { memory: { role: 'builder' } } );
    Game.spawns['Hatchery-1'].spawnCreep( [WORK, CARRY, MOVE], 'Harvester2', { memory: { role: 'harvester' } } );
    Game.spawns['Hatchery-1'].spawnCreep( [WORK, WORK, CARRY, MOVE, CARRY, CARRY], 'Upgrader1', { memory: { role: 'upgrader' } } );

    Game.spawns['Hatchery-1'].spawnCreep( [WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE],
        'HarvesterBig',
        { memory: { role: 'harvester' } } );




var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');

module.exports.loop = function () {

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    console.log('Harvesters: ' + harvesters.length);

    if(harvesters.length < 2) {
        var newName = 'Harvester' + Game.time;
        console.log('Spawning new harvester: ' + newName);
        Game.spawns['Hatchery-1'].spawnCreep([WORK,CARRY,MOVE], newName, 
            {memory: {role: 'harvester'}});        
    }
    
    if(Game.spawns['Hatchery-1'].spawning) { 
        var spawningCreep = Game.creeps[Game.spawns['Hatchery-1'].spawning.name];
        Game.spawns['Hatchery-1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Hatchery-1'].pos.x + 1, 
            Game.spawns['Hatchery-1'].pos.y, 
            {align: 'left', opacity: 0.8});
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
    }
}



var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');

module.exports.loop = function () {

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    console.log('Harvesters: ' + harvesters.length);

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
    }
}




var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

module.exports.loop = function () {

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }

    Game.spawns['Hatchery-1'].spawnCreep( [WORK, CARRY, MOVE], 'Builder1', { memory: { role: 'builder' } } );
    Game.spawns['Hatchery-1'].spawnCreep( [WORK, CARRY, MOVE], 'Harvester1', { memory: { role: 'harvester' } } );
}








var roleHarvester = require('role.harvester');

module.exports.loop = function () {

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        roleHarvester.run(creep);
    }
}




Game.creeps['Harvester1'].memory.role = 'harvester';
Game.creeps['Upgrader1'].memory.role = 'upgrader';



//Game.spawns['Hatchery-1'].spawnCreep( [WORK, CARRY, MOVE], 'Upgrader1' );


module.exports.loop = function () {
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];

        if(creep.carry.energy < creep.carryCapacity) {
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }
        }
        else {
            if(creep.transfer(Game.spawns['Hatchery-1'], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.spawns['Hatchery-1']);
            }
        }
    }
}



module.exports.loop = function () {
    var creep = Game.creeps['Harvester1'];

    if(creep.carry.energy < creep.carryCapacity) {
        var sources = creep.room.find(FIND_SOURCES);
        if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[0]);
        }
    }
    else {
        if( creep.transfer(Game.spawns['Hatchery-1'], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE ) {
            creep.moveTo(Game.spawns['Hatchery-1']);
        }
    }
}



Game.spawns['Hatchery-1'].spawnCreep( [WORK, CARRY, MOVE], 'Harvester1' );
Game.spawns['Hatchery-1'].spawnCreep( [WORK, CARRY, MOVE], 'Harvester2' );

*/