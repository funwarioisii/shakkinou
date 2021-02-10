import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { shakkinouForSlack } from './lib/slack';


// `admin.initializeApp`はここだけで良くて、他でやると怒られる
admin.initializeApp(functions.config().firebase);

export const shakkinouSlack = functions.https.onRequest((req: functions.Request, res: functions.Response) => shakkinouForSlack(req, res));
