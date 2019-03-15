export interface User {
    email: string;
    claims: {
        superadmin: boolean,
        admin: boolean,
        manager: boolean
    };
    disabled: boolean;
}
