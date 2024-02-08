import { HashData, Storer, StoreData, List, Hash } from './types.js';
import cron from './utils/cron.js';

type ListNode<T> = {
   next?: ListNode<T>;
   prev?: ListNode<T>;
   value: T;
};

class msList<T> implements List<T> {
   length: number;
   private head: ListNode<T> | undefined;
   private tail: ListNode<T> | undefined;

   //would be a doubly linked list
   constructor() {
      this.length = 0;
      this.head = this.tail = undefined;
   }

   //adding element to the start
   prepend(item: T): void {
      const node: ListNode<T> = {
         value: item,
      };

      this.length++;

      if (!this.head) {
         this.head = this.tail = node;
         return;
      }

      node.next = this.head;
      this.head.prev = node;
      this.head = node;
   }

   //adding element to the end
   append(item: T): void {
      const node: ListNode<T> = {
         value: item,
      };

      this.length++;

      if (!this.tail) {
         this.tail = this.head = node;
         return;
      }

      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
   }

   //removing element from end.
   popR(): T | undefined {
      if (!this.tail) {
         return undefined;
      }

      this.length--;

      if (this.length === 0) {
         const value = this.tail.value;
         this.head = this.tail = undefined;
         return value;
      }

      const tail = this.tail;
      const prev = this.tail?.prev;

      if (prev) {
         prev.next = undefined;
      }
      this.tail = prev;
      return tail?.value;
   }

   //removing element from front.
   popL(): T | undefined {
      if (!this.head) {
         return undefined;
      }

      this.length--;

      if (this.length === 0) {
         const value = this.head.value;
         this.head = this.tail = undefined;
         return value;
      }

      const head = this.head;
      const next = this.head?.next;

      if (next) {
         next.prev = undefined;
      }

      this.head = next;
      return head?.value;
   }

   slice(start_idx: number, end_idx: number): T[] | undefined {
      if (this.length <= 0) {
         return undefined;
      }

      const result = [];
      let curr = this.head;

      if (start_idx > this.length) {
         return undefined;
      }

      if (end_idx === -1) {
         end_idx = this.length;
      }

      for (let i = start_idx; i <= end_idx && curr; i++) {
         result.push(curr.value);
         curr = curr.next;
      }

      return result;
   }
}

class msHash implements Hash {
   #store: Map<string, Buffer>;

   constructor() {
      this.#store = new Map();
   }

   hset(key: string, value: Buffer) {
      this.#store.set(key, value);
   }

   hget(key: string): Buffer | null {
      const value = this.#store.get(key);

      if (!value) {
         return null;
      }

      return value;
   }

   hgetAll() {
      let entries: (string | Buffer)[] = [];
      this.#store.forEach((value: Buffer, key: string) => {
         entries.push(key);
         entries.push(value);
      });

      return entries;
   }

   hdel(key: string): number {
      const deleted = this.#store.delete(key);

      if (!deleted) {
         return 0;
      }

      return 1;
   }
}

class Store implements Storer {
   #store: StoreData;

   constructor() {
      this.#store = new Map();
   }

   hset(key: string, entries: HashData[]): void {
      let hash = this.#store.get(key) as msHash;

      if (!hash) {
         hash = new msHash();
         this.#store.set(key, hash);
      }

      for (const entry of entries) {
         hash.hset(entry.key, entry.value);
      }
   }

   hget(key: string, hkey: string): Buffer | null {
      const hash = this.#store.get(key) as msHash;

      if (!hash) {
         return null;
      }

      const value = hash.hget(hkey);
      return value ? value : null;
   }

   hgetAll(key: string): (string | Buffer)[] | null {
      const hash = this.#store.get(key) as msHash;

      if (!hash) {
         return null;
      }

      return hash.hgetAll();
   }

   hdel(key: string, hkeys: string[]): number {
      const hash = this.#store.get(key) as msHash;

      if (!hash) {
         return 0;
      }

      let del_count = 0;

      for (const hkey of hkeys) {
         del_count += hash.hdel(hkey);
      }

      return del_count;
   }

   //STRING
   set(key: string, value: Buffer) {
      this.#store.set(key, value);
   }

   get(key: string): Buffer | null {
      const value = this.#store.get(key) as Buffer;
      return value ? value : null;
   }

   //LIST
   append(key: string, elements: Buffer[]): number {
      let list = this.#store.get(key) as msList<Buffer>;

      if (!list) {
         list = new msList();
         this.#store.set(key, list);
      }

      let add_count = 0;

      for (const value of elements) {
         list.append(value);
         add_count += 1;
      }

      return add_count;
   }

   prepend(key: string, elements: Buffer[]): number {
      let list = this.#store.get(key) as msList<Buffer>;

      if (!list) {
         list = new msList();
         this.#store.set(key, list);
      }

      let add_count = 0;

      for (const value of elements) {
         list.prepend(value);
         add_count++;
      }

      return add_count;
   }

   popL(key: string, count: number): Buffer[] | null {
      let list = this.#store.get(key) as msList<Buffer>;

      if (!list) {
         return null;
      }

      if (count > list.length) {
         count = list.length;
      }

      if (count <= 0) {
         return null;
      }

      const buffers: Buffer[] = [];

      for (let i = 0; i < count; i++) {
         const rem_val = list.popL();
         if (rem_val) {
            buffers.push(rem_val);
         }
      }

      return buffers.length > 0 ? buffers : null;
   }

   popR(key: string, count: number): Buffer[] | null {
      let list = this.#store.get(key) as msList<Buffer>;

      if (!list) {
         return null;
      }

      if (count > list.length) {
         count = list.length;
      }

      if (count <= 0) {
         return null;
      }

      const buffers: Buffer[] = [];

      for (let i = 0; i < count; i++) {
         const rem_val = list.popR();
         if (rem_val) {
            buffers.push(rem_val);
         }
      }

      return buffers.length > 0 ? buffers : null;
   }

   slice(key: string, start_idx: number, end_idx: number): Buffer[] | null {
      let list = this.#store.get(key) as msList<Buffer>;

      if (!list) {
         return null;
      }

      const result = list.slice(start_idx, end_idx);

      return result ? result : null;
   }

   //GLOBAL
   del(keys: string[]): number {
      let del_count = 0;
      for (const key of keys) {
         const deleted = this.#store.delete(key);
         deleted && del_count++;
      }

      return del_count;
   }

   /*expire(key: string, seconds: number) {
      const date = new Date(Date.now() + seconds * 1000);
      cron(date, () => {
         this.#store.delete(key);
      });
   }*/
}

export default Store;
