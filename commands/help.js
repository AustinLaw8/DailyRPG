const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const errorMsg = 'Problems? Message @Eagle [Austin] with the command you ran!';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('All commands and their descriptions!')
	    .addIntegerOption(option =>
            option
                .setName('page_number')
                .setDescription('Page number (1-2)')
                .addChoice('1', 1)
                .addChoice('2', 2)
    ),
    async execute(interaction) {
        const page = interaction.options.getInteger('page_number') ?? 1;
        const helpPage1 = new MessageEmbed()
            .setTitle(`DailyRPG Help Page 1`)
            .setURL('https://github.com/AustinLaw8/DailyRPG')
            .setColor(await interaction.user.fetch().then((u) => { return u.accentColor; }))
            .addField('General Setup', 'To get started, run the command /rpg create; then, you can start adding tasks with /task add and /daily add!')
            .addField('-------------------------------------------------', 'Tasks')
            .addField('/task list', 'Lists your current tasks')
            .addField('/task add <task> <optional: minutes> <optional: hours> <optional: days>', 'Adds a task, with a given time limit (default 24 hours)')
            .addField('/task complete <task>', 'Complete a task, and get one gold in compensation')
            .addField('/task remove <task>', 'Remove a task you don\'t plan on doing.')
            .addField('-------------------------------------------------', 'Dailies')
            .addField('/daily list', 'Look at all your dailies')
            .addField('/daily add <daily>', 'Add a new daily')
            .addField('/daily complete <daily>', 'Complete a daily')
            .addField('/daily remove <daily>', 'Remove a daily')
            .setFooter({ text: errorMsg });
        const helpPage2 = new MessageEmbed()
            .setTitle(`DailyRPG Help Page 2`)
            .setURL('https://github.com/AustinLaw8/DailyRPG')
            .setColor(await interaction.user.fetch().then((u) => { return u.accentColor; }))
            .addField('-------------------------------------------------', 'RPG')
            .addField('/rpg create', 'Create a new character and profile. This has to be done before any other commands (if you want them to work).')
            .addField('/rpg profile <optional: other>', 'view your character profile')
            .addField('/rpg roll <optional: multi> <optional: other>', 'Roll the gacha! (or roll it 10x)')
            .addField('/rpg fight', 'Take on the next stage!')
            .addField('/item list', 'Lists all currently released items')
            .addField('/item inventory', 'Lists all of the items in your inventory')
            .addField('/item equip', 'Equips a specific item')
            .addField('/item unequip <required: slot>', 'Unequips an item from a specific slot')
            .addField('-------------------------------------------------', 'Misc Commands')
            .addField('/help', 'Brings up this help list')
            .addField('/choose <options>', 'Chooses one of various given options')
            .addField('/ping', 'Pong!')
            .setFooter({ text: errorMsg });

        switch (page) {
            case 1:
                return interaction.reply({
                    embeds: [helpPage1],
                });
            case 2:
            default:
                return interaction.reply({
                    embeds: [helpPage2],
                });
        }
    },
};