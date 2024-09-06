(async () => {
    const { VanteClient } = require('../../Global/Base/Supervisor');
    const { Main, Monitor } = require('../../Global/Settings/System');
    
    const client = global.client = new VanteClient({   
        Token: Main.Moderation,
        Prefix: Main.Prefix,
        Webhooks: Monitor,
        
        Debugger: false,
        Commands: true,
        Contexts: true,
    });

    await client.spawn();
})();