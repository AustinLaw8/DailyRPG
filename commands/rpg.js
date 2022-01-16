const { SlashCommandBuilder } = require('@discordjs/builders');
const SQL = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rpg')
		.setDescription('The DailyRPG')
        .addSubcommand(subcommand =>
            subcommand
                .setName('profile')
                .setDescription('View your character profile!')
                .addUserOption(option => 
                    option
                        .setName('other')
                        .setDescription('or see someone elses?')
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('roll')
                .setDescription('Gacha time!!!')
                .addBooleanOption(option => 
                    option
                        .setName('multi')
                        .setDescription('x10 roll, with SSR guaranteed! (rate up is a lie) (jk)'))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('inventory')
                .setDescription('View your inventory!')
        ),
	async execute(interaction, characters) {
        try {
            switch(interaction.options.getSubcommand()) {
                case 'profile':
                    // get and display Character
                    const target = interaction.options.getUser('user') ?? interaction.user;
                    
                    const replyString = await characters.getStats(target.id);
                    if (replyString === "") {
                        await interaction.reply("You don't have a character yet! Use the command `/rpg create` to make one!");
                    } else {
                        await interaction.reply(`${target.tag}'s Character:\n${replyString}`);
                    }
                    break;
                case 'roll':
                    // get Character, check and subtract gold
                    if (interaction.options.getBoolean('multi')) {
                        await interaction.reply('multi')
                    } else {
                        await interaction.reply('single')
                    }
                    break;
                case 'inventory':
                    // view [users] inventory
                    const invTarget = characters.get(interaction.user.id);
                    if (!invTarget) {
                        await interaction.reply("You don't have a character yet! Use the command `/rpg create` to make one!");
                    } else {
                        const userInv =  await invTarget.getItems();
                        if (!userInv.length) return interaction.reply(`${invTarget.tag} has nothing!`);
                        await interaction.reply(`${interaction.user.tag} currently has ${userInv.map(i => `${i.amount} ${i.item.name}`).join(', ')}`);
                    }
            }
        } catch (error) { 
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
	},
};