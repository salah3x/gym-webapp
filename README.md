# Gym Manager [![Build Status](https://travis-ci.org/salah3x/gym-webapp.svg?branch=master)](https://travis-ci.org/salah3x/gym-webapp)

This is a webapp for managing clients' subscriptions and check-ins for a gym, also enabling admins to view and monitor incomes, material resources and repairs.

## Development server (angular cli)
* First clone the repo: `git clone git@github.com:salah3x/gym-webapp.git`
* Install dependencies for the web app (assuming `node`, `npm` and `ng` are already installed): `cd gym-webapp && npm install`
* Install dependencies for the backend project: `cd functions && npm install`
* Run `ng serve` for a dev server.
* Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Development server (firebase cli)
* Serve the hosting plan (content of `dist/gym-webapp`) locally: `firebase serve --only hosting`
* Serve the cloud functions in a local server: `firebase serve --only functions[:function_name]`

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/gym-webapp` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Deployment

* Install firebase tools: `npm install -g firebase-tools`
* Authenticate the cli and access Firebase projects: `firebase login`
* Initialize your site (choose the `dist/gym-webapp` folder for the hosting plan): `firebase init`
* Deploy the site and the backend functions to Firebase: `firebase deploy [--only hosting | functions]` (This will build the project first and do some linting)

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

To start with firebase go to the [firebase console](https://console.firebase.google.com/) and create your first project.

To get more informations about firebase cli use `firebase --help` or visit [the official docs](https://firebase.google.com/docs/cli/).

***

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.4.