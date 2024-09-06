(async () => {
    const { VanteClient } = require('../../Global/Base/Supervisor');
    const { Main, Monitor } = require('../../Global/Settings/System');
    
    const client = global.client = new VanteClient({   
        Token: Main.Statistics,
        Prefix: Main.Prefix,
        Webhooks: Monitor,
        
        Debugger: false,
        Commands: false,
        Contexts: false,
    });

    await client.spawn();
})();