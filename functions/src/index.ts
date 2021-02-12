import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { shakkinouForSlack } from './lib/slack';
import api from './lib/api';


// `admin.initializeApp`はここだけで良くて、他でやると怒られる
admin.initializeApp(functions.config().firebase);

exports.shakkinouSlack = functions.https.onRequest(shakkinouForSlack);
exports.api =  functions.https.onRequest((req, res) => {
  console.log(`1. ${req.query}`)
  console.log(`1.1. ${req.url}`)
  return api(req, res)
});
