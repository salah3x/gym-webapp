import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'
import * as superAdminApp from './app/super-admin';

admin.initializeApp(functions.config().firebase);

export const superAdmin = functions.https.onRequest(superAdminApp.app);
