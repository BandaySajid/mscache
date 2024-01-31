import schedule from 'node-schedule';

export default function cron(date: Date, callback: schedule.JobCallback){
	schedule.scheduleJob(date, callback);
};
