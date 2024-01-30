import tcp from 'node:net';
import Store from './store';
import { HashData } from './types.js';

type Command = {
   name: string;
   type: 'STRING' | 'HASH' | 'LIST' | 'GLOBAL';
   run(store: Store, key: string, entries: Buffer[]): Buffer | string | number;
};

const COMMANDS: Command[] = [
   { name: 'hset', run: hset_command, type: 'HASH' } as Command,
   { name: 'hget', run: hget_command, type: 'HASH' } as Command,
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

function hset_command(
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

function hget_command(
   store: Store,
   key: string,
   entries: Buffer[],
): Buffer | null | string {
   if (entries.length > 1) {
      return 'ERROR: Invalid args for "hset" command';
   }

   return store.hget(key, entries[0].toString());
}

function hdel_command(
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

function set_command(store: Store, key: string, entries: Buffer[]): string {
   if (entries.length > 1 || entries.length <= 0) {
      return 'ERROR: Syntax error.';
   }
   store.set(key, entries[0]);

   return 'OK';
}

function get_command(
   store: Store,
   key: string,
   entries: Buffer[],
): Buffer | null | string {
   if (entries.length > 0) {
      return 'ERROR: Invalid arguments for "get" command';
   }

   return store.get(key);
}

function append_command(
   store: Store,
   key: string,
   entries: Buffer[],
): number | string {
   if (entries.length <= 0) {
      return 'ERROR: Invalid arguments for "append" command';
   }

   return store.append(key, entries);
}

function prepend_command(
   store: Store,
   key: string,
   entries: Buffer[],
): number | string {
   if (entries.length <= 0) {
      return 'ERROR: Invalid arguments for "prepend" command';
   }

   return store.prepend(key, entries);
}

function popL_command(
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

   return store.popL(key, count);
}

function popR_command(
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

   return store.popR(key, count);
}

function slice_command(
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

function del_command(
   store: Store,
   _: string,
   entries: Buffer[],
): number | string {
   if (entries.length <= 0) {
      return 'ERROR: Invalid arguments for "del" command';
   }

   const keys: string[] = [];

   for (const entry of entries) {
      keys.push(entry.toString());
   }
   return store.del(keys);
}

function handle_message(
   message: Buffer,
   store: Store,
): Buffer | string | number {
   try {
      const spllitted_buffer: Buffer[] = [];

      let curr_idx = 0;
      let start_idx = 0;

      for (const byte of message) {
         if (byte === 32 || byte === 10) {
            spllitted_buffer.push(message.subarray(start_idx, curr_idx));
            start_idx = curr_idx + 1;
         }
         curr_idx++;
      }

      const operation = spllitted_buffer[0]?.toString();

      if (!operation) {
         return `ERROR: Invalid Command ${message}`;
      }

      const command = COMMANDS.find((c) => c.name === operation.toLowerCase());

      if (!command) {
         return `ERROR: Invalid Command ${operation}`;
      }

      const key = spllitted_buffer[1].toString();

      if (!key) {
         return `ERROR: Invalid arguments for command ${operation}`;
      }

      let entries: Buffer[] = spllitted_buffer.slice(2);

      let ex;

      const if_expire_entry = entries[entries.length - 2];

      if (if_expire_entry?.length === 2) {
         //running this statement below so that we dont allocate new space for a large buffer, this will only run if the buffer length is 2.
         if (entries[entries.length - 2].toString() === 'ex') {
            ex = Number(entries[entries.length - 1]);
            entries.pop();
         }

         if (ex && (isNaN(ex) || ex <= 0)) {
            return 'ERROR: Expiry for the key should be provided in seconds (min:1)';
         }

         entries.pop();
      }

      let result = command.run(store, key, entries);

      if (!result) {
         return result;
      }

      if (ex) {
         store.expire(key, ex);
      }

      return result;
   } catch (err) {
      console.log('cannot handle message', err);
      return `ERROR: Internal server error!`;
   }
}

function init_server(port: number, store: Store) {
   const server = tcp.createServer();

   server.on('connection', (socket) => {
      console.log('[CONNECTION]: client connected from:', socket.remoteAddress);

      socket.on('data', (message) => {
         const result = handle_message(message, store);
         if (!result) {
            return socket.write('null');
         }
         socket.write(Buffer.isBuffer(result) ? result : result.toString());
      });
   });

   server.listen(port, () => {
      console.log('MSCACHE: Server running on:', server.address());
   });
}

export default init_server;
