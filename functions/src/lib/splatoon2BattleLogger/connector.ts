import * as admin from 'firebase-admin';
import { Context } from '../types';
import { Splatoon2BattleLoggerConnector, Splatoon2BattleLog } from './types';

export class Splatoon2BattleLoggerFirebaseConnector implements Splatoon2BattleLoggerConnector {
  database: admin.database.Database;
  context: Context;

  constructor(context: Context) {
    this.database = admin.database();
    this.context = context;
  }

  fetchBattleLogs() : Promise<Splatoon2BattleLog[]> {
    const {token, product_name, db_name} = this.context;
    return this.database.ref(`${token}/${product_name}/${db_name}`).once('value')
      .then((snapshot) => {
        const rawLogs = snapshot.val()
        return Object.keys(rawLogs).map(registeredAt => {
          return {
            id: rawLogs[registeredAt].id,
            result: rawLogs[registeredAt].result,
            weaponId: rawLogs[registeredAt].weaponId,
            stageId: rawLogs[registeredAt].stageId,
            ruleId: rawLogs[registeredAt].ruleId,
            memo: rawLogs[registeredAt].memo,
            time: rawLogs[registeredAt].time
          } as Splatoon2BattleLog
        })
      })
      .catch((err) => {throw err})
  }

  createBattleLog = (log: Splatoon2BattleLog): Promise<boolean> => {
    const { token, product_name, db_name } = this.context;
    const { id, result, stageId, ruleId, weaponId, memo } = log;
    const now = Date.now();
    return this.database
      .ref(`${token}/${product_name}/${db_name}/${now}`)
      .set({ time: now, id, result, stageId, ruleId, weaponId, memo })
      .then(() => true)
      .catch((err) => {console.error(err); return false;});
  }
}
