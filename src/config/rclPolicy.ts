import { RoleName } from "types/roles";

export interface RoleQuota {
  role: RoleName;
  maxAmount: number;
  body: BodyPartConstant[];
}

/** Этап 0 колонии: RCL1, один spawn, без контейнеров. */
export function getBootstrapQuotas(room: Room): RoleQuota[] {
  const sites = room.find(FIND_MY_CONSTRUCTION_SITES).length;
  const quotas: RoleQuota[] = [
    {
      role: "bootstrap",
      maxAmount: 3,
      body: [WORK, CARRY, MOVE]
    }
  ];

  if (sites > 0) {
    quotas.push({
      role: "youngBuilder",
      maxAmount: 1,
      body: [WORK, CARRY, MOVE]
    });
  }

  return quotas;
}
