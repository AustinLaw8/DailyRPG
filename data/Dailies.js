/* Dailies 
 * | user_id (str) | daily_name (str) | done (bool) | 
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