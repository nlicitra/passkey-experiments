import { Table } from "sst/node/table";
import { randomUUID } from "crypto";
import { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import type { AuthenticatorDevice } from "@simplewebauthn/typescript-types";

export interface IUser {
  id: string;
  username: string;
  devices: AuthenticatorDevice[];
  currentChallenge?: string;
}

const ddbClient = new DynamoDBClient({ region: "us-east-1" });

export async function addUser(username: string): Promise<IUser> {
  const id = randomUUID();
  const command = new PutItemCommand({
    TableName: Table.Users.tableName,
    Item: {
      id: {
        S: id,
      },
      username: {
        S: username,
      },
    },
  });
  await ddbClient.send(command);
  return {
    id,
    username,
    devices: [],
    currentChallenge: undefined,
  };
}

export async function updateUser(user: IUser): Promise<void> {
  const command = new UpdateItemCommand({
    TableName: Table.Users.tableName,
    ExpressionAttributeNames: {
      "#CC": "currentChallenge",
      "#D": "devices",
    },
    ExpressionAttributeValues: {
      //@ts-ignore
      ":c": {
        S: user.currentChallenge,
      },
      ":d": {
        L: user.devices.map((d) => ({ S: marshallDevice(d) })),
      },
    },
    UpdateExpression: "SET #CC = :c, #D = :d",
    Key: {
      username: {
        S: user.username,
      },
    },
  });
  await ddbClient.send(command);
}

function marshallDevice(device: AuthenticatorDevice): string {
  const _device: any = { ...device };
  _device.credentialPublicKey = Array.from(device.credentialPublicKey);
  _device.credentialID = Array.from(device.credentialID);
  return JSON.stringify(_device);
}

function unmarshallDevice(deviceStr: string): AuthenticatorDevice {
  const device = JSON.parse(deviceStr);
  return {
    credentialPublicKey: new Uint8Array(device.credentialPublicKey),
    credentialID: new Uint8Array(device.credentialID),
    counter: device.counter,
    transports: device.transports,
  };
}

export async function getUser(username: string): Promise<IUser | null> {
  const command = new GetItemCommand({
    TableName: Table.Users.tableName,
    Key: {
      username: {
        S: username,
      },
    },
  });
  const response = await ddbClient.send(command);
  if (!response.Item) return null;
  const user = {
    id: response.Item.id.S!,
    username: response.Item.username.S!,
    devices: response.Item.devices?.L?.map((i) => unmarshallDevice(i.S!)) ?? [],
    currentChallenge: response.Item.currentChallenge?.S,
  };
  return user;
}
