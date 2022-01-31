const { SlashCommandBuilder, time } = require('@discordjs/builders');
const { Formatters } = require('discord.js')
const oneDay = 1000 * 60 * 60 * 24;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Access your dailies!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a new daily!')
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
                .setDescription('Complete a daily!')
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
                .setDescription('Look at all your dailies!')
        ).addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a daily.')
                .addStringOption(option =>
                    option
                        .setName('task')
                        .setDescription('The task you want to remove')
                        .setRequired(true)
                )
        ),
    async execute(interaction, characters, didDailies) {
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
                        const replyString = Array.from(d, (x) => {
                            const prepend = x.done ? '[x]' : '[ ]'
                            return `- ${prepend} ${x.task_name}`;
                        }).join("\n");
                        return interaction.reply(`Today's work:\`\`\`markdown\n${replyString}\`\`\``);
                    } else {
                        return interaction.reply('You don\'t have any dailies set!');
                    }
                case 'remove':
                    if (await user.removeDaily(interaction.options.getString('daily'))) {
                        return interaction.reply(`Daily ${interaction.options.getString('daily')} deleted!`);
                    } else {
                        return interaction.reply("Failed to remove daily for some reason... (name probably wasn't found, or maybe you tried deleting a daily that you have completed already! In that case, try again tomorrow.)");
                    }
                case 'complete':
                    if (await user.completeDaily(interaction.options.getString('daily'))) {
                        user.gold += 1
                        let completed = 0;
                        d.forEach(element => { if (element.done) completed += 1; });
                        if (completed === d.size) {
                            user.gold += 1;
                            user.streak += 1;
                            await user.save();
                            didDailies.add(user.name);
                            await interaction.reply(`Daily ${interaction.options.getString('daily')} completed! +1 Gold`);
                            return interaction.followUp(`Congrats, you finished all your dailies! Have 1 more gold!`);
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