const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('item')
        .setDescription('Access your items!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('inventory')
                .setDescription('Views your inventory.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Lists all items')
        )
        .addSubcommand(subcommand => 
            subcommand
                .setName('equip')
                .setDescription('Equips an item.')
                .addStringOption(option =>
                    option
                        .setName('item')
                        .setDescription('The name of the item you want to equip')
                        .setRequired(true)
                )
        ),
    async execute(interaction, characters) {
        try {
            switch (interaction.options.getSubcommand()) {
                case 'list':
                case 'equip':
                    return interaction.reply('NotImplementedError :3');
                case 'inventory':
                    const user = characters.get(interaction.user.id);
                    if (!user) { return interaction.reply(`You don't have a character! Use \`/rpg create\` to make one!`); }
                    const userInv = await user.getItems();
                    if (!userInv.length) { return interaction.reply(`You have nothing in your inventory!`); }
                    return interaction.reply(`You currently has ${userInv.map(i => `${i.amount} ${i.item.name}`).join(', ')}`);
            }
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};
