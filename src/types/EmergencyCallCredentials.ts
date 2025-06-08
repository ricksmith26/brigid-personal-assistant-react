export type EmergencyCallCredentialsType = {
    _id: string;
    name: string;
    sipUri: string;
    websocketUrl: string;
    username: string;
    password: string;
    extension: string;
    transport: string;
    domain: string;
    active: boolean;
    icon?: any;
    status: string
    port: number;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    __v: number;
    type: 'agent';
};
