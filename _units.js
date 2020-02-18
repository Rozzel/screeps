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
		}

	},

	roleCarrier(creep) {

		if (creep.carry.energy !== creep.carryCapacity) {

			let target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
			if (target) {
				if (creep.pickup(target) == ERR_NOT_IN_RANGE) {
					creep.moveTo(target, {
						visualizePathStyle: {
							stroke: '#ffaa00'
						}
					});
				}
				creep.say('drop');
			} else {
				let target = creep.room.find(FIND_STRUCTURES, {
					filter: (i) => i.structureType == STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > 0 ||
								   i.structureType == STRUCTURE_STORAGE && i.store[RESOURCE_ENERGY] > 0
				});

				if (creep.withdraw(target[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.moveTo(target[0], {
						visualizePathStyle: {
							stroke: '#ffaa00'
						}
					});
				}
			}
		} else {
			let targets = creep.room.find(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType == STRUCTURE_EXTENSION ||
							structure.structureType == STRUCTURE_SPAWN ||
							structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity ||
							structure.structureType == STRUCTURE_STORAGE;
				}
			});
			if (targets.length > 0) {
				if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {

					for (let resourceType in creep.carry) {
						creep.transfer(targets[0], resourceType);
					}
					creep.moveTo(targets[0], {
						visualizePathStyle: {
							stroke: '#ffffff'
						}
					});
				}
			}
		}
	},

	roleHarvester(creep) {

		if (creep.carry.energy === creep.carryCapacity) {
			let target = creep.room.find(FIND_STRUCTURES, {
				filter: {
					structureType: STRUCTURE_CONTAINER
				}
			});
			if (creep.transfer(target[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				creep.moveTo(target[0], {
					visualizePathStyle: {
						stroke: '#ffaa00'
					}
				});
			} else {

				for (let resourceType in creep.carry) {
					creep.transfer(target[0], resourceType);
				}
			}
		} else {
			let target = creep.room.find(FIND_SOURCES);
			if (creep.harvest(target[0]) == ERR_NOT_IN_RANGE) {
				creep.moveTo(target[0], {
					visualizePathStyle: {
						stroke: '#ffaa00'
					}
				});
			}
		}
	},

	roleYoungHarvester(creep) {

		if(creep.store.getFreeCapacity() > 0) {
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
			}
			creep.say('harvest');
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }

	},

	roleBuilder(creep) {

		if (creep.memory.building && creep.carry.energy == 0) {
			creep.memory.building = false;
			creep.say('energy');
		}
		if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
			creep.memory.building = true;
			creep.say('build');
		}

		if (creep.memory.building) {
			let targets = creep.room.find(FIND_CONSTRUCTION_SITES);
			if (targets.length) {
				if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
					creep.moveTo(targets[0], {
						visualizePathStyle: {
							stroke: '#ffffff'
						}
					});
				}
			}
		} else {
			let target = creep.room.find(FIND_STRUCTURES, {
				filter: (i) => i.structureType == STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > 0 ||
							   i.structureType == STRUCTURE_STORAGE && i.store[RESOURCE_ENERGY] > 0
			});
			if (creep.withdraw(target[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				creep.moveTo(target[0], {
					visualizePathStyle: {
						stroke: '#ffaa00'
					}
				});
			}
		}
	},

	roleYoungBuilder(creep) {

		if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('harvest');
	    }
	    if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
	        creep.memory.building = true;
	        creep.say('build');
	    }

	    if(creep.memory.building) {
	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
	    }
	    else {
	        var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
	    }
	},


	roleUpgrader(creep) {

		if (creep.memory.upgrading && creep.carry.energy == 0) {
			creep.memory.upgrading = false;
			creep.say('energy');
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

			let target = creep.room.find(FIND_STRUCTURES, {
				filter: (i) => 	i.structureType == STRUCTURE_STORAGE && i.store[RESOURCE_ENERGY] > 0 ||
								i.structureType == STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > 0 
			});
			if (creep.withdraw(target[1], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				creep.moveTo(target[1], {
					visualizePathStyle: {
						stroke: '#ffaa00'
					}
				});
			}

		}
	},

	roleYoungUpgrader(creep) {

		if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('harvest');
	    }
	    if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
	        creep.memory.upgrading = true;
	        creep.say('upgrade');
	    }

	    if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
	},


};

module.exports = units;