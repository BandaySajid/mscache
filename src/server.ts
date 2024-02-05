import tcp from 'node:net';
import Store from './store.js';
import { COMMANDS } from './commando.js';

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

      const cmds_to_check = ['get', 'del', 'hgetall'];

      if (
         !(cmds_to_check.includes(command.name)) && entries.length < 1 ||
         entries[0]?.length < 1
      ) {
         return `ERROR: Invalid arguments for command ${operation}`;
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

			// arrays will be converted to strings - 'element1,element2';
			// fix it, if it causes performance problems
         socket.write(Buffer.isBuffer(result) ? result : result.toString());
      });
   });

   server.on('error', (err) => {
      console.error(
         '[SERVER-ERROR]: An error has occured with MSCACHE server:',
         err,
      );
   });

   server.listen(port, () => {
      console.log('MSCACHE: Server running on:', server.address());
   });
}

export default init_server;
