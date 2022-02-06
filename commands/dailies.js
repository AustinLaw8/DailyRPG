const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const oneDay = 1000 * 60 * 60 * 24;
const errorMsg = 'Problems? Message @Eagle [Austin] with the command you ran!';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Access your dailies!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a new daily')
                .addStringOption(option =>
                    option
                        .setName('daily')
                        .setDescription('The daily you want to add')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('complete')
                .setDescription('Complete a daily')
                .addStringOption(option =>
                    option
                        .setName('daily')
                        .setDescription('The daily you completed!')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Look at all your dailies')
        ).addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a daily')
                .addStringOption(option =>
                    option
                        .setName('daily')
                        .setDescription('The daily you want to remove')
                        .setRequired(true)
                )
        ),
    async execute(interaction, characters) {
        try {
            const user = characters.get(interaction.user.id);
            if (!user) { return interaction.reply('You don\'t have a character! Use `/rpg create` to make one!'); }
            const d = await user.getDailies();
            switch (interaction.options.getSubcommand()) {
                case 'add': 
                    const dailyToAdd = interaction.options.getString('daily');
                    if (await user.addDaily(dailyToAdd))
                        return interaction.reply(`Daily ${dailyToAdd} successfully added!`);
                    else
                        return interaction.reply("Failed to add daily for some reason...");
                case 'list': 
                    if (d.length > 0) {
                        const embedReply = new MessageEmbed()
                            .setTitle(`${interaction.user.tag}'s dailies:`)
                            .setColor(await interaction.user.fetch().then((u) => { return u.accentColor; }));
                        d.forEach((x) => {
                            embedReply.addField(`${x.done ? ':white_check_mark:' : ':white_large_square:'} ${x.daily_name}`, '\u200b');
                        });
                        embedReply.setTimestamp().setFooter({ text: errorMsg })
                        return interaction.reply({
                            embeds: [embedReply],
                        });
                    } else {
                        return interaction.reply('You don\'t have any dailies set!');
                    }
                case 'remove':
                    if (await user.removeDaily(interaction.options.getString('daily'))) {
                        return interaction.reply(`Daily ${interaction.options.getString('daily')} deleted!`);
                    } else {
                        return interaction.reply("Failed to remove daily for some reason... (name probably wasn't found)");
                    }
                case 'complete':
                    if (await user.completeDaily(interaction.options.getString('daily'))) {
                        user.gold += 1
                        let completed = 1;
                        let numDailies = 0;
                        d.forEach(element => { 
                            numDailies += 1
                            if (element.done) completed += 1; 
                        });
                        if (completed === numDailies && !user.didDailies) {
                            user.gold += 1;
                            user.streak += 1;
                            user.didDailies = true;
                            await user.save();
                            await interaction.reply(`Daily ${interaction.options.getString('daily')} completed! +1 Gold`);
                            return interaction.followUp(`Congrats, you finished all your dailies; streak extended! Have 1 more gold!`);
                        }
                        await user.save();
                        return interaction.reply(`Daily ${interaction.options.getString('daily')} completed! +1 Gold`);
                    } else {
                        return interaction.reply("Failed to mark daily as completed for some reason... (name probably wasn't found)");
                    }
            }
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};