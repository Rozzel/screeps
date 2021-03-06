const   tower = require('_towers'),
        units = require('_units');

module.exports.loop = () => {
   

    tower('5e46a4e3513adee6a864e520');
    tower('5e4e7dba388a320a21a1a858');
    tower('5e7469bca025226544130738');
    tower('5ecfea534d65c12f8b59a41d');
    tower('5ed0386aca6b5f249c583a38');
    tower('5ecffaadeba463a030b8eeb2');
    

    //units.spawning

    // units.spawning('Hatchery', 'droneUpgrader', 'upgrader', 7, [WORK, CARRY, CARRY, MOVE, MOVE, MOVE]);
    // units.spawning('Hatchery', 'droneCarrier', 'carrier', 9, [MOVE, CARRY, MOVE, MOVE, MOVE]);
    // units.spawning('Hatchery', 'droneHarvester', 'harvester', 3, [WORK, WORK, WORK, CARRY, CARRY, MOVE]);
    // units.spawning('Hatchery', 'droneHarvester', 'harvester', 3, [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE]);
    
    // units.spawning('Hatchery', 'droneYoungBuilder', 'youngBuilder', 0, [WORK, WORK, CARRY, MOVE]);
    // units.spawning('Hatchery', 'droneYoungUpgrader', 'youngUpgrader', 0, [WORK, CARRY, MOVE]);
    // units.spawning('Hatchery', 'droneYoungHarvester', 'youngHarvester', 0, [WORK, CARRY, CARRY, MOVE]);
    // units.spawning('Spawn', 'droneUpgrader', 'upgrader', 1, [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE]);

    units.spawning('Spawn', 'droneBuilder', 'builder', 0, [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE]);
    units.spawning('Spawn', 'droneUpgrader', 'upgrader', 1, [WORK, CARRY, MOVE]);
    units.spawning('Lair', 'droneCarrier', 'carrier', 2, [MOVE, CARRY, MOVE]);
    units.spawning('Hatchery', 'droneHarvester', 'harvester', 1, [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE]);
     

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