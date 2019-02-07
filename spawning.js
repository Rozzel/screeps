let spawningPool = function (spawnName, droneName, droneRole, maxAmount, droneBody) {
    let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == droneRole);

    if (harvesters.length < maxAmount) {
        let newName = droneName + '-' + Game.time;
        Game.spawns[spawnName].spawnCreep(droneBody, newName, {
            memory: {
                role: droneRole
            }
        });
    }

    if (Game.spawns[spawnName].spawning) {
        let spawningCreep = Game.creeps[Game.spawns[spawnName].spawning.name];
        Game.spawns[spawnName].room.visual.text(
            spawningCreep.memory.role,
            Game.spawns[spawnName].pos.x + 1,
            Game.spawns[spawnName].pos.y, {
                align: 'left',
                opacity: 0.8
            });
    }

    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    };

};

module.exports = spawningPool;