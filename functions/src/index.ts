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
const writeHistory = ((fromName: string, toName: string, price: number) => {

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

export const helloWorld = functions.https.onRequest((req, res) => {
  const messages = req.body.text.split(" ")
  if (messages[0] === "history") {
    database.ref('history')
      .on('value', ((snapshot) => {
        const result = snapshot.val()
        let responseBody = ""
        for (const key in result) {
          responseBody += `${key}\n`
          const fromName = result[key].fromName
          const toName = result[key].toName
          const price = result[key].price
          responseBody += `${fromName}から${toName}に${price}円渡してる\n`
        }
        // res.send(responseBody)

        res.send({
          response_type: "in_channel",
          text: responseBody
        })
      }),
      ((err) => console.error(err)))

  } else if (messages.length !== 3){
    res.send("augument error, [from: str] [to: str] [price: int]")
  } else {
    const fromName = messages[0]
    const toName = messages[1]
    const price = messages[2]

    writeHistory(fromName, toName, price)
    res.send("recorded!");
  }
});
