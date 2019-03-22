import * as firebase from 'firebase';

export interface Client {
    name: {
        first: string;
        last: string;
    };
    registrationDate: firebase.firestore.Timestamp;
    sex: string;
    photo?: string;
    cin?: string;
    phone?: string;
    address?: string;
    note?: string;
}
