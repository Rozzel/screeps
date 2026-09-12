import { getBootstrapQuotas } from "config/rclPolicy";
import { RoleName } from "types/roles";

export class ColonySpawn {
  static run(): void {
    for (const spawnName in Game.spawns) {
      const spawn = Game.spawns[spawnName];
      if (!spawn.my) {
        continue;
      }
      ColonySpawn.runSpawn(spawn);
    }
  }

  private static runSpawn(spawn: StructureSpawn): void {
    if (spawn.spawning) {
      const spawningCreep = Game.creeps[spawn.spawning.name];
      if (spawningCreep) {
        spawn.room.visual.text(spawningCreep.memory.role, spawn.pos.x + 1, spawn.pos.y, {
          align: "left",
          opacity: 0.8
        });
      }
      return;
    }

    const roomCreeps = spawn.room.find(FIND_MY_CREEPS);
    const quotas = getBootstrapQuotas(spawn.room);

    // Аварийный bootstrap: нет крипов — спавним первого любой ценой по энергии.
    if (roomCreeps.length === 0) {
      ColonySpawn.trySpawn(spawn, "bootstrap", "boot", [WORK, CARRY, MOVE]);
      return;
    }

    for (const quota of quotas) {
      const count = _.filter(roomCreeps, (creep: Creep) => creep.memory.role === quota.role).length;
      if (count < quota.maxAmount) {
        ColonySpawn.trySpawn(spawn, quota.role, quota.role, quota.body);
        return;
      }
    }
  }

  private static trySpawn(
    spawn: StructureSpawn,
    role: RoleName,
    prefix: string,
    body: BodyPartConstant[]
  ): void {
    const name = `${prefix}-${Game.time}`;
    const result = spawn.spawnCreep(body, name, {
      memory: {
        role
      }
    });

    if (result === OK) {
      console.log(`Spawn ${spawn.name}: ${role} (${name})`);
    } else if (result !== ERR_NOT_ENOUGH_ENERGY && result !== ERR_BUSY) {
      console.log(`Spawn ${spawn.name} failed ${role}: ${result}`);
    }
  }
}
