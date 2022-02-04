const { SlashCommandBuilder, channelMention } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('Reminds of... something')
        .addStringOption(option =>
            option
                .setName('string')
                .setDescription('Whatever you want to be reminded of')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('time')
                .setDescription('Format: X X X representing Minutes Hours Days; larger time frames can be dropped if not needed.')
                .setRequired(true)
        ),
    async execute(interaction, Reminders, client) {
        const times = interaction.options.getString('time').split(' ')
        for (let i = 0; i < times.length; i++) {
            times[i] = parseInt(times[i]);
            if (isNaN(times[i]))
                return interaction.reply(`Sorry, time format wasn't recognized.`)
        }
        let totalTime = 0;
        totalTime = 1000 * 60 * times[0];
        if (times.length >= 2) {
            totalTime += 1000 * 60 * 60 * times[1];
            if (times.length >= 3) {
                totalTime += 1000 * 60 * 60 * 24 * times[2];
            }
        }
        console.log(times);
        console.log(totalTime);
        const r = await Reminders.upsert({
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