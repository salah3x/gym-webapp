// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  superadminApi:
    'https://us-central1-gym-webapp.cloudfunctions.net/superadmin/api/superadmin/',
  adminApi:
    'https://us-central1-gym-webapp.cloudfunctions.net/admin/api/admin/',
  firebase: {
    apiKey: 'AIzaSyCg-szSoxtGNZR1NGdGr02jDzhYGP1COZ4',
    authDomain: 'gym-webapp.firebaseapp.com',
    databaseURL: 'https://gym-webapp.firebaseio.com',
    projectId: 'gym-webapp',
    storageBucket: 'gym-webapp.appspot.com',
    messagingSenderId: '217921355428'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
