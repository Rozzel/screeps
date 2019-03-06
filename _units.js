let units = {

	spawning(spawnName, droneName, droneRole, maxAmount, droneBody) {
		let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == droneRole);

		if (harvesters.length < maxAmount) {
			let newName = `${droneName}-${Game.time}`;
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

	},

	roleСarrier(creep) {

		if (creep.carry.energy < creep.carryCapacity) {
			let target = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY);
			if (target) {
				if (creep.pickup(target) == ERR_NOT_IN_RANGE) {
					creep.moveTo(target);
				}
			}
		} else {
			let targets = creep.room.find(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType == STRUCTURE_EXTENSION ||
						structure.structureType == STRUCTURE_SPAWN ||
						structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
				}
			});
			if (targets.length > 0) {
				if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.moveTo(targets[0], {
						visualizePathStyle: {
							stroke: '#ffffff'
						}
					});
				}
			}
		}
	},



	roleBuilder(creep) {

		if (creep.memory.building && creep.carry.energy == 0) {
			creep.memory.building = false;
			creep.say('harvest');
		}
		if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
			creep.memory.building = true;
			creep.say('build');
		}

		if (creep.memory.building) {
			for (let resourceType in creep.carry) {
				creep.drop(resourceType);
			}
		} else {
			let sources = creep.room.find(FIND_SOURCES);
			if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
				creep.moveTo(sources[0], {
					visualizePathStyle: {
						stroke: '#ffaa00'
					}
				});
			}
		}
	},


	roleUpgrader(creep) {

		if (creep.memory.upgrading && creep.carry.energy == 0) {
			creep.memory.upgrading = false;
			creep.say('harvest');
		}
		if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
			creep.memory.upgrading = true;
			creep.say('upgrade');
		}

		if (creep.memory.upgrading) {
			if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
				creep.moveTo(creep.room.controller, {
					visualizePathStyle: {
						stroke: '#ffffff'
					}
				});
			}
		} else {
			let sources = creep.room.find(FIND_SOURCES);
			if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
				creep.moveTo(sources[0], {
					visualizePathStyle: {
						stroke: '#ffaa00'
					}
				});
			}
		}
	},




};


module.exports = units;