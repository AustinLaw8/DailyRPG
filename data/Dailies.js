/* Tasks 
 * | user_id (str) | task_name (str) | timeout (date) | 
 */

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('dailies', {
        user_id: DataTypes.STRING,
        daily_name: DataTypes.STRING,
        done: DataTypes.BOOLEAN,
    }, {
        timestamps: false,
    });
};