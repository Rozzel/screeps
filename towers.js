var sporeCrawlerTower = function () {
    var tower_1 = Game.getObjectById('5c55df5e6f956a230b9ebfe8');
    var tower_2 = Game.getObjectById('5c57064bb9349812e0eca6d0');
    
    var towerFind = function (tower) {
        let closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax});
        let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    
        if (closestHostile) {
            tower.attack(closestHostile);
        } else {
            tower.repair(closestDamagedStructure);
        }
    }

    towerFind(tower_1);
    towerFind(tower_2);
};

module.exports = sporeCrawlerTower;