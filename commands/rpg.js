const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const enemies = ["Slimy Slime", "Devilish Rat", "Impertinent Owl", "Wicked Wolf"]
const errorMsg = 'Problems? Message @Eagle [Austin] with the command you ran!';
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
                    const embedReply = new MessageEmbed()
                        .setTitle(`${target.tag}'s Character:`)
                        .setColor(await interaction.user.fetch().then((u) => { return u.accentColor; }))
                        .addField('Gold :coin:', `${user.gold}`, true)
                        .addField('Streak :fire:', `${user.streak}`, true)
                        .addField('Stage: :european_castle:', `${user.stage}`, true)
                        .addField('-------------------------------------------------','Character Stats')
                        .addField('STR :muscle:', `${user.STR}`, true)
                        .addField('DEX :bow_and_arrow:', `${user.DEX}`,true)
                        .addField('\u200B', '\u200B', true)
                        .addField('INT :book:', `${user.INT}`, true)
                        .addField('WIZ :brain:', `${user.WIZ}`, true)
                        .addField('\u200B', '\u200B', true)
                        .addField('-------------------------------------------------','Current Equipment:')
                        .addField('Weapon :dagger:', `${user.weapon}`, true)
                        .addField('Hat :billed_cap:', `${user.hat}`, true)
                        .addField('Armor :shield:', `${user.armor}`,true)
                        .setTimestamp()
                        .setFooter({ text: errorMsg });
                    
                    return interaction.reply({
                        embeds: [embedReply],
                    });
                case 'roll':
                    // get Character, check and subtract gold
                    let autoUsed = 0;
                    if (interaction.options.getBoolean('multi')) {
                        if (user.gold < 10) {
                            return interaction.reply('You don\'t have enough gold!')
                        } else {
                            const resultsMap = new Map();
                            const resultsString = []
                            characters.roll(10).forEach(async rollResult => {
                                await user.addItem(rollResult);
                                user.gold -= 1;
                                await user.save();
                                if (resultsMap.has(rollResult.name)) {
                                    resultsMap.set(rollResult.name, resultsMap.get(rollResult.name) + 1);
                                } else {
                                    resultsMap.set(rollResult.name, 1);
                                }
                                if (rollResult.effect[0] === 'P') { autoUsed += 1}
                            });
                            resultsMap.forEach((value, key) => {
                                resultsString.push(`${key} x${value}`);
                            });

                            return interaction.reply(`You got: ${resultsString.join(', ')}! ${autoUsed} items used automatically.`);
                        }
                    } else {
                        if (user.gold < 1) {
                            return interaction.reply('You don\'t have enough gold!')
                        } else {
                            const rollResult = characters.roll()[0];
                            await user.addItem(rollResult);
                            user.gold -= 1;
                            await user.save();
                            if (rollResult.effect[0] === 'P') {
                                return interaction.reply(`You got a(n) ${rollResult.name} (used automatically)!`)
                            } else {
                                return interaction.reply(`You got a(n) ${rollResult.name}!`)
                            }
                        }
                    }
                case 'inventory':
                    // view a Character's inventory
                    const userInv = await user.getItems();
                    if (!userInv.length) return interaction.reply(`${target.tag} has nothing!`);
                    return interaction.reply(`${target.tag} currently has ${userInv.map(i => `${i.amount} ${i.item.name}`).join(', ')}`);
                case 'fight':
                    // Fight next opponent
                    let minStatsBase = getMinStatsBase(user.stage)
                    const rPick = Math.floor(Math.random() * 4);
                    const opponent = enemies[rPick];
                    const userStats = [user.STR, user.DEX, user.INT, user.WIZ];
                    let need = Math.floor(minStatsBase * 4.25);
                    let extraStat = 0;
                    if (Math.max.apply(null, userStats) > minStatsBase * 3) {
                        need = 0;
                    } else {
                        for (let i = 0; i < 4; i++) {
                            if (i === rPick) {
                                const temp = Math.floor(minStatsBase * multiplier);
                                if(userStats[i] > temp){
                                    need -= temp
                                    extraStat += userStats[i] - temp;
                                }
                            } else {
                                if(userStats[i] > minStatsBase){
                                    need -= minStatsBase;
                                    extraStat = userStats[i] - minStatsBase;
                                }
                            }
                        }
                    }
                    const s = user.stage;
                    if (extraStat >= need) {
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