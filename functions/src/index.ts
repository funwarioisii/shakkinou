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
    const now = Date.now()
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
 * @param fromName 誰から
 * @param toName 誰へ
 * @param price いくら
 * @param description 内訳
 */
const writeHistoryWithDesc = (
  (fromName: string, toName: string, price: number, description: string) => {
    const now = Date.now()
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
})

const readHistory = (): string =>  {
  let responseBody: string = ""
  database.ref('history')
    .on('value', ((snapshot) => {
      const result: object = snapshot.val()
      for (const key in result) {
        responseBody += `${key}\n`
        const fromName: string = result[key].fromName
        const toName: string = result[key].toName
        const price: number = result[key].price
        responseBody += `${fromName}から${toName}に${price}円渡してる\n`
      }
  }),
  ((err) => {
    console.error(err)
    return `何らかのエラーが発生したかも $err`
  }))
  return responseBody
}

export const helloWorld = functions.https.onRequest((req, res) => {
  const messages = req.body.text.split(" ")
  if (messages[0] === "history") {
    res.send({
      response_type: "in_channel",
      text: readHistory()
    })
  } else if (messages.length !== 3 && messages.length !== 4){
    res.send("augument error, [from: str] [to: str] [price: int]")
  } else if (messages.length === 3){
    const fromName = messages[0]
    const toName = messages[1]
    const price = messages[2]

    writeHistory(fromName, toName, price)
    res.send({
      response_type: "in_channel",
      text: "recorded!"
    })
  } else if (messages.length === 4) {
    const fromName: string = messages[0]
    const toName: string = messages[1]
    const price: number = messages[2]
    const description: string = messages[3]

    writeHistoryWithDesc(fromName, toName, price, description)
    res.send({
      response_type: "in_channel",
      text: "recorded!"
    })
  }
});
