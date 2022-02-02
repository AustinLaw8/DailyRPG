/* Table Formats
 *
 * Characters
 * | user_id (string) | STR (int) | DEX (int) | INT (int) | WIZ (int) | Gold (int) | Stage (int) | 
 *
 * Inventory 
 * | user_id (string) | item_id (int) | amount (int) | 
 *
 * Items 
 * | item_id (string) | rarity (string) | effect (string) (serialized) | 
 * 
 */

const Sequelize = require('sequelize');
const dotenv = require('dotenv');
const { user } = require('pg/lib/defaults');
dotenv.config();
const oneDay = 1000 * 60 * 60 * 24;

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        }
    }
});

const Characters = require('./data/Characters.js')(sequelize, Sequelize.DataTypes);
const Inventories = require('./data/Inventory.js')(sequelize, Sequelize.DataTypes);
const Items = require('./data/Items.js')(sequelize, Sequelize.DataTypes);
const Tasks = require('./data/Tasks.js')(sequelize, Sequelize.DataTypes);
const Dailies = require('./data/Dailies.js')(sequelize, Sequelize.DataTypes);


sequelize.authenticate()
    .then(() => { console.log('Connection has been established successfully.'); })
    .catch(err => { console.error('Unable to connect to the database:', err); });

Inventories.belongsTo(Items, { foreignKey: 'item_id', as: 'item' });

Reflect.defineProperty(Characters.prototype, 'addItem', {
    /* eslint-disable-next-line func-name-matching */
    value: async function addItem(item) {
        try {
            if (item.effect[0] === 'P') {
                const stats = item.effect.split(',');
                this.STR += parseInt(stats[1], 10);
                this.DEX += parseInt(stats[2], 10);
                this.INT += parseInt(stats[3], 10);
                this.WIZ += parseInt(stats[4], 10);
                return this.save();
            }
            const userItem = await Inventories.findOne({
                where: { user_id: this.user_id, item_id: item.id },
            });

            if (userItem) {
                userItem.amount += 1;
                return userItem.save();
            } else {
                return Inventories.create({ user_id: this.user_id, item_id: item.id, amount: 1 })
            }
        } catch (error) {
            console.log(error);
            return false;
        }
    }
})

Reflect.defineProperty(Characters.prototype, 'addTask', {
    /* eslint-disable-next-line func-name-matching */
    value: async function addTask(task) {
        const userTask = await Tasks.findOne({
            where: { user_id: this.user_id, task_name: task },
        });

        if (userTask) {
            return null;
        } else {
            const date = new Date();
            return Tasks.create({ user_id: this.user_id, task_name: task, timeout: date.getTime() + oneDay })
        }
    }
})

Reflect.defineProperty(Characters.prototype, 'addDaily', {
    /* eslint-disable-next-line func-name-matching */
    value: async function addDaily(daily) {
        const userDaily = await Dailies.findOne({
            where: { user_id: this.user_id, daily_name: daily },
        });

        if (userDaily) {
            return null;
        } else {
            return Dailies.create({ user_id: this.user_id, daily_name: daily, done: false, })
        }
    }
})

Reflect.defineProperty(Characters.prototype, 'getStats', {
    /* eslint-disable-next-line func-name-matching */
    value: async function getStats() {
        try {
            const user = await Characters.findOne({
                where: { user_id: this.user_id },
            });
            return `Gold :coin:: ${user.gold}\nSTR :muscle:: ${user.STR}\nDEX :bow_and_arrow:: ${user.DEX}\nINT :book:: ${user.INT}\nWIZ :brain:: ${user.WIZ}\nStage: :european_castle:: ${user.stage}\nCurrent Equipment: ${user.weapon}, ${user.hat}, ${user.armor}.\nStreak :fire:: ${user.streak}`;
        } catch (error) {
            console.error(error);
        }
    },
});

Reflect.defineProperty(Characters.prototype, 'getItems', {
    /* eslint-disable-next-line func-name-matching */
    value: function getItems() {
        return Inventories.findAll({
            where: { user_id: this.user_id },
            include: ['item'],
        });
    },
});

Reflect.defineProperty(Characters.prototype, 'getTasks', {
    /* eslint-disable-next-line func-name-matching */
    value: async function getTasks() {
        return await Tasks.findAll({
            where: { user_id: this.user_id },
        })
    }
})

Reflect.defineProperty(Characters.prototype, 'getDailies', {
    /* eslint-disable-next-line func-name-matching */
    value: async function getDailies() {
        return await Dailies.findAll({
            where: { user_id: this.user_id },
        })
    }
})

Reflect.defineProperty(Characters.prototype, 'removeTask', {
    /* eslint-disable-next-line func-name-matching */
    value: async function removeTask(task) {
        const target = await Tasks.findOne({
            where: { user_id: this.user_id, task_name: task }
        })
        if (target) {
            await target.destroy();
            return true;
        } else {
            return false;
        }
    }
})

Reflect.defineProperty(Characters.prototype, 'removeDaily', {
    /* eslint-disable-next-line func-name-matching */
    value: async function removeDaily(daily) {
        const target = await Dailies.findOne({
            where: { user_id: this.user_id, daily_name: daily }
        })
        if (target) {
            await target.destroy();
            return true;
        } else {
            return false;
        }
    }
})

Reflect.defineProperty(Characters.prototype, 'completeDaily', {
    /* eslint-disable-next-line func-name-matching */
    value: async function completeDaily(daily) {
        const target = await Dailies.findOne({
            where: { user_id: this.user_id, daily_name: daily }
        })
        if (target) {
            target.done = true;
            await target.save()
            return true;
        } else {
            return false;
        }
    }
})

Reflect.defineProperty(Characters.prototype, 'resetDaily', {
    /* eslint-disable-next-line func-name-matching */
    value: async function resetDaily() {
        try {
            const dailies = await Dailies.findAll({
                where: { user_id: this.user_id },
            });
            dailies.forEach(async (d) => {
                d.done = false;
                await d.save();
            })
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
})
module.exports = { Characters, Inventories, Tasks, Items, Dailies }