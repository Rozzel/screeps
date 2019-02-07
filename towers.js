let sporeCrawlerTower = function (idTower) {
    let tower = Game.getObjectById(idTower);

    let closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => structure.hits < structure.hitsMax
    });
    let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

    if (closestHostile) {
        tower.attack(closestHostile);
    } else {
        tower.repair(closestDamagedStructure);
    }

};

module.exports = sporeCrawlerTower;