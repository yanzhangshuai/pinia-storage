import { PiniaPluginContext, StateTree, Store } from 'pinia';


export const PiniaStorage =
  (options?: { prefix?: string }) =>
    ({ options: piniaOptions, store }: PiniaPluginContext) => {

      initStore(store, piniaOptions?.storage, options?.prefix);
      watchStore(store, piniaOptions?.storage, options?.prefix);

    };


type StorageConvertType = {
  write?: (...args: any[]) => string
  read?: (args: string | null) => any
}

export type PiniaStorage = {
  session?: Array<keyof StateTree> | Partial<Record<keyof StateTree, StorageConvertType>>,
  local?: Array<keyof StateTree> | Partial<Record<keyof StateTree, StorageConvertType>>
};

type StorageType = 'local' | 'session';

const Storage = {
  local: window.localStorage,
  session: window.sessionStorage
};

function watchStore(store: Store<string, Record<string | number | symbol, any>>, piniaStorage?: PiniaStorage, prefix?: string) {

  if (!store || !piniaStorage) return;

  prefix = prefix || '';

  const _func = (storageName: StorageType) => {

    const currentPiniaStorage = piniaStorage?.[storageName];
    const currentStorage = Storage?.[storageName];

    if (!currentPiniaStorage || !currentStorage) return;

    if (!isArray(currentPiniaStorage) && !isObject(currentPiniaStorage)) return;

    store.$subscribe((item, state) => {

      const updateKeys = Object.keys(state);

      if (isArray(currentPiniaStorage)) {

        intersection(currentPiniaStorage, updateKeys).forEach((key) => {

          // 利用交集获取当前需要更新的key
          currentStorage.setItem(`${prefix}${item.storeId}_${key.toString()}`, state[key]);

        });

      } else {
        // Object

        const storageKeys = Object.keys(currentPiniaStorage);

        intersection(storageKeys, updateKeys).forEach((key) => {
          // 利用交集获取当前需要更新的key

          const write = currentPiniaStorage[key]?.write;
          // 转换
          const value = write ? write(state[key]) : state[key].toString();

          currentStorage.setItem(`${prefix}${item.storeId}_${key.toString()}`, value);
        });
      }

    });


  };

  _func('local');

  _func('session');

}

function initStore(store: Store<string, Record<string | number | symbol, any>>, piniaStorage?: PiniaStorage, prefix?: string) {

  if (!store || !piniaStorage) return;

  prefix = prefix || '';

  const _func = (storageName: StorageType) => {

    const currentPiniaStorage = piniaStorage?.[storageName];
    const currentStorage = Storage?.[storageName];

    if (!currentPiniaStorage || !currentStorage) return;


    if (isArray(currentPiniaStorage)) {
      // Array
      currentPiniaStorage.forEach(key => {

        store[key] = currentStorage.getItem(`${prefix}${store.$id}_${key.toString()}`);
      });

    } else if (isObject(currentPiniaStorage)) {
      // Object
      Object.keys(currentPiniaStorage).forEach(key => {

        const value = currentStorage.getItem(`${prefix}${store.$id}_${key.toString()}`);
        // 转换
        store[key] = currentPiniaStorage[key]?.read ? currentPiniaStorage?.[key]?.read?.(value) : value;
      });
    }
  };

  _func('local');
  _func('session');


}


const toString = Object.prototype.toString;

function is(val: unknown, type: string): boolean {
  return toString.call(val) === `[object ${type}]`;
}

function isObject(val: any): val is Record<string | number | symbol, unknown> {
  return val !== null && is(val, 'Object');
}


function isArray(val: any): val is Array<any> {
  return val && is(val, 'Array');
}


/**
 * 交集
 * @param arr1
 * @param arr2
 * @param fn
 * @returns
 */
function intersection<T>(arr1: Array<T>, arr2: Array<T>, fn?: (val1: T, val2: T) => boolean) {
  const _fn = fn || ((val1, val2) => val1 === val2);
  return arr1.filter((val1) => arr2.find((val2) => _fn(val1, val2)));
}

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    storage?: {
      session?: Partial<Record<keyof S, StorageConvertType>> | Array<keyof S>;
      local?: Partial<Record<keyof S, StorageConvertType>> | Array<keyof S>;
    };
  }
}
