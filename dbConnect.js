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
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URI, {
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


sequelize.authenticate()
  .then(() => { console.log('Connection has been established successfully.'); })
  .catch(err => { console.error('Unable to connect to the database:', err); });

Inventories.belongsTo(Items, { foreignKey: 'item_id', as: 'item' });

Reflect.defineProperty(Characters.prototype, 'addItem', {
	/* eslint-disable-next-line func-name-matching */
    value: async function addItem(item) {
        const userItem = await Inventories.findOne({
            where: {user_id: this.user_id, item_id: item.id},
        });
        
        if (userItem) {
            userItem.amount += 1;
            return userItem.save();
        } else {
            return Inventories.create({user_id: this.user_id, item_id: item.id, amount: 1})
        }
    }
})

Reflect.defineProperty(Characters.prototype, 'getStats', {
	/* eslint-disable-next-line func-name-matching */
	value: async function getStats() {
		const user = await Characters.findOne({
            where: {user_id: this.user_id },
        });
        return `Gold :coin:: ${user.gold}\nSTR :muscle:: ${user.STR}\nDEX :bow_and_arrow:: ${user.DEX}\nINT :book:: ${user.INT}\nWIZ :brain:: ${user.WIZ}\nStage: :european_castle:: ${user.stage}\nCurrent Equipment: ${user.weapon}, ${user.hat}, ${user.armor}.`;
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

module.exports = { Characters, Inventories, Items }