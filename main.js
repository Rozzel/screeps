const   tower = require('_towers'),
        units = require('_units');

module.exports.loop = () => {
   
    //tower('5c57064bb9349812e0eca6d0');
    //tower('5c55df5e6f956a230b9ebfe8');



    // units.spawning('Hatchery', 'droneUpgrader', 'upgrader', 7, [WORK, CARRY, CARRY, MOVE, MOVE, MOVE]);
    // units.spawning('Hatchery', 'droneCarrier', 'carrier', 9, [MOVE, CARRY, MOVE, MOVE, MOVE]);
    // units.spawning('Hatchery', 'droneHarvester', 'harvester', 3, [WORK, WORK, WORK, CARRY, CARRY, MOVE]);
    units.spawning('Hatchery', 'droneYoungHarvester', 'youngHarvester', 2, [WORK, CARRY, CARRY, MOVE]);
    units.spawning('Hatchery', 'droneBuilder', 'builder', 1, [WORK, WORK, CARRY, MOVE]);
    units.spawning('Hatchery', 'droneUpgrader', 'upgrader', 1, [WORK, CARRY, MOVE]);

    


    for (let name in Game.creeps) {
        let creep = Game.creeps[name];
        if (creep.memory.role == 'carrier') {
            units.roleCarrier(creep);
        }
        if(creep.memory.role == 'harvester') {
            units.roleHarvester(creep);
        }
        if (creep.memory.role == 'builder') {
            units.roleBuilder(creep);
        }
        if (creep.memory.role == 'upgrader') {
            units.roleUpgrader(creep);
        }
        if (creep.memory.role == 'youngHarvester') {
            units.roleYoungHarvester(creep);
        }
    }


};