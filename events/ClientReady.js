const {Events} = require('discord.js')


module.exports = {
	name: Events.ClientReady,
	async execute() {
        console.log("Online");
    }
};