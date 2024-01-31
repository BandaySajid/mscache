import Store from "./store.js";
import init_server from "./server.js";

function main() {
   const store = new Store();
	init_server(9898, store);

	const global_errors = ['uncaughtException', 'unhandledRejection'];

	for(const error of global_errors){
		process.on(error, (err)=>{
			console.error('[CRITICAL]:', err);
		});
	}
}

main();
