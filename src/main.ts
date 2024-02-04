import Store from "./store.js";
import init_server from "./server.js";

function main(){
	const store = new Store();
	init_server(9898, store);
}
main();
