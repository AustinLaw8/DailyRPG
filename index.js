const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { Characters, Inventories, Tasks, Items } = require('./dbConnect.js');
const dotenv = require('dotenv');
const { Op } = require('sequelize');

dotenv.config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}
const adminCommandFiles = fs.readdirSync('./admin').filter(file => file.endsWith('.js'));
for (const file of adminCommandFiles) {
    const command = require(`./admin/${file}`);
    client.commands.set(command.data.name, command);
}

const characters = new Collection();
// const inventories = new Collection();
const items = new Collection();
const parser = /([PH],)?([+-][0-9]+[,]){3}([+-][0-9]+)/;
const rarities = ["N", "R", "SR", "SSR", "UR", "LR", "XR"]

Reflect.defineProperty(characters, 'create', {
    /* eslint-disable-next-line func-name-matching */
    value: async function create(id) {
        const result = await Characters.create({ user_id: id });
        return result ? true : false;
    },
});

client.once('ready', async () => {
    const u = await Characters.findAll();
    u.forEach(b => characters.set(b.user_id, b));

    rarities.forEach(b => items.set(b, new Array()))
    const i = await Items.findAll();
    i.forEach(b => items.get(b.rarity).push(b));
    // const i = await Inventory.findAll();
    // i.forEach(b => inventories.set(b.user_id, b));

    // const it = await Items.findAll();
    // it.forEach(b => items.set(b.item_id, b));

    console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        if (command.data.name === 'item') {
            switch (interaction.options.getSubcommand()) {
                case 'add':
                    const name = interaction.options.getString('name')
                    const rarity = interaction.options.getString('rarity')
                    const effect = interaction.options.getString('effect')

                    if (rarities.includes(rarity)) {
                        return interaction.reply('Invalid rarity.')
                    }
                    if (!effect.match(parser)) {
                        return interaction.reply('Invalid effect (format).')
                    }
                    await Items.create({ name: name, rarity: rarity, effect: effect })
                    return interaction.reply('Item added successfully');
                case 'remove':
                    return interaction.reply('Not implemented.');
                case 'give':
                    const target = interaction.options.getUser('target') ?? interaction.user;
                    const itemName = interaction.options.getString('name');

                    const user = await characters.get(target.id);
                    if (!user) return interaction.reply(`That character doesn't exist.`);

                    const item = await Items.findOne({ where: { name: { [Op.like]: itemName } } });
                    if (!item) return interaction.reply(`That item doesn't exist.`);

                    await user.addItem(item);
                    return interaction.reply(`Gave ${target.tag} a ${itemName}`)
            }
        } else if (command.data.name === 'task') {
            await command.execute(interaction, characters);
        } else if (command.data.name === 'rpg') {
            if (interaction.options.getSubcommand() === 'itemlist') {
                const r = []
                items.forEach((itemsOfRarity, rarity) => {
                    itemsOfRarity.forEach( (item) => {
                        const stats = item.effect.split(',')
                        if (stats[0] === 'p') {
                            r.push(`${item.name} (${rarity}): Permanent Effects, STR${stats[1]}, DEX${stats[2]}, INT${stats[3]}, WIZ${stats[4]}`)
                        } else {
                            r.push(`${item.name} (${rarity}): STR${stats[0]}, DEX${stats[1]}, INT${stats[2]}, WIZ${stats[3]}`)
                        }
                    })
                    
                })
                return interaction.reply(r.join('\n'));
            }
            await command.execute(interaction, characters);
        } else {
            await command.execute(interaction);
        }
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(process.env.token)
    .then(() => console.log('Successfully logged in...'))
    .catch(console.error)