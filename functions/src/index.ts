import * as functions from 'firebase-functions';
import * as f_admin from 'firebase-admin';
import * as superadminApp from './app/super-admin';
import * as adminApp from './app/admin';

f_admin.initializeApp(functions.config().firebase);

export const superadmin = functions.https.onRequest(superadminApp.app);

export const admin = functions.https.onRequest(adminApp.app);
