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
                        .setDescription('or see someone else\'s?')
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
                .addUserOption(option => 
                    option
                        .setName('other')
                        .setDescription('or roll for someone else? (y u waste ur gacha like that)')
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('inventory')
                .setDescription('View your inventory!')
                .addUserOption(option => 
                    option
                        .setName('other')
                        .setDescription('or see someone else\'s?')
                )
        ).addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Creates a new character (bound to your discord account)')
        ).addSubcommand(subcommand =>
            subcommand
                .setName('itemlist')
                .setDescription('Lists all items currently available.')
        ),
	async execute(interaction, characters) {
        try {
            if (interaction.options.getSubcommand() === 'create') {
                if (characters.get(interaction.user)) {
                    await interaction.reply('You already have a character!');
                } else {
                    if (characters.create(interaction.user.id)) {
                        await interaction.reply('Character created successfully!');
                    } else {
                        await interaction.reply('Character creation failed for some reason!');
                    }
                }
                return;
            }
            const target = interaction.options.getUser('other') ?? interaction.user;
            const user = characters.get(target.id);
            if (!characters.get(target.id)) {
                await interaction.reply(`${target.tag} doesn't have a character! Use \`/rpg create\` to make one!`);
                return;
            }
            switch(interaction.options.getSubcommand()) {
                case 'profile':
                    // get and display Character
                    const replyString = await user.getStats();
                    await interaction.reply(`${target.tag}'s Character:\n${replyString}`);
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
                    // view a Character's inventory
                    const userInv =  await user.getItems();
                    if (!userInv.length) return interaction.reply(`${target.tag} has nothing!`);
                    await interaction.reply(`${target.tag} currently has ${userInv.map(i => `${i.amount} ${i.item.name}`).join(', ')}`);
                    break;
            }
        } catch (error) { 
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
	},
};