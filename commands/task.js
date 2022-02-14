const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const oneMinute = 1000 * 60;
const oneDay = 1000 * 60 * 60 * 24;
const oneWeek = oneDay * 7;
const errorMsg = 'Problems? Message @Eagle [Austin] with the command you ran!';
const divider = '-------------------------------------------------';

const indexMappings = new Map([
    [0, ':one:'],
    [1, ':two:'],
    [2, ':three:'],
    [3, ':four:'],
    [4, ':five:'],
    [5, ':six:'],
    [6, ':seven:'],
    [7, ':eight:'],
    [8, ':nine:'],
    [9, ':ten:'],
]);

const dayMappings = new Map([
    [0, 'Sunday'],
    [1, 'Monday'],
    [2, 'Tuesday'],
    [3, 'Wednesday'],
    [4, 'Thursday'],
    [5, 'Friday'],
    [6, 'Saturday'],
])

const monthMappings = new Map([
    [0, 'January'],
    [1, 'February'],
    [2, 'March'],
    [3, 'April'],
    [4, 'May'],
    [5, 'June'],
    [6, 'July'],
    [7, 'August'],
    [8, 'September'],
    [9, 'October'],
    [10, 'November'],
    [11, 'December'],
])
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
                    if (taskToAdd.length > 256) {
                        return interaction.reply('Task name is too long! (Max 255 characters)')
                    }
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
                        return interaction.reply(`Task '${taskToAdd}' successfully added!`);
                    } else {
                        return interaction.reply({ content: "Failed to add task for some reason...", ephemeral: true });
                    }
                case 'list':
                    if (curTasks.length > 0) {
                        const embedReply = new MessageEmbed()
                            .setTitle(`${interaction.user.tag}'s todo list:`)
                            .setColor(await interaction.user.fetch().then((u) => { return u.accentColor; }));
                        curTasks.forEach((x, index) => {
                            const timeoutT = new Date(x.timeout);
                            const expirationTime = (timeoutT.getTime() - date.getTime()) / 1000;
                            let task = `${indexMappings.get(index)} ${x.task_name}\n`;
                            let due = 'If you see this, something went wrong...';
                            let time = 'If you see this, something went wrong...';
                            if (expirationTime < 0) {
                                due = '***Late!***';
                                time = '_Timeout!_';
                            } else {
                                if (expirationTime > oneWeek / 1000) {
                                    due = `${dayMappings.get(timeoutT.getDay())}, ${monthMappings.get(timeoutT.getMonth())} ${timeoutT.getDate()}`;
                                } else if (date.getDate() === timeoutT.getDate()) {
                                        due = `***Today*** at ${timeoutT.getHours()}:${timeoutT.getMinutes()}`
                                } else {
                                    due = `This ***${dayMappings.get(timeoutT.getDay())}*** at ${timeoutT.getHours()}:${timeoutT.getMinutes()}`;
                                }
                                let hours = Math.floor(expirationTime / 3600);
                                const days = Math.floor(hours / 24);
                                hours = hours % 24;
                                const minutes = Math.floor((expirationTime / 60) % 60);
                                const seconds = Math.floor(expirationTime % 60);
                                if (days === 0 && hours === 0 && minutes === 0) {
                                    time = `_${seconds} seconds!_`; 
                                } else if (days > 0) {
                                    time = `_${days}d ${hours < 10 ? '0' + hours.toString() : hours}h ${minutes < 10 ? '0' + minutes.toString() : minutes}m_\n`
                                } else {
                                    time = `_${hours < 10 ? '0' + hours.toString() : hours}h ${minutes < 10 ? '0' + minutes.toString() : minutes}m_\n`
                                }
                            }
                            embedReply.addField(task, '\u200b',true)
                            embedReply.addField(due, time, true);
                            embedReply.addField('\u200b','\u200b',true)
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
                        return interaction.reply(`Task '${interaction.options.getString('task')}' deleted!`);
                    } else {
                        return interaction.reply({ content: "Failed to remove task for some reason... (name probably wasn't found)", ephemeral: true });
                    }
                case 'complete':
                    switch (await user.removeTask(interaction.options.getString('task'))) {
                        case -1:
                            return interaction.reply({ content: "Failed to mark task as completed for some reason... (name probably wasn't found)", ephemeral: true });
                        case 0:
                            user.gold += 1;
                            await user.save();
                            return interaction.reply(`Task '${interaction.options.getString('task')}' completed! +1 Gold`);
                        case 1:
                            return interaction.reply(`Task '${interaction.options.getString('task')}' completed! No gold rewarded, since this task timed out!`);
                    }
            }
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};