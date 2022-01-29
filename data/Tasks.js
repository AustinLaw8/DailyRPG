/* Tasks 
 * | user_id (str) | task_name (str) | timeout (date) | 
 */

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('tasks', {
		user_id: DataTypes.STRING,
		task_name: DataTypes.STRING,
        timeout: {
			type: DataTypes.DATE,
			allowNull: false,
            'default': 0
        },
    }, {
        timestamps: false,
    });
};