const { SlashCommandBuilder, channelMention } = require('@discordjs/builders');
const { MessageEmbed, Formatters } = require('discord.js')
const oneDay = 1000 * 60 * 60 * 24;
const errorMsg = 'Problems? Message @Eagle [Austin] with the command you ran!';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('task')
        .setDescription('Access your tasks!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a new task for today!')
                .addStringOption(option =>
                    option
                        .setName('task')
                        .setDescription('The task you want to add')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('complete')
                .setDescription('Complete a task!')
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
                .setDescription('Look at all your tasks for the day!')
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
                    const taskAdded = await user.addTask(taskToAdd);
                    if (taskAdded) {
                        setTimeout((taskAdded) => {
                            taskAdded.destroy()
                        },
                            oneDay, taskAdded,
                        );
                        return interaction.reply(`Task ${taskToAdd} successfully added!`);
                    } else {
                        return interaction.reply("Failed to add task for some reason...");
                    }
                case 'list':
                    if (curTasks.length > 0) {
                        const embedReply = new MessageEmbed()
                            .setTitle(`${interaction.user.tag}'s todo list:`)
                            .setColor(await interaction.user.fetch().then((u) => { return u.accentColor; }));
                        const replyString = Array.from(curTasks, (x) => {
                            const timeoutT = new Date(x.timeout);
                            const expirationTime = (timeoutT.getTime() - date.getTime()) / 1000;
                            const hours = Math.floor(expirationTime / 3600);
                            const minutes = Math.floor((expirationTime / 60) % 60)
                            const seconds = Math.floor(expirationTime % 60);
                            embedReply.addField(x.task_name, `Expires in ${hours} hours, ${minutes} minutes, and ${seconds} seconds`);
                        }).join("\n");
                        embedReply.setTimestamp().setFooter({ text: errorMsg })
                        return interaction.reply({
                            embeds: [embedReply],
                        })
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