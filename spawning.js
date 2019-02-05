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

    var deleteCreepsMemory = function () {
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
    }
    deleteCreepsMemory();

    

};

module.exports = spawningPool;