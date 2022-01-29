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

const force = process.argv.includes('--force') || process.argv.includes('-f');
sequelize.sync({ force }).then(async () => {
    await Characters.upsert({ user_id: process.env.ME });
    await Items.upsert({ name: "God Hand", rarity: "XR", effect: "+1000000000,+1000000000,+1000000000,+1000000000"});
    await Items.upsert({ name: "Fists", rarity: "XR", effect: "+1,+0,+0,+0"});
    await Items.upsert({ name: "Pebble", rarity: "XR", effect: "+0,+1,+0,+0"});
    await Tasks.create({ user_id: "null", task_name: "null", timeout: new Date().toISOString() });
    console.log("Database initialized");
    sequelize.close();
}).catch(console.error);