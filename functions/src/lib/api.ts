import express = require('express');
import cors = require('cors');

import { Context } from './types';
import { Splatoon2BattleLoggerFirebaseConnector } from './splatoon2BattleLogger/connector';
import { Splatoon2BattleLoggerApp } from './splatoon2BattleLogger/main';
import { ShakkinouFirebaseConnector } from './shakkinou/connector';
import { ShakkinouApp } from './shakkinou/main';
import { Splatoon2BattleLog } from './splatoon2BattleLogger/types';

const api = express()

api.use(cors({ origin: true }));
api.use(express.json());
api.use(express.urlencoded({ extended: true }));

api.get('/shakkinou/:historySize', (req, res) => {
  console.log(`2. ${req.query}`)
  if (!req.query || !req.query.token) throw Error('should set token')
  console.log(`3. ${req.query.token} ${Number(req.query.historySize)}`)
  const token = req.query.token;
  const historySize = Number(req.query.historySize);
  const context = {token, product_name: "shakkinou", db_name: "history"} as Context;
  const shakkinouConnector = new ShakkinouFirebaseConnector(context);
  const shakkinou = new ShakkinouApp(shakkinouConnector);

  shakkinou
    .showHistories(historySize)
    .then((histories) => { res.json(histories); })
    .catch((e) => console.log(e))
})

api.get('/splatoon2BattleLoggerApp', (req, res) => {
  if (!req.query || !req.query.token) throw Error('should set token')
  const token = req.query.token;
  const logSize = Number(req.query.logSize);
  const context: Context = { token, product_name: "splatoon2BattleLogger", db_name: 'battleLogs'};
  const splatoon2BattleLoggerApp = new Splatoon2BattleLoggerApp(new Splatoon2BattleLoggerFirebaseConnector(context))  
  splatoon2BattleLoggerApp
    .showBattleLogs(logSize)
    .then((logs) => { res.json(logs) })
    .catch((e) => console.error(e))
});

api.post('/splatoon2BattleLoggerApp', (req, res) => {
  if (!req.query || !req.query.token) throw Error('should set token')
  const token = req.query.token;
  const battleLog: Splatoon2BattleLog = req.body
  const context: Context = { token, product_name: "splatoon2BattleLogger", db_name: 'battleLogs'};
  const splatoon2BattleLoggerApp = new Splatoon2BattleLoggerApp(new Splatoon2BattleLoggerFirebaseConnector(context))  
  splatoon2BattleLoggerApp
    .createBattleLog(battleLog)
    .then((logs) => { res.json(logs) })
    .catch((e) => console.error(e))
})

export default api