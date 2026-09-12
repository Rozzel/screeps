import type { RoleName } from "types/roles";

declare global {
  interface CreepMemory {
    role: RoleName;
    colony?: string;
    state?: string;
    building?: boolean;
    upgrading?: boolean;
  }

  interface Memory {
    schemaVersion: number;
  }
}

export {};
