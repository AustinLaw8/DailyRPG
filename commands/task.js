const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const oneMinute = 1000 * 60;
const oneDay = 1000 * 60 * 60 * 24;
const errorMsg = 'Problems? Message @Eagle [Austin] with the command you ran!';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('task')
        .setDescription('Access your tasks!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a new task you want to complete within a given timeframe (default 24 hours)!')
                .addStringOption(option =>
                    option
                        .setName('task')
                        .setDescription('The task you want to add')
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
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('complete')
                .setDescription('Complete a task, and get one gold in compensation')
                .addStringOption(option =>
                    option
                        .setName('task')
                        .setDescription('The task you completed!')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Lists your current tasks')
        ).addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a task you don\'t plan on doing.')
                .addStringOption(option =>
                    option
                        .setName('task')
                        .setDescription('The task you want to remove')
                        .setRequired(true)
                )
        ),
    async execute(interaction, characters) {
        try {
            const user = characters.get(interaction.user.id);
            if (!user) { return interaction.reply('You don\'t have a character! Use `/rpg create` to make one!'); }
            const date = new Date();
            const curTasks = await user.getTasks();
            switch (interaction.options.getSubcommand()) {
                case 'add':
                    const taskToAdd = interaction.options.getString('task');
                    let totalTime = 0;
                    const minutes = interaction.options.getInteger('minutes');
                    const hours = interaction.options.getInteger('hours');
                    const days = interaction.options.getInteger('days');
                    if (minutes) totalTime += oneMinute * minutes;
                    if (hours) totalTime += oneMinute * 60 * hours
                    if (days) totalTime += oneMinute * 60 * 24 * days
                    if (totalTime === 0) totalTime = oneDay;
                    const taskAdded = await user.addTask(taskToAdd, totalTime);
                    if (taskAdded) {
                        return interaction.reply(`Task ${taskToAdd} successfully added!`);
                    } else {
                        return interaction.reply("Failed to add task for some reason...");
                    }
                case 'list':
                    if (curTasks.length > 0) {
                        const embedReply = new MessageEmbed()
                            .setTitle(`${interaction.user.tag}'s todo list:`)
                            .setColor(await interaction.user.fetch().then((u) => { return u.accentColor; }));
                        curTasks.forEach((x) => {
                            const timeoutT = new Date(x.timeout);
                            const expirationTime = (timeoutT.getTime() - date.getTime()) / 1000;
                            if (expirationTime < 0) {
                                embedReply.addField(x.task_name, `Timeout :no_entry_sign:! Hurry up and finish your work!`);
                            } else {
                                let hours = Math.floor(expirationTime / 3600);
                                const days = Math.floor(hours / 24);
                                hours = hours % 24;
                                const minutes = Math.floor((expirationTime / 60) % 60);
                                const seconds = Math.floor(expirationTime % 60);
                                if (days === 0 && hours === 0 && minutes === 0) {
                                    embedReply.addField(x.task_name, `Time is running out :bangbang: ${seconds} seconds left!`)
                                } else if (days > 0) {
                                    embedReply.addField(x.task_name, `Time left: ${days}:${hours < 10 ? '0' + hours.toString() : hours}:${minutes < 10 ? '0' + minutes.toString() : minutes}`);
                                } else {
                                    embedReply.addField(x.task_name, `Time left: ${hours < 10 ? '0' + hours.toString() : hours}:${minutes < 10 ? '0' + minutes.toString() : minutes}`);
                                }
                            }
                        });
                        embedReply.setTimestamp().setFooter({ text: errorMsg });
                        return interaction.reply({
                            embeds: [embedReply],
                        });
                    } else {
                        return interaction.reply('You don\'t have any tasks for today!');
                    }
                case 'remove':
                    if (await user.removeTask(interaction.options.getString('task'))) {
                        return interaction.reply(`Task ${interaction.options.getString('task')} deleted!`);
                    } else {
                        return interaction.reply("Failed to remove task for some reason... (name probably wasn't found)");
                    }
                case 'complete':
                    if (await user.removeTask(interaction.options.getString('task'))) {
                        user.gold += 1;
                        await user.save();
                        return interaction.reply(`Task ${interaction.options.getString('task')} completed! +1 Gold`);
                    } else {
                        return interaction.reply("Failed to mark task as completed for some reason... (name probably wasn't found)");
                    }
            }
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};