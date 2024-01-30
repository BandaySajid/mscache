import schedule from 'node-schedule';

export default function job(date: Date, callback: Function){
	schedule.scheduleJob(date, callback);
};
