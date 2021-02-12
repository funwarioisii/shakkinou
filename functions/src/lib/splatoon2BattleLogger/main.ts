import { Splatoon2BattleLog, Splatoon2BattleLogger, Splatoon2BattleLoggerConnector } from "./types";

export class Splatoon2BattleLoggerApp implements Splatoon2BattleLogger {
  constructor(private connector: Splatoon2BattleLoggerConnector) {}
  showBattleLogs = (logSize: number): Promise<Splatoon2BattleLog[]> => {
    return this.connector.fetchBattleLogs().then((logs) => {
      if (logSize) {
        return logs.sort((a, b) => (a.time - b.time)).slice(logs.length - logSize)
      } else {
        return logs.sort((a, b) => (a.time - b.time))
      }
    })
  };
  createBattleLog = (log: Splatoon2BattleLog): Promise<boolean> => this.connector.createBattleLog(log);
  // accumulate: () => Promise<Splatoon2BattleLog[]>;
}
