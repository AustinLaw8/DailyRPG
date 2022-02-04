/* Characters
 * | user_id (string) | STR (int) | DEX (int) | INT (int) | WIZ (int) | Gold (int) | Stage (int) | weapon, armor, hat TODO | streak (int) | didDailies (bool) |
 * Eventually, we want hat and armor 
 */

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('characters', {
        user_id: {
            type: DataTypes.STRING,
            primaryKey: true,
            unique: true,
        },
        gold: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        STR: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
        },
        DEX: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
        },
        INT: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
        },
        WIZ: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
        },
        stage: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
        },
        weapon: {
            type: DataTypes.STRING,
            defaultValue: "Fists",
            allowNull: false,
        },
        hat: {
            type: DataTypes.STRING,
            defaultValue: "No hat",
            allowNull: false,
        },
        armor: {
            type: DataTypes.STRING,
            defaultValue: "T-Shirt",
            allowNull: false,
        },
        streak: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        didDailies: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        }
    }, {
        timestamps: false,
    });
};