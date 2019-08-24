import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

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


export const helloWorld = functions.https.onRequest((req, res) => {
  const messages = req.body.text.split(" ");
  if (messages[0] === "history") {
    database.ref('history')
      .on('value', ((snapshot) => {
        const result = ((mess) => {
          const _result = snapshot.val();
          if (mess.length >=2 && Number(mess[1])) {
            const keys = Object.keys(_result).slice(Object.keys(_result).length - Number(messages[1]));
            const _res = {};
            for (const key of keys) {
              _res[key] = _result[key]
            }
            return _res
          } else {
            return _result
          }
        })(messages);
        let responseBody = "";
        for (const key in result) {
          responseBody += `[${key}] `;
          const fromName = nameConverter(result[key].fromName);
          const toName = nameConverter(result[key].toName);
          const price = result[key].price;
          const description = result[key].description;
          const breakdown = ((x) => {
            if (description === undefined) {
              return ""
            } else {
              return `（内訳：${description}）`
            }
          })(description);
          responseBody += `${fromName}から${toName}に${price}円渡してる．${breakdown}\n`
        }

        res.send({
          response_type: "in_channel",
          text: responseBody
        })
      }),
      ((err) => console.error(err)))

  } else if(messages[0] === "help"){
    res.send({
      response_type: "in_channel",
      text: "[使い方] \n\t/shakkin [誰から] [誰へ] [いくら] [内訳]\n[他のコマンド]: \n\thelp: この文字列\n\thistory: 今までの一覧\n\tsum: 総和（未実装"
    })
  } else if(messages[0] === "sum") {

    database.ref('history')
      .on('value', ((snapshot) => {
        const result = snapshot.val();
        let accumulatePrice = {};

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
  res.status(201).send("done")
});