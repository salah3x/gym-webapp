export interface User {
    email: string;
    claims: {
        superadmin: boolean,
        admin: boolean,
        user: boolean
    };
    disabled: boolean;
}
