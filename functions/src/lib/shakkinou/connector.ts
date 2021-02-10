import * as admin from 'firebase-admin';
import { Context } from 'vm';
import { ShakkinouConnector, History } from './types';

export class ShakkinouFirebaseConnector implements ShakkinouConnector {
  database: admin.database.Database;
  context: Context;

  constructor(context: Context) {
    this.database = admin.database();
    this.context = context;
  }

  fetchHistories() : Promise<History[]> {
    const {token, product_name, db_name} = this.context;
    return this.database.ref(`${token}/${product_name}/${db_name}`).once('value')
      .then((value) => {
        const histories = value.val()
        return Object.keys(histories).map(registeredAt => {
          return {
            fromName: histories[registeredAt].fromName,
            toName: histories[registeredAt].toName,
            price: histories[registeredAt].price,
            description: histories[registeredAt].description,
            time: histories[registeredAt].time
          } as History
        })
      })
      .catch((err) => {throw err})
  }

  createHistory = (history: History): Promise<boolean> => {
    const {token, product_name, db_name} = this.context;
    const { fromName, toName, price } = history;
    const now = Date.now();
    return this.database
      .ref(`${token}/${product_name}/${db_name}/${now}`)
      .set({ time: now, fromName, toName, price })
      .then(() => true)
      .catch((err) => {console.error(err); return false;});
  }
}
