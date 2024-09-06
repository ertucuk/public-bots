const Settings = require('./Server/Global/Settings/System');

let bots = [];

if (Settings.Welcome.Tokens.length > 0)
    bots.push({
        name: Settings.serverName + '-Welcomes',
        namespace: 'ertu',
        script: 'Start.js',
        watch: false,
        exec_mode: 'cluster',
        max_memory_restart: '2G',
        cwd: './Server/Welcomes/',
        args: ['--color', '--watch'],
    });

if (Settings.Main.Moderation)
    bots.push({
        name: Settings.serverName + '-Moderation',
        namespace: 'ertu',
        script: 'Shards.js',
        watch: true,
        exec_mode: 'cluster',
        max_memory_restart: '2G',
        cwd: './Server/Mainframe/Moderation',
        args: ['--color', '--watch'],
    });

if (Settings.Main.Statistics)
    bots.push({
        name: Settings.serverName + '-Statistics',
        namespace: 'ertu',
        script: 'Shards.js',
        watch: false,
        exec_mode: 'cluster',
        max_memory_restart: '2G',
        cwd: './Server/Mainframe/Statistics',
        args: ['--color', '--watch'],
    });

if (Settings.Main.Controller)
    bots.push({
        name: Settings.serverName + '-Controller',
        namespace: 'ertu',
        script: 'Shards.js',
        watch: false,
        exec_mode: 'cluster',
        max_memory_restart: '2G',
        cwd: './Server/Mainframe/Controller',
        args: ['--color', '--watch'],
});



module.exports = { apps: bots };