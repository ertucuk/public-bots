module.exports = {
    serverID: '',
    serverName: '',
    ownerID: [''],
    voiceID: '',
    database: '',

    Presence: {
        Status: 'online',
        Type: 'PLAYING',
        Message: [
            'ertu was here ❤️',
        ]
    },

    Monitor: [
        { ID: 'System', Webhook: '', },
        { ID: 'Servers', Webhook: '', },
        { ID: 'Feedbacks', Webhook: '', },
        { ID: 'Bugs', Webhook: '', },
    ],

    Main: {
        Moderation: '',
        Statistics: '',
        Controller: '',

        Prefix: [
            '.',
            '!'
        ]
    },

    Welcome: {
        Tokens: [],
        Channels: [],
    },
};