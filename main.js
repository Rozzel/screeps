const   tower = require('_towers'),
        units = require('_units');

module.exports.loop = () => {

    tower('5c55df5e6f956a230b9ebfe8');
    tower('5c57064bb9349812e0eca6d0');


    units.spawning('Hatchery', 'droneUpgrader', 'upgrader', 5, [WORK, CARRY, CARRY, MOVE, MOVE, MOVE]);
    units.spawning('Hatchery', 'droneCarrier', 'carrier', 8, [MOVE, CARRY, MOVE, MOVE, MOVE]);
    units.spawning('Hatchery', 'droneHarvester', 'harvester', 3, [WORK,WORK,CARRY,CARRY,MOVE]);
    units.spawning('Hatchery', 'droneBuilder', 'builder', 0, [WORK,WORK,CARRY,CARRY,MOVE]);




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
    }


}