export function logCpu(label: string): void {
  console.log(`[${label}] CPU: ${Game.cpu.getUsed().toFixed(2)}`);
}
