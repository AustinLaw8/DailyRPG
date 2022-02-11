const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const errorMsg = 'Problems? Message @Eagle [Austin] with the command you ran!';

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
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('unequip')
                .setDescription('Unequips an item from a specific slot')
                .addStringOption(option =>
                    option
                        .setName('slot')
                        .setDescription('The slot of the item you want to unequip.')
                        .setRequired(true)
                        .addChoice('weapon', 'weapon')
                        .addChoice('hat', 'hat')
                        .addChoice('armor', 'armor')
                )
        ),
    async execute(interaction, characters, itemsByName) {
        try {
            if (interaction.options.getSubcommand() === 'list') {
                return interaction.reply('NotImplementedError :3');
            }

            const user = characters.get(interaction.user.id);
            if (!user) { return interaction.reply(`You don't have a character! Use \`/rpg create\` to make one!`); }
            const userInv = await user.getItems();

            switch (interaction.options.getSubcommand()) {
                case 'equip':
                    const item = userInv.get(interaction.options.getString('item'))
                    if (!item)
                        return interaction.reply(`${interaction.options.getString('item')} not found (either spelled wrong, or not in your inventory!)`)
                    if (await user.equip(item))
                        return interaction.reply(`${interaction.options.getString('item')} successfully equipped!`);
                    return interaction.reply(`Unable to equip item for some reason!`);
                case 'unequip':
                    let removed = ''
                    switch (interaction.options.getString('slot')) {
                        case 'weapon':
                            removed = user.weapon;
                            user.weapon = 'Fists';
                            break;
                        case 'hat':
                            removed = user.hat;
                            user.hat = 'No hat';
                            break;
                        case 'armor':
                            removed = user.armor;
                            user.armor = 'T-Shirt';
                            break;
                    }
                    await user.save();
                    return interaction.reply(`Unequipped ${removed}!`);
                case 'inventory':
                    if (!userInv.length) { return interaction.reply(`You have nothing in your inventory!`); }
                    const invEmbed = new MessageEmbed()
                        .setTitle(`${interaction.user.tag}'s Inventory:`)
                        .setColor(await interaction.user.fetch().then((u) => { return u.accentColor; }))
                        .setTimestamp()
                        .setFooter({ text: errorMsg });
                    userInv.map(i => {
                        invEmbed.addField(`${i.item.name}`, `x${i.amount}`, true);
                    });
                    return interaction.reply({
                        embeds: [invEmbed]
                    });
            }
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};
