/* Inventory 
 * | user_id (str) | item_id (int) | amount (int) | 
 */

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('inventories', {
		user_id: DataTypes.STRING,
		item_id: DataTypes.INTEGER,
        amount: {
			type: DataTypes.INTEGER,
			allowNull: false,
			'default': 0,
        },
    }, {
        timestamps: false,
    });
};