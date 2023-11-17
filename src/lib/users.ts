import type { AuthenticatorDevice } from '@simplewebauthn/typescript-types';
import { rpID } from "./relying-party";

const loggedInUserId = 'internalUserId';

interface LoggedInUser {
  id: string;
  username: string;
  devices: AuthenticatorDevice[];
  currentChallenge?: string;
}

type InMemoryDB = { [loggedInUserId: string]: LoggedInUser };

const inMemoryUserDeviceDB: InMemoryDB = {
  [loggedInUserId]: {
    id: loggedInUserId,
    username: `user@${rpID}`,
    devices: [],
    currentChallenge: undefined,
  },
};

export function updateUser(userId: string, user: LoggedInUser): Promise<void> {
  inMemoryUserDeviceDB[userId] = user;
  return Promise.resolve();
}

export function getUser(userId = loggedInUserId): Promise<LoggedInUser> {
  return Promise.resolve({ ...inMemoryUserDeviceDB[userId] });
}
