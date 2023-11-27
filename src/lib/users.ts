import { Schema, model, connect, Model } from "mongoose";
import type { AuthenticatorDevice } from '@simplewebauthn/typescript-types';

export async function connectDB() {
  await connect("mongodb://127.0.0.1:27017/test")
}

export interface IUser {
  username: string;
  devices: AuthenticatorDevice[];
  currentChallenge?: string;
}

const authDeviceSchema = new Schema<AuthenticatorDevice>({
  credentialPublicKey: Buffer,
  credentialID: Buffer,
  counter: { type: Number, default: 0 },
  transports: [String],
});

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  devices: { type: [authDeviceSchema] },
  currentChallenge: { type: String }
});

const User = model<IUser>("User", userSchema);

function getUserDataFromModel(user: any): IUser {
  return {
    username: user.username,
    devices: user.devices,
    currentChallenge: user.currentChallenge
  }
}

export async function addUser(username: string): Promise<IUser> {
  const user = await User.create({
    username,
    devices: [],
    currentChallenge: undefined,
  });
  return getUserDataFromModel(user);
}

export async function updateUser(user: IUser): Promise<void> {
  console.log(user);
  await User.updateOne({ username: user.username }, user);
}

export async function getUser(username: string): Promise<IUser | null> {
  const user = await User.findOne({ username });
  return Promise.resolve(user ? getUserDataFromModel(user) : null);
}
