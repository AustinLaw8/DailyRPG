const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('item')
		.setDescription('Accesses items database')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Adds an item!')
                .addStringOption(option => 
                    option
                        .setName('name')
                        .setDescription('name of the item being added')
                        .setRequired(true)
                )
                .addStringOption(option => 
                    option
                        .setName('rarity')
                        .setDescription('rarity of item being added')
                        .setRequired(true)
                )
                .addStringOption(option => 
                    option
                        .setName('effect')
                        .setDescription('effect of item being added')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Removes an item.')
                .addStringOption(option => 
                    option
                        .setName('name')
                        .setDescription('name of the item being removed')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('give')
                .setDescription('Give an item by name')
                .addStringOption(option => 
                    option
                        .setName('name')
                        .setDescription('name of the item being given')
                        .setRequired(true)
                )
                .addUserOption(option => 
                    option
                        .setName('target')
                        .setDescription('receipient of item')
                )
        ),
};