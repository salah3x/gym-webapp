import { firestore } from 'firebase/app';

export interface Client {
    name: {
        first: string;
        last: string;
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
    idClient: string;
    note?: string;
}
