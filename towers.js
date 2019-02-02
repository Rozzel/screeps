var sporeCrawlerTower = function () {
    var tower = Game.getObjectById('5c55df5e6f956a230b9ebfe8');

    var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => structure.hits < structure.hitsMax
    });
    var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

    if (closestHostile) {
        tower.attack(closestHostile);
    } else {
        tower.repair(closestDamagedStructure);
    }

};

module.exports = sporeCrawlerTower;