const { SlashCommandBuilder, time } = require('@discordjs/builders');

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
                .setName('get')
                .setDescription('Look at all your tasks for the day!')
        ),
	async execute(interaction, localTaskStorage) {
        try {
            const id = interaction.user.id;
            const curTasks = localTaskStorage.has(id) ? localTaskStorage.get(id) : []; 
            switch (interaction.options.getSubcommand()) {
                case 'add':
                    localTaskStorage.set(id, [...curTasks, interaction.options.getString('task')] );
                    await interaction.reply("Task successfully added!");
                    break;
                case 'get':
                    await interaction.reply(`Current todo list: ${curTasks}`);
                    break;
            }
        } catch (error) { 
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
	},
};