const { Client, GatewayIntentBits, Collection, REST, Routes} = require('discord.js');
const fs = require('fs');
const path = require('path');

const guildId = "";
const clientId = "";
const token = '';

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

    const rest = new REST({ version: '10' }).setToken(token);

    rest.put(Routes.applicationGuildCommands(clientId,guildId), { body: commands })
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

client.login(token);
