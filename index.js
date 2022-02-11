const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { Characters, Inventories, Tasks, Items, Dailies, Reminders } = require('./dbConnect.js');
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
const rarities = ["N", "R", "SR", "SSR", "UR", "LR"]
const oneDay = 1000 * 60 * 60 * 24;

Reflect.defineProperty(characters, 'create', {
    /* eslint-disable-next-line func-name-matching */
    value: async function create(id) {
        try {
            const result = await Characters.create({ user_id: id });
            characters.set(id, result);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    },
});

Reflect.defineProperty(characters, 'roll', {
    /* eslint-disable-next-line func-name-matching */
    value: function roll(numRolls = 1, rates = { "N": .80, "R": .95, "SR": 1, /*0, 0, 0*/ }) {
        const rolls = [];
        let result;
        for (let i = 0; i < numRolls; i++) {
            const random = Math.random();
            for (const r in rates) {
                if (random < rates[r]) {
                    result = r;
                    break;
                }
            }
            rolls.push(items.get(result)[Math.floor(Math.random() * items.get(result).length)]);
        }
        return rolls;
    },
})

async function resetDailies() {
    characters.forEach(async (c) => {
        if (!c.didDailies) c.streak = 0;
        c.didDailies = false;
        await c.save();
        await c.resetDaily()
            .then(() => console.log("Dailies sucessfuly reset"))
            .catch((error) => console.error(error));
    })
    setTimeout(resetDailies, oneDay);
}

client.once('ready', async () => {
    const u = await Characters.findAll();
    u.forEach(b => characters.set(b.user_id, b));

    rarities.forEach(b => items.set(b, new Array()))
    const i = await Items.findAll();
    i.forEach(b => {
        if (b.rarity !== "XR")
            items.get(b.rarity).push(b);
    });

    const curTime = new Date().getTime();
    await Reminders.findAll().then((r) => {
        r.forEach((b) => {
            if (b.user_id !== "null") {
                const sendTime = b.timeout.getTime() - curTime;
                console.log(`${b.reminder}, ${new Date(b.timeout).toString()}`)
                setTimeout(async (b) => {
                    const u = await client.users.fetch(b.user_id);
                    const c = await client.channels.fetch(b.channel);
                    c.send(`${u}, ${b.reminder}`);
                    await b.destroy();
                }, sendTime < 0 ? 0 : sendTime, b)
            }
        });
    });

    const now = new Date();
    now.setUTCHours(now.getUTCHours() - 8)
    console.log(now)
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() + 1)
    d.setUTCHours(0)
    d.setUTCMinutes(0)
    d.setUTCSeconds(0)
    d.setUTCMilliseconds(0)
    const expirationTime = (d.getTime() - now.getTime()) / 1000;
    const hours = Math.floor(expirationTime / 3600);
    const minutes = Math.floor((expirationTime / 60) % 60)
    const seconds = Math.floor(expirationTime % 60);
    console.log(`Time until next day: ${hours} hours, ${minutes} minutes, and ${seconds} seconds`);
    setTimeout(resetDailies, expirationTime * 1000);
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
        switch (command.data.name) {
            case 'rpg':
            case 'task':
            case 'daily':
            case 'item':
                return command.execute(interaction, characters);
            case 'remind':
                return command.execute(interaction, Reminders);
            case 'admin':
                switch (interaction.options.getSubcommand()) {
                    case 'add':
                        const name = interaction.options.getString('name')
                        const rarity = interaction.options.getString('rarity')
                        const effect = interaction.options.getString('effect')

                        if (rarities.includes(rarity) || rarity === "XR") {
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
                        if (itemName === 'gold') {
                            user.gold += 1;
                            await user.save();
                            return interaction.reply(`Gold given`);
                        }
                        const item = await Items.findOne({ where: { name: { [Op.like]: itemName } } });
                        if (!item) return interaction.reply(`That item doesn't exist.`);
                        await user.addItem(item);
                        return interaction.reply(`Gave ${target.tag} a ${itemName}`);
                }
            default:
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