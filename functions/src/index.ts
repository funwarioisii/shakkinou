import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import dayjs = require('dayjs');


const IncomingWebhook = require('@slack/client').IncomingWebhook;
const webhook = new IncomingWebhook(functions.config().shakkinou.incoming_slack_url);

admin.initializeApp(functions.config().firebase);
const database = admin.database();


// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

/**
 * @param fromName 誰から
 * @param toName 誰へ
 * @param price いくら
 */
const writeHistory = (
  (fromName: string, toName: string, price: number) => {
    const now = Date.now();
    database
      .ref('history/' + now)
      .set({
        time: now,
        fromName: fromName,
        toName: toName,
        price : price
      })
      .then(() => console.log("Write success"))
      .catch((err) => console.error(err));
});

/**
 * 
 * @param fromName 誰から
 * @param toName 誰へ
 * @param price いくら
 * @param description 理由
 */
const writeHistoryWithDesc = (
  (fromName: string, toName: string, price: number, description: string) => {
    const now = Date.now();
    database
    .ref('history/' + now)
    .set({
      time: now,
      fromName: fromName,
      toName: toName,
      price : price,
      description: description
    })
    .then(() => console.log("Write success"))
    .catch((err) => console.error(err));
});


const nameConverter = (name: string) => {
  if (!name.startsWith(":")) {
    return `:${name}:`
  } else {
    return name
  }
};

const fetchHistory = async(historySize: number) => {
  const snapshot = await database.ref('history').once('value')

  const result = {}
  const _result = snapshot.val()
  const keys = Object.keys(_result).slice(Object.keys(_result).length - historySize);  // messages[1]分だけ過去ログの読み込み
  for (const key of keys) {
    result[key] = _result[key]
  }

  let responseBody = "";
  for (const key in result) {
    const date = dayjs(Number(key))
    responseBody += `[${date.format("YYYY-MM-DD ddd")}] `;
    const fromName = nameConverter(result[key].fromName);
    const toName = nameConverter(result[key].toName);
    const price = Number(result[key].price).toLocaleString();
    const description = result[key].description;
    const breakdown = ((x) => {
      if (x === undefined) {
        return ""
      } else {
        return `（内訳：${x}）`
      }
    })(description);
    responseBody += `${fromName}から${toName}に${price}円渡してる．${breakdown}\n`
  }
  return responseBody
}


export const helloWorld = functions.https.onRequest((req, res) => {
  const messages = req.body.text.split(" ");
  if (messages[0] === "history") {
    fetchHistory(Number(messages[1]))
    .then((responseBody) => {        
      res.send({
        response_type: "in_channel",
        text: responseBody
      })})
      .catch((e) => {
        res.send({
          response_type: "in_channel",
          text: e
        })
      })
  } else if(messages[0] === "help"){
    res.send({
      response_type: "in_channel",
      text: "[使い方] \n\t/shakkin [誰から] [誰へ] [いくら] [内訳]\n[他のコマンド]: \n\thelp: この文字列\n\thistory: 今までの一覧\n\tsum: 総和（未実装"
    })
  } else if(messages[0] === "sum") {

    database.ref('history')
      .on('value', ((snapshot) => {
        const result = snapshot.val();
        const accumulatePrice = {};

        Object.keys(result).forEach(key => accumulatePrice[nameConverter(result[key].fromName)] = 0);

        Object.keys(result).forEach(key => accumulatePrice[nameConverter(result[key].fromName)] += Number(result[key].price));

        let responseBody = "";
        Object.keys(accumulatePrice).forEach((element) => {
          responseBody += `${element}は${accumulatePrice[element]}円貸してる \n`
        });

        res.send({
          response_type: "in_channel",
          text: responseBody
        })
      }),
      ((err) => console.error(err)))

  } else if (messages.length !== 3 && messages.length !== 4){
    res.send("argument error, [from: str] [to: str] [price: int]")
  } else if (messages.length === 3){
    const fromName = messages[0];
    const toName = messages[1];
    const price = messages[2];

    writeHistory(fromName, toName, price);
    res.send({
      response_type: "in_channel",
      text: "recorded!"
    })
  } else if (messages.length === 4) {
    const fromName: string = messages[0];
    const toName: string = messages[1];
    const price: number = messages[2];
    const description: string = messages[3];

    writeHistoryWithDesc(fromName, toName, price, description);
    res.send({
      response_type: "in_channel",
      text: "recorded!"
    })
  }
});

export const saveShakkinInfo = functions.https.onRequest((req, res) => {
  const fromName: string = req.body.queryResult.parameters.srcPerson;
  const toName: string = req.body.queryResult.parameters.dstPerson;
  const price: number = req.body.queryResult.parameters.price;
  const description: string = req.body.queryResult.parameters.reason;
  if (fromName === null || fromName === "") {
    res.status(400).send("something input error")
  }

  writeHistoryWithDesc(fromName, toName, price, description);
  (async () => {
    await webhook.send({
      text: `${fromName}から${toName}に${price}円貸した記録が登録されました`,
    })})()
    .then(()=> res.status(201).send("done"))
    .catch((e) => res.status(500).send(e));
  res.status(201).send("done")
});


export const getShakkinHistory = functions.https.onRequest((req, res) => {
  const historySize = Number(req.body.queryResult.parameters.historySize);
  if (historySize ===undefined) {
    res.status(400).send("something input error")
  }

  fetchHistory(historySize)
    .then((message) => res.status(201).send({ message }))
    .catch((e) => res.status(500).send(`${e}: ${req.body.queryResult.parameters}`))
})