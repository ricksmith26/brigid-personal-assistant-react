export type User = {
    _id: string;
    googleId: string;
    name: string;
    email: string;
    picture: string;
    createdAt: string; // ISO date string
    __v: number;
    accessToken?: string; // Optional if you don't always return it
  };