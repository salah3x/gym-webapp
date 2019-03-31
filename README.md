# Gym Manager [![Build Status](https://travis-ci.org/salah3x/gym-webapp.svg?branch=master)](https://travis-ci.org/salah3x/gym-webapp)

This is a webapp for managing clients' subscriptions and check-ins for a gym, also enabling admins to view and monitor incomes, material resources and repairs.

## Modules/Features

The app is divided into three major modules:

### Admin module:

The admin is responsible in general for operations that requires writing to the database:
* Adding new clients: The admin can add new clients and create/assign subscriptions
* Add new payments for a client.
* Change information in client's profile
* Managing packs: The admin can create, delete and view packs and their subscriptions
* Analytics: The admin can view incomes and add charges for each month.

### Manager module:

Managers can:
* search for clients.
* perform check ins for a client
* view a client's profile

### Superadmin module:

The superadmin is only responsible for managing users and roles (access control).

***

## Development server (angular cli)
* First clone the repo: `git clone git@github.com:salah3x/gym-webapp.git`
* Install dependencies for the web app (assuming `node`, `npm` and `ng` are already installed): `cd gym-webapp && npm install`
* Install dependencies for the backend project: `cd functions && npm install`
* Run `cd ..` to navigate back to the parent folder.
* Run `ng serve` for a dev server.
* Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Development server (firebase cli)
* Serve the angular web app (content of `dist/gym-webapp`) locally: `npm run serve`
> This is used to emulate the firebase hosting plan, use `ng serve` for development instead.
* Serve the cloud functions locally: `npm --prefix functions run serve`

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
* Deploy the angular web app to Firebase: `npm run deploy` 
* Deploy the backend to cloud functions: `npm --prefix functions run deploy`
* Or deploy everything using firebase cli: `firebase deploy` (This will deploy the angular web app, the express backend, the cloud storage rules and firestore rules & indexes)
> The deployment phase will build the projects first and do some linting.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

To start with firebase go to the [firebase console](https://console.firebase.google.com/) and create your first project.

To get more informations about firebase cli use `firebase --help` or visit [the official docs](https://firebase.google.com/docs/cli/).

***

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.4.
