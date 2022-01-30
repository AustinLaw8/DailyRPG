const { SlashCommandBuilder } = require('@discordjs/builders');
const enemies = ["Slimy Slime", "Devilish Rat", "Impertinent Owl", "Wicked Wolf"]
const multiplier = 1.25;
const getMinStatsBase = (stage) => {
    return Math.floor(stage ** (5 / 4));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rpg')
        .setDescription('The DailyRPG')
        .addSubcommand(subcommand =>
            subcommand
                .setName('profile')
                .setDescription('View your character profile!')
                .addUserOption(option =>
                    option
                        .setName('other')
                        .setDescription('or see someone else\'s?')
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('roll')
                .setDescription('Gacha time!!!')
                .addBooleanOption(option =>
                    option
                        .setName('multi')
                        .setDescription('x10 roll'))
                .addUserOption(option =>
                    option
                        .setName('other')
                        .setDescription('or roll for someone else? (y u waste ur gacha like that)')
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('inventory')
                .setDescription('View your inventory!')
                .addUserOption(option =>
                    option
                        .setName('other')
                        .setDescription('or see someone else\'s?')
                )
        ).addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Creates a new character (bound to your discord account)')
        ).addSubcommand(subcommand =>
            subcommand
                .setName('itemlist')
                .setDescription('Lists all items currently available.')
        ).addSubcommand(subcommand =>
            subcommand
                .setName('fight')
                .setDescription('Fight!')
        ),
    async execute(interaction, characters) {
        try {
            if (interaction.options.getSubcommand() === 'create') {
                // Create a character, if one does not exist
                if (characters.get(interaction.user.id)) {
                    return interaction.reply('You already have a character!');
                } else {
                    if (await characters.create(interaction.user.id)) {
                        return interaction.reply('Character created successfully!');
                    } else {
                        return interaction.reply('Character creation failed for some reason!');
                    }
                }
            }

            const target = interaction.options.getUser('other') ?? interaction.user;
            const user = characters.get(target.id);
            if (!user) { return interaction.reply(`${target.tag} doesn't have a character! Use \`/rpg create\` to make one!`); }
            switch (interaction.options.getSubcommand()) {
                case 'profile':
                    // get and display Character
                    const replyString = await user.getStats();
                    return interaction.reply(`${target.tag}'s Character:\n${replyString}`);
                case 'roll':
                    // get Character, check and subtract gold
                    if (interaction.options.getBoolean('multi')) {
                        if (user.gold < 10) {
                            return interaction.reply('You don\'t have enough gold!')
                        } else {
                            const resultsMap = new Map();
                            const resultsString = []
                            characters.roll(10).forEach(async rollResult => {
                                user.addItem(rollResult);
                                user.gold -= 10;
                                await user.save();
                                if (resultsMap.has(rollResult.name)) {
                                    resultsMap.set(rollResult.name, resultsMap.get(rollResult.name) + 1);
                                } else {
                                    resultsMap.set(rollResult.name, 1);
                                }
                            });
                            resultsMap.forEach((value, key) => {
                                resultsString.push(`${key} x${value}`);
                            });

                            return interaction.reply(`You got: ${resultsString.join(', ')}!`);
                        }
                    } else {
                        if (user.gold < 1) {
                            return interaction.reply('You don\'t have enough gold!')
                        } else {
                            const rollResult = characters.roll()[0];
                            user.gold -= 1;
                            await user.save();
                            await user.addItem(rollResult);
                            return interaction.reply(`You got a(n) ${rollResult.name}!`)
                        }
                    }
                case 'inventory':
                    // view a Character's inventory
                    const userInv = await user.getItems();
                    if (!userInv.length) return interaction.reply(`${target.tag} has nothing!`);
                    return interaction.reply(`${target.tag} currently has ${userInv.map(i => `${i.amount} ${i.item.name}`).join(', ')}`);
                case 'fight':
                    // Fight next opponent
                    const minStatsBase = getMinStatsBase(user.stage);
                    const rPick = Math.floor(Math.random() * 4);
                    const opponent = enemies[rPick];
                    const userStats = [user.STR, user.DEX, user.INT, user.WIZ];
                    let won = true;
                    for (let i = 0; i < 4; i++) {
                        if (i === rPick) {
                            if (userStats[i] < Math.floor(minStatsBase * multiplier)) {
                                won = false
                            }
                        } else {
                            if (userStats[i] < minStatsBase) {
                                won = false;
                            }
                        }
                    }
                    const s = user.stage;
                    if (won) {
                        user.stage += 1;
                        await user.save();
                        setTimeout((interaction, s, opponent) => {
                            interaction.editReply(`Currently fighting ${opponent} (Level ${s})... Victory! You've advanced to the next stage.`)
                        }, 4000, interaction, s, opponent)

                    } else {
                        setTimeout((interaction, s, opponent) => {
                            interaction.editReply(`Currently fighting ${opponent} (Level ${s})... Defeat... go train some more before fighting again!`)
                        }, 4000, interaction, s, opponent)
                    }
                    setTimeout((interaction, s, opponent) => {
                        interaction.editReply(`Currently fighting ${opponent} (Level ${s}).`)
                    }, 1000, interaction, s, opponent)
                    setTimeout((interaction, s, opponent) => {
                        interaction.editReply(`Currently fighting ${opponent} (Level ${s})..`)
                    }, 2000, interaction, s, opponent)
                    setTimeout((interaction, s, opponent) => {
                        interaction.editReply(`Currently fighting ${opponent} (Level ${s})...`)
                    }, 3000, interaction, s, opponent)
                    return interaction.reply(`Currently fighting ${opponent} (Level ${s})`)
            }
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};