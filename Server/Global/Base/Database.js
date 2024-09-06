const mongoose = require('mongoose');

module.exports = {
    start: (client) => {
       
        mongoose.connect(client.system.database).then(() => {
            client.logger.success('Mongoose connected');
        }).catch((err) => { client.logger.error(`Mongoose has encountered an error: \n ${err.stack}`); });
        
        mongoose.Promise = global.Promise;

        mongoose.connection.on('err', (err) => {
            client.logger.error(`Mongoose has encountered an error: \n ${err.stack}`);
        });

        mongoose.connection.on('disconnected', () => {
            client.logger.error('Mongoose disconnected');
        });
    },

    async ping() {
        const currentNano = process.hrtime();
        await mongoose.connection.db.command({ ping: 1 });
        const time = process.hrtime(currentNano);
        return (time[0] * 1e9 + time[1]) * 1e-6;
    },
};