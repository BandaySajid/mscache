import Store from './store.js';
import { HashData } from './types.js';

type Command = {
   name: string;
   type: 'STRING' | 'HASH' | 'LIST' | 'GLOBAL';
   run(
      store: Store,
      key: string,
      entries: Buffer[],
      expiry?: number,
   ): Buffer | string | number;
};

export const COMMANDS: Command[] = [
   { name: 'hset', run: hset_command, type: 'HASH' } as Command,
   { name: 'hget', run: hget_command, type: 'HASH' } as Command,
   { name: 'hgetall', run: hget_all_command, type: 'HASH' } as Command,
   { name: 'hdel', run: hdel_command, type: 'HASH' } as Command,
   { name: 'set', run: set_command, type: 'STRING' } as Command,
   { name: 'get', run: get_command, type: 'STRING' } as Command,
   { name: 'append', run: append_command, type: 'LIST' } as Command,
   { name: 'prepend', run: prepend_command, type: 'LIST' } as Command,
   { name: 'popl', run: popL_command, type: 'LIST' } as Command,
   { name: 'popr', run: popR_command, type: 'LIST' } as Command,
   { name: 'slice', run: slice_command, type: 'LIST' } as Command,
   { name: 'del', run: del_command, type: 'GLOBAL' } as Command,
];

export function hset_command(
   store: Store,
   key: string,
   entries: Buffer[],
): string | Buffer {
   if (entries.length % 2 !== 0 || entries.length <= 0) {
      return 'ERROR: Invalid args for "hset" command';
   }

   const hash_entries: HashData[] = [];

   let hash_data = {} as HashData;

   entries.forEach((entry, i) => {
      if (i % 2 === 0) {
         hash_data.key = entry.toString();
      } else {
         hash_data.value = entry;
         hash_entries.push(hash_data);
      }
   });

   store.hset(key, hash_entries);
   return 'OK';
}

export function hget_command(
   store: Store,
   key: string,
   entries: Buffer[],
): Buffer | null | string {
   if (entries.length > 1) {
      return 'ERROR: Invalid args for "hset" command';
   }

   return store.hget(key, entries[0].toString());
}

export function hget_all_command(
   store: Store,
   key: string,
   _: Buffer[],
): (string | Buffer)[] | null | string {
   const result = store.hgetAll(key);
   return result;
}

export function hdel_command(
   store: Store,
   key: string,
   entries: Buffer[],
): number | string {
   if (entries.length <= 0) {
      return 'ERROR: Invalid arguments for "hdel" command';
   }

   const hash_entries = [];

   for (const entry of entries) {
      hash_entries.push(entry.toString());
   }

   return store.hdel(key, hash_entries);
}

export function set_command(
   store: Store,
   key: string,
   entries: Buffer[],
): string {
   if (entries.length > 1 || entries.length <= 0) {
      return 'ERROR: Invalid arguments for "set" command';
   }
   store.set(key, entries[0]);

   return 'OK';
}

export function get_command(
   store: Store,
   key: string,
   entries: Buffer[],
): Buffer | null | string {
   if (entries.length > 0) {
      return 'ERROR: Invalid arguments for "get" command';
   }

   return store.get(key);
}

export function append_command(
   store: Store,
   key: string,
   entries: Buffer[],
): number | string {
   if (entries.length <= 0) {
      return 'ERROR: Invalid arguments for "append" command';
   }

   return store.append(key, entries);
}

export function prepend_command(
   store: Store,
   key: string,
   entries: Buffer[],
): number | string {
   if (entries.length <= 0) {
      return 'ERROR: Invalid arguments for "prepend" command';
   }

   return store.prepend(key, entries);
}

export function popL_command(
   store: Store,
   key: string,
   entries: Buffer[],
): Buffer[] | null | string {
   if (entries.length <= 0 || entries.length > 1) {
      return 'ERROR: Invalid arguments for "popl" command';
   }

   if (entries[0].toString().includes('.')) {
      return 'ERROR: count should be a positive integer value';
   }

   const count = Number(entries[0]);

   if (isNaN(count)) {
      return 'ERROR: Invalid arguments for "popL" command';
   }

   if (count <= 0) {
      return 'ERROR: count should be a positive integer for "popL" command';
   }

   return store.popL(key, count);
}

export function popR_command(
   store: Store,
   key: string,
   entries: Buffer[],
): Buffer[] | null | string {
   if (entries.length <= 0 || entries.length > 1) {
      return 'ERROR: Invalid arguments for "popR" command';
   }

   if (entries[0].toString().includes('.')) {
      return 'ERROR: count should be a positive integer value';
   }

   const count = Number(entries[0]);

   if (isNaN(count)) {
      return 'ERROR: Invalid arguments for "popR" command';
   }

   if (count <= 0) {
      return 'ERROR: count should be a positive integer for "popR" command';
   }

   return store.popR(key, count);
}

export function slice_command(
   store: Store,
   key: string,
   entries: Buffer[],
): Buffer[] | string | null {
   if (entries.length <= 1 || entries.length > 2) {
      return 'ERROR: Invalid arguments for "slice" command';
   }

   let indexes = [];

   for (const entry of entries) {
      const idx = Number(entry.toString());
      if (isNaN(idx)) {
         return 'ERROR: Invalid arguments for "slice" command';
      }
      indexes.push(idx);
   }

   return store.slice(key, indexes[0], indexes[1]);
}

export function del_command(
   store: Store,
   key: string,
   entries: Buffer[],
): number | string {
   const keys: string[] = [key];

   for (const entry of entries) {
      keys.push(entry.toString());
   }

   return store.del(keys);
}
