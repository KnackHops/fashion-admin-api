import { Admin } from 'generated/prisma';

export interface ILoginResponse {
  access_token: string;
  user: Admin;
}

export interface IAccessTokenPayload {
  sub: number;
  email: string;
}

export interface IAccessToken {
  access_token: string;
}
