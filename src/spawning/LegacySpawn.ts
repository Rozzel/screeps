import { RoleName } from "types/roles";

interface SpawnSpec {
  spawnName: string;
  droneName: string;
  droneRole: RoleName;
  maxAmount: number;
  droneBody: BodyPartConstant[];
}

/** Новая колония: один Spawn1, тела под RCL1 (300 energy). */
const SPAWN_SPECS: SpawnSpec[] = [
  {
    spawnName: "Spawn1",
    droneName: "droneHarvester",
    droneRole: "youngHarvester",
    maxAmount: 2,
    droneBody: [WORK, CARRY, MOVE]
  },
  {
    spawnName: "Spawn1",
    droneName: "droneUpgrader",
    droneRole: "youngUpgrader",
    maxAmount: 1,
    droneBody: [WORK, CARRY, MOVE]
  },
  {
    spawnName: "Spawn1",
    droneName: "droneBuilder",
    droneRole: "youngBuilder",
    maxAmount: 1,
    droneBody: [WORK, CARRY, MOVE]
  }
];

export class LegacySpawn {
  static run(): void {
    for (const spec of SPAWN_SPECS) {
      LegacySpawn.spawning(
        spec.spawnName,
        spec.droneName,
        spec.droneRole,
        spec.maxAmount,
        spec.droneBody
      );
    }
  }

  private static spawning(
    spawnName: string,
    droneName: string,
    droneRole: RoleName,
    maxAmount: number,
    droneBody: BodyPartConstant[]
  ): void {
    const spawn = Game.spawns[spawnName];
    if (!spawn) {
      return;
    }

    const creeps = _.filter(Game.creeps, (creep: Creep) => creep.memory.role === droneRole);

    if (creeps.length < maxAmount) {
      const newName = `${droneName}-${Game.time}`;
      spawn.spawnCreep(droneBody, newName, {
        memory: {
          role: droneRole
        }
      });
    }

    if (spawn.spawning) {
      const spawningCreep = Game.creeps[spawn.spawning.name];
      if (spawningCreep) {
        spawn.room.visual.text(spawningCreep.memory.role, spawn.pos.x + 1, spawn.pos.y, {
          align: "left",
          opacity: 0.8
        });
      }
    }
  }
}
