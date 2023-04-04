const {Events} = require('discord.js');


module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		const client = interaction.client;
		
        if (!interaction.isCommand()) return;
        
        const command = client.commands.get(interaction.commandName);
    
        if (!command) {
            console.log("Not a command.")
            return;
        }
    
        try {
            await command.execute(interaction);
        } catch (error) {
            console.log(error);
            await interaction.reply({content:`${error.message}`, ephemeral: true});
        }
        
        
	},
};