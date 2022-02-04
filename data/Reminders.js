/* Reminders 
 * | user_id (str) | channel (str) | reminder (str) | timeout (date) | 
 */

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('reminders', {
        user_id: DataTypes.STRING,
        channel: DataTypes.STRING,
        reminder: DataTypes.STRING,
        timeout: DataTypes.DATE,
    }, {
        timestamps: false,
    });
};