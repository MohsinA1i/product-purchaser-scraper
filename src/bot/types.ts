export type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};

export interface Product {
    url: string;
    keywords?: string;
    sizes?: string[];
}

export interface Account {
    email: string;
    password: string;
}

export interface Contact {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    country: string;
    state: string;
    zip: string;
}

export interface Card {
    number: string;
    name: string;
    expiry: string;
    cvv: string;
}