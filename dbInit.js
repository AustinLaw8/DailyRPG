const Sequelize = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});
const queryInterface = sequelize.getQueryInterface();
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

const addItems = async () => {
    // await Items.upsert({ name: "God Hand", rarity: "XR", effect: "W,+1000000000,+1000000000,+1000000000,+1000000000" });
    // await Items.upsert({ name: "Fists", rarity: "XR", effect: "W,+0,+0,+0,+0" });
    // await Items.upsert({ name: "No hat", rarity: "XR", effect: "H,+0,+0,+0,+0" });
    // await Items.upsert({ name: "T-Shirt", rarity: "XR", effect: "A,+0,+0,+0,+0" });
    // await Items.upsert({ name: "Training Dummy", rarity: "N", effect: "P,+1,+0,+0,+0" });
    // await Items.upsert({ name: "Bullseye", rarity: "N", effect: "P,+0,+1,+0,+0" });
    // await Items.upsert({ name: "Informational Magazine", rarity: "N", effect: "P,+0,+0,+1,+0" });
    // await Items.upsert({ name: "Spell Tome", rarity: "N", effect: "P,+0,+0,+0,+1" });
    // await Items.upsert({ name: "Adventurer's Handbook", rarity: "R", effect: "P,+1,+1,+1,+1" });
    // await Items.upsert({ name: "Sharpened Blade", rarity: "SR", effect: "W,+15,+0,+0,+0" });
    await Items.upsert({ name: "Training Weights", rarity: "R", effect: "P,+3,+0,+0,+0" });
    await Items.upsert({ name: "Hurdles", rarity: "R", effect: "P,+0,+3,+0,+0" });
    await Items.upsert({ name: "Fancy Monocle", rarity: "R", effect: "P,+0,+0,+3,+0" });
    await Items.upsert({ name: "Ancient Runes", rarity: "R", effect: "P,+0,+0,+0,+3" });
    await Items.upsert({ name: "Kyle Jobs", rarity: "SR", effect: "A,+0,+0,+15,+0" });
    await Items.upsert({ name: "Intuit Hat", rarity: "SR", effect: "H,+0,+0,+0,+15" });
    await Items.upsert({ name: "Sharpened Blade", rarity: "SR", effect: "W,+15,+0,+0,+0" });
    await Items.upsert({ name: "Ranger's Bow", rarity: "SR", effect: "W,+0,+15,+0,+0" });
}
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

const Characters = require("./data/Characters.js")(
  sequelize,
  Sequelize.DataTypes
);
const Items = require("./data/Items.js")(sequelize, Sequelize.DataTypes);
const Tasks = require("./data/Tasks.js")(sequelize, Sequelize.DataTypes);
const Dailies = require("./data/Dailies.js")(sequelize, Sequelize.DataTypes);
const Reminders = require("./data/Reminders.js")(
  sequelize,
  Sequelize.DataTypes
);

const force = process.argv.includes("--force") || process.argv.includes("-f");
sequelize
  .sync({ force })
  .then(async () => {
    // await Characters.upsert({ user_id: process.env.ME, gold: 1000 });
    // await Tasks.upsert({ user_id: "null", task_name: "null", timeout: new Date().toISOString() });
    // await queryInterface.addColumn('characters', 'streak', {
    //     type: Sequelize.DataTypes.INTEGER,
    //     defaultValue: 0,
    //     allowNull: false
    // });
    // await Dailies.upsert({ user_id: "null", daily_name: "null", done: false })
    // await queryInterface.addColumn('characters', 'didDailies', {
    //     type: Sequelize.DataTypes.BOOLEAN,
    //     defaultValue: false,
    //     allowNull: false
    // });
    // await queryInterface.dropTable('reminders');
    // await Reminders.upsert({ user_id: "null", task_name: "null", timeout: new Date().getTime() })
    // const me = await Characters.findOne({ where: { user_id: process.env.ME } })
    // await Characters.upsert({ user_id: process.env.ME, STR: me.STR - 1000000000, DEX: me.DEX - 1000000000, WIZ: me.WIZ - 1000000000, INT: me.INT - 1000000000 });
    await addItems();
    console.log("Database initialized");
    sequelize.close();
  })
  .catch(console.error);
