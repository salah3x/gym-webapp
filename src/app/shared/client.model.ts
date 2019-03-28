import { firestore } from 'firebase/app';

export interface Client {
    name: {
        first: string;
        first_lowercase: string; // for quering in firestore
        last: string;
        last_lowercase: string; // for quering in firestore
    };
    registrationDate: firestore.Timestamp;
    sex: string;
    photo?: string;
    cin?: string;
    phone?: string;
    address?: string;
    note?: string;
    insurance: boolean;
    pack: {
        idPack: string;
        idSubscription: string;
    };
}

export interface ClientWithId extends Client {
    id: string;
}

export interface Pack {
    name: string;
    price: number;
    description?: string;
}

export interface PackWithId extends Pack {
    id: string;
}

export interface Subscription {
    name?: string;
    subscriberIds: string[];
}

export interface SubscriptionWithId extends Subscription {
    id: string;
}

export interface Payment {
    date: firestore.Timestamp;
    price: number;
    idSubscription: string;
    idClient: string;
    note?: string;
}

export interface CheckIn {
    date: firestore.Timestamp;
}
