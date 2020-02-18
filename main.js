const   tower = require('_towers'),
        units = require('_units');

module.exports.loop = () => {
   
    tower('5e46a4e3513adee6a864e520');



    //units.spawning

    // units.spawning('Hatchery', 'droneUpgrader', 'upgrader', 7, [WORK, CARRY, CARRY, MOVE, MOVE, MOVE]);
    // units.spawning('Hatchery', 'droneCarrier', 'carrier', 9, [MOVE, CARRY, MOVE, MOVE, MOVE]);
    // units.spawning('Hatchery', 'droneHarvester', 'harvester', 3, [WORK, WORK, WORK, CARRY, CARRY, MOVE]);
    // units.spawning('Hatchery', 'droneHarvester', 'harvester', 3, [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE]);
    
    units.spawning('Hatchery', 'droneYoungBuilder', 'youngBuilder', 0, [WORK, WORK, CARRY, MOVE]);
    units.spawning('Hatchery', 'droneYoungUpgrader', 'youngUpgrader', 0, [WORK, CARRY, MOVE]);
    units.spawning('Hatchery', 'droneYoungHarvester', 'youngHarvester', 0, [WORK, CARRY, CARRY, MOVE]);

    units.spawning('Hatchery', 'droneBuilder', 'builder', 0, [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE]);
    units.spawning('Hatchery', 'droneUpgrader', 'upgrader', 5, [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE]);
    units.spawning('Hatchery', 'droneCarrier', 'carrier', 3, [MOVE, CARRY, MOVE]);
    units.spawning('Hatchery', 'droneHarvester', 'harvester', 2, [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE]);

    // units.spawning  end


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
        if (creep.memory.role == 'youngUpgrader') {
            units.roleYoungUpgrader(creep);
        }
        if (creep.memory.role == 'youngBuilder') {
            units.roleYoungBuilder(creep);
        }
    }


};