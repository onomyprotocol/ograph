import { BigInt, Address } from '@graphprotocol/graph-ts'
import { store } from "@graphprotocol/graph-ts/index";

export const ZERO_ADDRESS = Address.fromHexString("0x0000000000000000000000000000000000000000");
export const DEAD_ADDRESS = Address.fromHexString("0x000000000000000000000000000000000000dead");

export const ZERO = BigInt.fromI32(0);
export const ONE = BigInt.fromI32(1);

export function generateCompositeId(key1: string, key2: string): string {
  return key1 + "-" + key2
}

export function generateAwardedControlledTokenCompositeId(key1: string, key2: string, key3: string, key4: string): string {
  return key1 + "-" + key2 + "-" + key3 + "-" + key4
}

export function removeEmptyEntity(entityName: string, id: string): void {
  store.remove(entityName, id);
}

export function checkIfValueIsNullOrEmpty(entityName: string, id: string, key: string): any {
  let entity = store.get(entityName, id);
  return !entity[key];
}