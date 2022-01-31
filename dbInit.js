const Sequelize = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        }
    }
});
const queryInterface = sequelize.getQueryInterface();
sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

/* Table Formats
 *
 * Characters
 * | user_id (string) | STR (int) | DEX (int) | INT (int) | WIZ (int) | Gold (int) | Stage (int) | 
 *
 * Inventories
 * | user_id (string) | item_id (int) | amount (int) | 
 *
 * Items 
 * | item_id (string) | rarity (string) | effect (string) (serialized) | 
 * 
 */

const Characters = require('./data/Characters.js')(sequelize, Sequelize.DataTypes);
const Items = require('./data/Items.js')(sequelize, Sequelize.DataTypes);
const Tasks = require('./data/Tasks.js')(sequelize, Sequelize.DataTypes);
const Dailies = require('./data/Dailies.js')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');
sequelize.sync({ force }).then(async () => {
    // await Characters.upsert({ user_id: process.env.ME, gold: 1000 });
    // await Items.upsert({ name: "God Hand", rarity: "XR", effect: "+1000000000,+1000000000,+1000000000,+1000000000" });
    // await Items.upsert({ name: "Fists", rarity: "XR", effect: "+1,+0,+0,+0" });
    // await Items.upsert({ name: "Pebble", rarity: "XR", effect: "+0,+1,+0,+0" });
    // await Items.upsert({ name: "Training Dummy", rarity: "N", effect: "P,+1,+0,+0,+0" });
    // await Items.upsert({ name: "Bullseye", rarity: "N", effect: "P,+0,+1,+0,+0" });
    // await Items.upsert({ name: "Informational Magazine", rarity: "N", effect: "P,+0,+0,+1,+0" });
    // await Items.upsert({ name: "Spell Tome", rarity: "N", effect: "P,+0,+0,+0,+1" });
    // await Items.upsert({ name: "Adventurer's Handbook", rarity: "R", effect: "P,+1,+1,+1,+1" });
    // await Items.upsert({ name: "Sharpened Blade", rarity: "SR", effect: "+15,+0,+0,+0" });
    // await Tasks.upsert({ user_id: "null", task_name: "null", timeout: new Date().toISOString() });
    // await queryInterface.addColumn('characters', 'streak', {
    //     type: Sequelize.DataTypes.INTEGER,
    //     defaultValue: 0,
    //     allowNull: false
    // });
    // await Dailies.upsert({ user_id: "null", daily_name: "null", done: false })
    console.log("Database initialized");
    sequelize.close();
}).catch(console.error);