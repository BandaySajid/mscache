import Store from "./store.js";
import init_server from "./server.js";
import { StoreData } from "./types.js";

function main() {
   let storage: StoreData = new Map();
   const store = new Store(storage);
	init_server(9898, store);
}

main();
