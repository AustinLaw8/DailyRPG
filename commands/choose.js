const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('choose')
        .setDescription('Chooses one of various given options')
        .addStringOption(option =>
            option.setName('choices')
                .setDescription('Options to choose from, separated by a space.')
                .setRequired(true)
        ),
    async execute(interaction) {
        const choices = interaction.options.getString('choices').split(' ');
        const i = Math.floor(Math.random() * choices.length);
        await interaction.reply(`Chose \`${choices[i]}\` from \`${choices}\``);
    },
};