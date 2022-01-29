/* Items 
 * | item_id (int) | rarity (string) | effect (string) | 
 */

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('items', {
        name: {
            type: DataTypes.STRING,
            unique: true,
        },
        rarity: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        effect: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: false,
    });
};