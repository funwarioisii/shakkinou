import { Context } from "./types";
import { ShakkinouFirebaseConnector } from "./shakkinou/connector";
import { ShakkinouApp } from "./shakkinou/main";
import { History } from "./shakkinou/types";
import * as functions from 'firebase-functions';
import dayjs = require("dayjs");

type ShakkinouSlackPattern = "record" | "history" | "sum" | "help"

const nameConverter = (name: string) => {
  return name.match(/:\w{1,2000}:/) ? name : `:${name}:`
}

const decideShakkinouMessagePattern = (messages: string[]): ShakkinouSlackPattern => {
  if (messages[0] === "history") {
    return "history"
  } else if(messages[0] === "help"){
    return "help"
  } else if(messages[0] === "sum") {
    return "sum"
  } else if (messages.length === 3){
    return "record"
  } else if (messages.length === 4) {
    return "record"
  } else if (messages.length !== 3 && messages.length !== 4) {
    return "help"
  } else {
    return "help"
  }
}

export const shakkinouForSlack = (req: functions.Request, res: functions.Response) => {
  const token = req.query.token;
  if (!token) console.error(`token is invalid: ${token}, ${req.params}`);
  const messages = req.body.text.split(" ");

  const pattern = decideShakkinouMessagePattern(messages);
  const context = {token, product_name: "shakkinou", db_name: "history"} as Context;
  const shakkinouConnector = new ShakkinouFirebaseConnector(context);
  const shakkinou = new ShakkinouApp(shakkinouConnector);

  if (pattern === "history") {
    shakkinou
      .showHistories(Number(messages[1]))
      .then((histories) => {
        const responseBody = histories.reduce((acc, history) => {
          const {fromName, toName, price, description, time} = history;
          const dateHeader = `[${dayjs(Number(time)).format("YYYY-MM-DD ddd")}]`
          const breakdown = description ? `（内訳：${description}）` : ""
          return acc + `${dateHeader} ${nameConverter(fromName)}が${nameConverter(toName)}に${price}円貸してる${breakdown}\n`
        }, "");

        res.send({
          response_type: "in_channel",
          text: responseBody
        })})
      .catch((e) => { res.send({ response_type: "in_channel", text: e }) })
  } else if (pattern === "sum") {
    shakkinou.accumulate()
      .then((items) => {
        items.forEach((item) => console.log(item));
        const replyMessage = items.reduce((message, item) => message + `${item.fromName}から${item.toName}へ${item.price}円貸してる\n`, '')
        res.send({
          response_type: "in_channel",
          text: replyMessage
        })})
      .catch((e) => { res.send({ response_type: "in_channel", text: e }) })
  } else if (pattern === "record") {
    const fromName = nameConverter(messages[0]);
    const toName = nameConverter(messages[1]);
    const time = Date.now();
    console.log(messages)
    const description = messages[3] ? messages[3] : ""
    const history: History = {fromName, toName, time, description, price: Number(messages[2])};
    shakkinou.createHistory(history)
      .then((_) => {
        res.send({
          response_type: "in_channel",
          text: "記録しました！"
        })
      })
      .catch((e) => { res.send({ response_type: "in_channel", text: e }) })
  } else {
    res.send({
      response_type: "in_channel",
      text: "[使い方] \n\t/shakkin [誰から] [誰へ] [いくら] [内訳]\n[他のコマンド]: \n\thelp: ヘルプ(この文字列)\n\thistory: 今までの一覧\n\tsum: 今までの合計"
    })
  }
}
