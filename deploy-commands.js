const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const adminCommands = [];
const adminCommandFiles = fs.readdirSync('./admin').filter(file => file.endsWith('.js'));

for (const adminFile of adminCommandFiles) {
	const adminCommand = require(`./admin/${adminFile}`);
	adminCommands.push(adminCommand.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(process.env.token);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');
        const all = commands.concat(adminCommands);
		await rest.put(
			Routes.applicationGuildCommands(process.env.clientId, process.env.testGuildId),
			{ body: all },
		);
        //TODO: make commands work globably
		// await rest.put(
		// 	Routes.applicationGuildCommands(process.env.clientId, process.env.testGuildId),
		// 	{ body: adminCommands },
		// );
		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();