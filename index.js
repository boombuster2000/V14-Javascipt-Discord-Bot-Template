const { Client, GatewayIntentBits, Collection, REST, Routes} = require('discord.js');
const fs = require('fs');
const path = require('path');


const getCommandFiles = (client,dir) => {
    const files = fs.readdirSync(dir, {withFileTypes:true,});
    const commandFiles = [];
    const suffix = ".js";
    
    for (const file of files) {
        if (file.isDirectory()) {
            commandFiles.push(... getCommandFiles(client, `${dir}/${file.name}`));
        } else if (file.name.endsWith(suffix)) {
            commandFiles.push(`${dir}/${file.name}`);
        }
    }
    
    console.log(commandFiles);
    return commandFiles;
}

const deploy_commands = (client,dir) => {
    const commandFiles = getCommandFiles(client,dir);
    const commands = [];

    for (const commandFile of commandFiles) {
        const command = require(commandFile);
        commands.push(command.data.toJSON());
        client.commands.set(command.data.name, command);
        console.log(`Added: ${command.data.name}`);
    }

    const rest = new REST({ version: '10' }).setToken(bot_token);

    rest.put(Routes.applicationGuildCommands(application_client_id,test_guild_id), { body: commands })
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error);
}

const deploy_events = (client) => {
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}

const load_config = () => {
    const config_path = "./config.json"
    const default_config = {
        "bot_token":"YOUR_BOT_TOKEN",
        "application_client_id":"YOUR_APPLICATION_CLIENT_ID",
        "test_guild_id":"YOUR_GUILD_ID"
    }

    if (!fs.existsSync(config_path)) {
        fs.writeFileSync(config_path, JSON.stringify(default_config, null, 4))
        console.log("Set up config!")
        return
    }

    const {bot_token, application_client_id, test_guild_id} = JSON.parse(fs.readFileSync(config_path))

    return {bot_token, application_client_id, test_guild_id}

}


const config_file = load_config()
if (config_file != null) {
    ({bot_token, application_client_id, test_guild_id} = config_file)

    const client = new Client({ 
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
          ],
    });
    
    client.commands = new Collection();
    
    
    deploy_commands(client, path.join(__dirname, 'commands'));
    deploy_events(client);
    
    client.login(bot_token);
}
