const { SlashCommandBuilder } = require('@discordjs/builders');
const oneMinute = 1000 * 60;
const oneDay = oneMinute * 60 * 24;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('Reminds you of...something... in the given time (default 24 hours)')
        .addStringOption(option =>
            option
                .setName('string')
                .setDescription('Whatever you want to be reminded of')
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option
                .setName('minutes')
                .setDescription('Number of minutes')
                .setRequired(false)
        )
        .addIntegerOption(option => 
            option
                .setName('hours')
                .setDescription('Number of hours')
                .setRequired(false)
        )
        .addIntegerOption(option => 
            option
                .setName('days')
                .setDescription('Number of days')
                .setRequired(false)
        ),
    async execute(interaction, Reminders,) {
        let totalTime = 0;
        const minutes = interaction.options.getInteger('minutes');
        const hours = interaction.options.getInteger('hours');
        const days = interaction.options.getInteger('days');
        if (minutes) totalTime += oneMinute * minutes;
        if (hours) totalTime += oneMinute * 60 * hours
        if (days) totalTime += oneMinute * 60 * 24 * days
        if (totalTime === 0) totalTime = oneDay;

        const r = await Reminders.create({
            user_id: interaction.user.id,
            channel: interaction.channel.id,
            reminder: interaction.options.getString('string'),
            timeout: new Date().getTime() + totalTime,
        }).then((r) => {
            return r;
        }).catch((error) => console.error(error));

        setTimeout(async (user, channel, response, r) => {
            channel.send(`${user}, ${response}`);
            await r.destroy();
        }, totalTime, interaction.user, interaction.channel, interaction.options.getString('string'), r);

        return interaction.reply(`Reminder set!`);
    },
};