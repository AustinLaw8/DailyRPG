const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const enemies = ["Slimy Slime", "Devilish Rat", "Impertinent Owl", "Wicked Wolf"]
const errorMsg = 'Problems? Message @Eagle [Austin] with the command you ran!';
const divider = '-------------------------------------------------';
const multiplier = 1.25;
const getMinStatsBase = (stage) => {
    return Math.floor(stage ** (5 / 4));
}
const addItemFromRoll = async (user, rollResult, rollReply) => {
    console.log(rollResult.name)
    await user.addItem(rollResult);
    user.gold -= 1;
    if (rollResult.effect[0] === 'P') {
        const stats = getStatsFromItem(rollResult);
        rollReply.addField(`${rollResult.name}`, `Used automatically!\nSTR+${stats[0]}, DEX+${stats[1]},\nINT+${stats[2]}, WIZ+${stats[3]}`, true);
    } else {
        rollReply.addField(`${rollResult.name}`, `Added to inventory!`, true);
    }
}
const getStatsFromItem = (item) => {
    try {
        const stats = item.effect.split(',');
        return [parseInt(stats[1], 10), parseInt(stats[2], 10), parseInt(stats[3], 10), parseInt(stats[4], 10)]
    } catch (error) {
        console.log(error);
        return [0, 0, 0, 0]
    }

}
const statToString = (stat) => {
    if (stat === 0) {
        return '';
    } else if (stat > 0) {
        return `(+${stat})`;
    } else {
        return `(${stat})`
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
    async execute(interaction, characters, itemsByName) {
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

            let statsBonuses = [0, 0, 0, 0];
            getStatsFromItem(itemsByName.get(user.weapon)).forEach((val, i) => { statsBonuses[i] += val; });
            getStatsFromItem(itemsByName.get(user.hat)).forEach((val, i) => { statsBonuses[i] += val; });
            getStatsFromItem(itemsByName.get(user.armor)).forEach((val, i) => { statsBonuses[i] += val; });

            switch (interaction.options.getSubcommand()) {
                case 'profile':
                    const embedReply = new MessageEmbed()
                        .setTitle(`${target.tag}'s Character:`)
                        .setColor(await interaction.user.fetch().then((u) => { return u.accentColor; }))
                        .addField('Gold :coin:', `${user.gold}`, true)
                        .addField('Streak :fire:', `${user.streak}`, true)
                        .addField('Stage: :european_castle:', `${user.stage}`, true)
                        .addField(divider, 'Character Stats')
                        .addField('STR :muscle:', `${user.STR} ${statToString(statsBonuses[0])}`, true)
                        .addField('DEX :bow_and_arrow:', `${user.DEX} ${statToString(statsBonuses[1])}`, true)
                        .addField('\u200B', '\u200B', true)
                        .addField('INT :book:', `${user.INT} ${statToString(statsBonuses[2])}`, true)
                        .addField('WIZ :brain:', `${user.WIZ} ${statToString(statsBonuses[3])}`, true)
                        .addField('\u200B', '\u200B', true)
                        .addField(divider, 'Current Equipment')
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
                            characters.roll(9).forEach( async (rollResult) => {
                                await addItemFromRoll(user, rollResult, rollReply);
                            });
                            await addItemFromRoll(user, characters.roll(1, { N: 0.75, R: 0.90, SR: 1 /*0, 0, 0*/ })[0], rollReply);
                        }
                    } else {
                        if (user.gold < 1) {
                            return interaction.reply('You don\'t have enough gold!');
                        } else {
                            await addItemFromRoll(user, characters.roll()[0], rollReply);
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
                    const userStats = [user.STR + statsBonuses[0], user.DEX + statsBonuses[1], user.INT + statsBonuses[2], user.WIZ + statsBonuses[3]];
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