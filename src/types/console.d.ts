/**
 * Screeps предоставляет `console` глобально (не DOM).
 * @see https://docs.screeps.com/debugging.html
 */
interface ScreepsConsole {
  log(...args: unknown[]): void;
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  info(...args: unknown[]): void;
  debug(...args: unknown[]): void;
}

declare const console: ScreepsConsole;
