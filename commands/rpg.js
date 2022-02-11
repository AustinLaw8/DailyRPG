const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const enemies = ["Slimy Slime", "Devilish Rat", "Impertinent Owl", "Wicked Wolf"]
const errorMsg = 'Problems? Message @Eagle [Austin] with the command you ran!';
const multiplier = 1.25;
const getMinStatsBase = (stage) => {
    return Math.floor(stage ** (5 / 4));
}
const addItemFromRoll = (user, rollResult, rollReply) => {
    user.addItem(rollResult);
    user.gold -= 1;
    if (rollResult.effect[0] === 'P') {
        rollReply.addField(`${rollResult.name}`, 'Used automatically!', true);
    } else {
        rollReply.addField(`${rollResult.name}`, '\u200b', true);
    }
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
                .setName('create')
                .setDescription('Create a new character and profile')
        )
        .addSubcommand(subcommand =>
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
                    const embedReply = new MessageEmbed()
                        .setTitle(`${target.tag}'s Character:`)
                        .setColor(await interaction.user.fetch().then((u) => { return u.accentColor; }))
                        .addField('Gold :coin:', `${user.gold}`, true)
                        .addField('Streak :fire:', `${user.streak}`, true)
                        .addField('Stage: :european_castle:', `${user.stage}`, true)
                        .addField('-------------------------------------------------', 'Character Stats')
                        .addField('STR :muscle:', `${user.STR}`, true)
                        .addField('DEX :bow_and_arrow:', `${user.DEX}`, true)
                        .addField('\u200B', '\u200B', true)
                        .addField('INT :book:', `${user.INT}`, true)
                        .addField('WIZ :brain:', `${user.WIZ}`, true)
                        .addField('\u200B', '\u200B', true)
                        .addField('-------------------------------------------------', 'Current Equipment')
                        .addField('Weapon :dagger:', `${user.weapon}`, true)
                        .addField('Hat :billed_cap:', `${user.hat}`, true)
                        .addField('Armor :shield:', `${user.armor}`, true)
                        .setTimestamp()
                        .setFooter({ text: errorMsg });

                    return interaction.reply({
                        embeds: [embedReply],
                    });
                case 'roll':
                    const rollReply = new MessageEmbed()
                        .setTitle(`Roll results:`)
                        .setColor(await interaction.user.fetch().then((u) => { return u.accentColor; }))
                        .setTimestamp()
                        .setFooter({ text: errorMsg });
                    if (interaction.options.getBoolean('multi')) {
                        if (user.gold < 10) {
                            return interaction.reply('You don\'t have enough gold!');
                        } else {
                            characters.roll(10).forEach((rollResult) => {
                                addItemFromRoll(user, rollResult, rollReply);
                            });
                        }
                    } else {
                        if (user.gold < 1) {
                            return interaction.reply('You don\'t have enough gold!');
                        } else {
                            addItemFromRoll(user, characters.roll()[0], rollReply);
                        }
                    }
                    await user.save();
                    return interaction.reply({
                        embeds: [rollReply],
                    });
                case 'fight':
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
                                if (userStats[i] > temp) {
                                    need -= temp;
                                    extraStat += userStats[i] - temp;
                                }
                            } else {
                                if (userStats[i] > minStatsBase) {
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
                        }, 4000, interaction, s, opponent);
                    } else {
                        setTimeout((interaction, s, opponent) => {
                            interaction.editReply(`Currently fighting ${opponent} (Level ${s})... Defeat... go train some more before fighting again!`)
                        }, 4000, interaction, s, opponent);
                    }
                    for (let i = 1; i <= 3; i++) {
                        setTimeout((interaction, s, opponent) => {
                            interaction.editReply(`Currently fighting ${opponent} (Level ${s}).`)
                        }, 1000 * i, interaction, s, opponent);
                    }
                    return interaction.reply(`Currently fighting ${opponent} (Level ${s})`);
            }
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};