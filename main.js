import { run } from 'role.harvester';
import { run as _run } from 'role.builder';
import { run as __run } from 'role.upgrader';
import spawningPool from 'spawning';
import sporeCrawlerTower from 'towers';

export function loop () { 



sporeCrawlerTower();

spawningPool('droneUpgraderBig', 'upgrader', 0, [WORK,WORK,CARRY,MOVE,MOVE,MOVE]);
spawningPool('droneBuilderBig', 'builder', 1, [WORK,WORK,CARRY,MOVE]);
spawningPool('droneUpgrader', 'upgrader', 1, [WORK,WORK,CARRY,MOVE]);
spawningPool('droneHarvester', 'harvester', 12, [WORK,CARRY,MOVE]);
spawningPool('droneHarvesterBig', 'harvester', 0, [WORK,MOVE,CARRY,CARRY]);
spawningPool('droneBuilder', 'builder', 4, [WORK,CARRY,MOVE]);

unitsRole();


}






var unitsRole = function () {
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            run(creep);
        }
        if(creep.memory.role == 'builder') {
            _run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            __run(creep);
        }
    }
}

