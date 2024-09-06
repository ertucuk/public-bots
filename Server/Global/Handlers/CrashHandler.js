const { green, cyan, red } = require('chalk'), moment = require('moment');

module.exports = async () => {

    process.on('warning', (warning) => {
        if (warning.name === 'ExperimentalWarning' && warning.message.includes('buffer.File')) {
        }
    });

    process.on('unhandledRejection', async (reason, promise) => {
        console.log(`[${red('ANTICRASH - START')}]: ${cyan(`――――――――――――――――――――――――――――――――――――――――――――――――――――――――`)}`);
        console.log(`${cyan(`Unhandled Rejection at: ${promise}\n\nReason: ${reason}`)}`);
        console.log(`[${red('ANTICRASH - END')}]: ${cyan(`――――――――――――――――――――――――――――――――――――――――――――――――――――――――`)}`);
    });

    process.on('uncaughtException', async (err, origin) => {
        console.log(`[${red('ANTICRASH - START')}]: ${cyan(`――――――――――――――――――――――――――――――――――――――――――――――――――――――――`)}`);
        console.log(`${cyan(`Uncaught exception: ${err}\n\Exception origin: ${origin}`)}`);
        console.log(`[${red('ANTICRASH - END')}]: ${cyan(`――――――――――――――――――――――――――――――――――――――――――――――――――――――――`)}`);
    });

    process.on('uncaughtExceptionMonitor', async (err, origin) => {
        console.log(`[${red('ANTICRASH - START')}]: ${cyan(`――――――――――――――――――――――――――――――――――――――――――――――――――――――――`)}`);
        console.log(`${cyan(`Uncaught exception monitor: ${err}\n\Exception origin: ${origin}`)}`);
        console.log(`[${red('ANTICRASH - END')}]: ${cyan(`――――――――――――――――――――――――――――――――――――――――――――――――――――――――`)}`);
    });
};