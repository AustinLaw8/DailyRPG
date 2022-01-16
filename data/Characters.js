/* Characters
 * | user_id (string) | STR (int) | DEX (int) | INT (int) | WIZ (int) | Gold (int) | Stage (int) | 
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
        }
    }, {
        timestamps: false,
    });
};