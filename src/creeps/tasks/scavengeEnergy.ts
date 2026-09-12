/**
 * Подбор энергии с tombstone / земли после смерти крипа.
 * @see https://docs.screeps.com/api/#Creep.withdraw
 * @see https://docs.screeps.com/api/#Creep.pickup
 */
export function scavengeEnergy(creep: Creep): boolean {
  const tombstone = creep.pos.findClosestByRange(FIND_TOMBSTONES, {
    filter: (tomb) => tomb.store.getUsedCapacity(RESOURCE_ENERGY) > 0
  });

  if (tombstone) {
    if (creep.withdraw(tombstone, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(tombstone, { visualizePathStyle: { stroke: "#ffaa00" } });
    }
    creep.say("loot");
    return true;
  }

  const dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
    filter: (res) => res.resourceType === RESOURCE_ENERGY && res.amount > 0
  });

  if (dropped) {
    if (creep.pickup(dropped) === ERR_NOT_IN_RANGE) {
      creep.moveTo(dropped, { visualizePathStyle: { stroke: "#ffaa00" } });
    }
    creep.say("pickup");
    return true;
  }

  return false;
}
