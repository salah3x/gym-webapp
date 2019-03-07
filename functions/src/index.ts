import * as functions from 'firebase-functions';
import * as superAdminApp from './app/super-admin';

export const superAdmin = functions.https.onRequest(superAdminApp.app);
