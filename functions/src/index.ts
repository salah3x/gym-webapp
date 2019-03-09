import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'
import * as superadminApp from './app/super-admin';

admin.initializeApp(functions.config().firebase);

export const superadmin = functions.https.onRequest(superadminApp.app);
