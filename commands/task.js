const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const oneMinute = 1000 * 60;
const oneDay = 1000 * 60 * 60 * 24;
const oneWeek = oneDay * 7;
const errorMsg = 'Problems? Message @Eagle [Austin] with the command you ran!';
const divider = '-------------------------------------------------';
const DEFAULT_ERR = 'If you see this, something went wrong...';

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

const formatNumber = (n) => {
    return n < 10 ? '0' + n.toString() : n
}
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
                        .setName('name')
                        .setDescription('The name of the task you completed!')
                )
                .addIntegerOption(option =>
                    option
                        .setName('number')
                        .setDescription('The number of the task you completed (Be careful; this can change whenever you add a new task)!')
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
                        .setName('name')
                        .setDescription('The name of the task you completed!')
                )
                .addIntegerOption(option =>
                    option
                        .setName('number')
                        .setDescription('The number of the task you completed (Be careful; this can change whenever you add a new task)!')
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
                            let due = DEFAULT_ERR;
                            let time = DEFAULT_ERR;
                            if (expirationTime < 0) {
                                due = '***Late!***';
                                time = '_Timeout!_';
                            } else {
                                if (expirationTime > oneWeek / 1000) {
                                    due = `${dayMappings.get(timeoutT.getDay())}, ${monthMappings.get(timeoutT.getMonth())} ${timeoutT.getDate()}`;
                                } else if (date.getDate() === timeoutT.getDate()) {
                                        due = `***Today*** at ${formatNumber(timeoutT.getHours())}:${formatNumber(timeoutT.getMinutes())}`
                                } else {
                                    due = `This ***${dayMappings.get(timeoutT.getDay())}*** at ${formatNumber(timeoutT.getHours())}:${formatNumber(timeoutT.getMinutes())}`;
                                }
                                let hours = Math.floor(expirationTime / 3600);
                                const days = Math.floor(hours / 24);
                                hours = hours % 24;
                                const minutes = Math.floor((expirationTime / 60) % 60);
                                const seconds = Math.floor(expirationTime % 60);
                                if (days === 0 && hours === 0 && minutes === 0) {
                                    time = `_${seconds} seconds!_`; 
                                } else if (days > 0) {
                                    time = `_${days}d ${formatNumber(hours)}h ${formatNumber(minutes)}m_\n`
                                } else {
                                    time = `_${formatNumber(hours)}h ${formatNumber(minutes)}m_\n`
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
                case 'complete':
                    const index = interaction.options.getInteger('number') ?? -1;
                    let target = '';
                    if (interaction.options.getString('name')) {
                        target = interaction.options.getString('name');
                    } else if (index !== -1) {
                        if (index - 1 > curTasks.length) {
                            return interaction.reply({ content: `That task number doesn't exist!`, ephemeral: true });
                        }
                        target = curTasks[index-1].task_name;
                    } else {
                        return interaction.reply({ content: `You must give either a task name or number!`, ephemeral: true });
                    }
                    if (!target) { return interaction.reply({ content: DEFAULT_ERR, ephemeral: true }); }

                    if (interaction.options.getSubcommand() === 'remove') {
                        if (await user.removeTask(target) !== -1) {
                            return interaction.reply(`Task '${target}' deleted!`);
                        } else {
                            return interaction.reply({ content: "Failed to remove task for some reason... (name probably wasn't found)", ephemeral: true });
                        }
                    } else {
                        switch (await user.removeTask(target)) {
                            case -1:
                                return interaction.reply({ content: "Failed to mark task as completed for some reason... (name probably wasn't found)", ephemeral: true });
                            case 0:
                                user.gold += 1;
                                await user.save();
                                return interaction.reply(`Task '${target}' completed! +1 Gold`);
                            // case 1:
                            //     return interaction.reply(`Task '${target}' completed! No gold rewarded, since this task timed out!`);
                        }
                    }
            }
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};