import type { Role } from "./roles/Role";
import type { RoleName } from "types/roles";
import { BootstrapRole } from "./roles/BootstrapRole";
import { CarrierRole } from "./roles/CarrierRole";
import { HarvesterRole } from "./roles/HarvesterRole";
import { BuilderRole } from "./roles/BuilderRole";
import { UpgraderRole } from "./roles/UpgraderRole";
import { YoungHarvesterRole } from "./roles/YoungHarvesterRole";
import { YoungBuilderRole } from "./roles/YoungBuilderRole";
import { YoungUpgraderRole } from "./roles/YoungUpgraderRole";

const roles: Record<RoleName, Role> = {
  bootstrap: new BootstrapRole(),
  carrier: new CarrierRole(),
  harvester: new HarvesterRole(),
  builder: new BuilderRole(),
  upgrader: new UpgraderRole(),
  youngHarvester: new YoungHarvesterRole(),
  youngBuilder: new YoungBuilderRole(),
  youngUpgrader: new YoungUpgraderRole()
};

export class CreepManager {
  static run(): void {
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      const role = roles[creep.memory.role];
      if (role) {
        role.run(creep);
      } else {
        // Крип без роли / legacy — ведем как bootstrap RCL1.
        roles.bootstrap.run(creep);
      }
    }
  }
}
