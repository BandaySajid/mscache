import http from 'node:http';
import Store from './store.js';
import { COMMANDS } from './commando.js';

function handle_message(
   cmd: string,
   key: string,
   buffer: Buffer,
   store: Store,
): Buffer | string | number {
   try {
      if (key === '') {
         return `ERROR: Invalid arguments`;
      }

      const command = COMMANDS.find((c) => c.name === cmd.toLowerCase());

      if (!command) return `ERROR: Invalid Command`;

      let entries: Buffer[] = [];

      let curr_idx = 0;
      let start_idx = 0;

      if (buffer) {
         for (const byte of buffer) {
            if (byte === 32 || byte === 10) {
               entries.push(buffer.subarray(start_idx, curr_idx));
               start_idx = curr_idx + 1;
            }
            curr_idx++;
         }
      }

      if (entries.length <= 0) {
         if (buffer) entries.push(buffer);
      }

      return command.run(store, key, entries);
   } catch (err) {
      console.log('cannot handle message', err);
      return `ERROR: Internal server error!`;
   }
}

function init_server(port: number, store: Store) {
   const server = http.createServer();

   server.on('connection', (socket) => {
      console.log('[CONNECTION]: client connected from:', socket.remoteAddress);
   });

   server.on(
      'request',
      (req: http.IncomingMessage, res: http.OutgoingMessage) => {
         if (req.method !== 'POST') {
            return res.end('ERROR: method not supported!');
         }
         let buffer: Buffer;
         req.on('data', (message) => {
            if (!buffer) {
               buffer = message;
            } else {
               buffer.write(message);
            }
         });

         req.on('end', () => {
            const url = new URL(`http://localhost:9898${req.url}`);

            let key = '';

            for (const [name, value] of url.searchParams) {
               if (name === 'key') {
                  key = value;
               }
            }

            const cmd = url.pathname.split('/')[1];

            const result = handle_message(cmd, key, buffer, store);

            if (!result) {
               return res.end('null');
            }

            // arrays will be converted to strings - 'element1,element2';
            // fix it, if it causes performance problems
            res.end(Buffer.isBuffer(result) ? result : result.toString());
         });
      },
   );

   server.on('error', (err) => {
      console.error(
         '[SERVER-ERROR]: An error has occured with MSCACHE server:',
         err,
      );
   });

   server.listen(port, () => { console.log('MSCACHE: Server running on:', server.address());
   });
}

export default init_server;
