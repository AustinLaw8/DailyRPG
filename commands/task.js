const { SlashCommandBuilder, time } = require('@discordjs/builders');
const { Formatters } = require('discord.js')
const oneDay = 1000 * 60 * 60 * 24;

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
                .setName('finish')
                .setDescription('Finish a task!')
                .addStringOption(option => 
                    option
                        .setName('task')
                        .setDescription('The task you finished!')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('get')
                .setDescription('Look at all your tasks for the day!')
        ),
	async execute(interaction, localTaskStorage, characters) {
        try {
            const date = new Date();
            const id = interaction.user.id;
            const curTasks = localTaskStorage.get(id) ?? new Map(); 
            if (!localTaskStorage.has(id)) localTaskStorage.set(id, curTasks);
            switch (interaction.options.getSubcommand()) {
                case 'add':
                    const taskToAdd = interaction.options.getString('task');
                    curTasks.set(taskToAdd, date);
                    await interaction.reply("Task successfully added!");
                    setTimeout( (id, taskToAdd, localTaskStorage) => {localTaskStorage.get(id).delete(taskToAdd)}, oneDay, id, taskToAdd, localTaskStorage)
                    break;
                case 'get': 
                    if (curTasks.size === 0) {
                        await interaction.reply('You don\'t have any tasks for today!');
                    } else {
                        const replyString = Array.from(curTasks, (x) => {
                            const expirationTime = (oneDay - (date.getTime() - x[1].getTime())) / 1000;
                            const hours = Math.floor(expirationTime / 3600);
                            const minutes = Math.floor((expirationTime / 60) % 60)
                            const seconds = Math.floor(expirationTime % 60);
                            return `+ ${x[0]}, expires in ${hours} hours, ${minutes} minutes, and ${seconds} seconds`;
                        }).join("\n");
                        await interaction.reply(`Current todo list:\`\`\`markdown\n${replyString}\`\`\``);
                    }
                    break;
                // case 'finish':
                //     const taskToComplete = interaction.options.getString('task');
                //     curTasks.delete(taskToComplete);
                //     break;
            }
        } catch (error) { 
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
	},
};