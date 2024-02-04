import {
   hset_command,
   hget_command,
   hdel_command,
   set_command,
   get_command,
   del_command,
   append_command,
   prepend_command,
   popR_command,
   popL_command,
   slice_command,
} from '../src/commando.js';

import Store from '../src/store.js';
import assert from 'assert';
import sinon from 'sinon';

function buffered(values: string[]) {
   return values.map((v) => Buffer.from(v));
}

describe('testing core functionality / commmands test', () => {
   const store = new Store();

   it('set command should add this string to the store and return "OK"', () => {
      assert.equal(
         set_command(store, 'username', [Buffer.from('something')]),
         'OK',
      );
   });

   it('get command should respond with previously set value of the key', () => {
      assert.equal(get_command(store, 'username', []), 'something');
   });

   it('del command should respond with the number of fields deleted', () => {
      assert.equal(del_command(store, '', [Buffer.from('username')]), 1);
   });

   it('hset command should add the key value pair to the store and return OK', () => {
      assert.equal(
         hset_command(store, 'msUser', buffered(['name', 'name_is_ms'])),
         'OK',
      );
   });

   it('hget command should return the value associated with the key in hash', () => {
      assert.equal(
         hget_command(store, 'msUser', buffered(['name'])),
         'name_is_ms',
      );
   });

   it('hdel command should delete the key-value associated with the key in hash and return the delete count', () => {
      assert.equal(hdel_command(store, 'msUser', buffered(['name'])), 1);
   });

   it('append command should add elements to the end of the list and respond with the number of elements added', () => {
      assert.equal(
         append_command(
            store,
            'msList',
            buffered(['name_is_ms1', 'name_is_ms2']),
         ),
         2,
      );
   });

   it('prepend command should add elements to the start of the list and respond with the number of elements added', () => {
      assert.equal(
         prepend_command(
            store,
            'msList',
            buffered(['name_is_ms1_end', 'name_is_ms2_end']),
         ),
         2,
      );
   });

   it('slice command should return a new list of elements the from the start_index to end_idx', () => {
      assert.deepEqual(
         slice_command(store, 'msList', buffered(['0', '3'])),
         buffered([
            'name_is_ms2_end',
            'name_is_ms1_end',
            'name_is_ms1',
            'name_is_ms2',
         ]),
      );
   });

   it('popR command should remove elements from the end of the list and respond with the value of elements removed', () => {
      assert.deepEqual(
         popR_command(store, 'msList', buffered(['2'])),
         buffered(['name_is_ms2', 'name_is_ms1']),
      );
   });

   it('popL command should remove elements from the start of the list and respond with the value of elements removed', () => {
      assert.deepEqual(
         popL_command(store, 'msList', buffered(['2'])),
         buffered(['name_is_ms2_end', 'name_is_ms1_end']),
      );
   });

   it('should expire the provided key and return null', () => {
      const key = 'new_list';
      append_command(store, key, buffered(['one', 'two']));

      const clock = sinon.useFakeTimers(new Date());

      store.expire(key, 10);

      // Fast-forwarding the virtual timers by 10 seconds
      clock.tick(10 * 1000);

      assert.deepEqual(slice_command(store, key, buffered(['0', '-1'])), null);
   });
});
