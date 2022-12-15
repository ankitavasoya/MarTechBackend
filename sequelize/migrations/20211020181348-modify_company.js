'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return Promise.all([
      queryInterface.addColumn(
        'companys', // table name
        'twilio_api_key', // new field name
        {
          type: Sequelize.STRING,
        },
      ),
      queryInterface.addColumn(
        'companys', // table name
        'twilio_api_secret', // new field name
        {
          type: Sequelize.STRING,
        },
      ),
      queryInterface.addColumn(
        'companys', // table name
        'twilio_account_sid', // new field name
        {
          type: Sequelize.STRING,
        },
      ),
      queryInterface.addColumn(
        'companys', // table name
        'twilio_auth_token', // new field name
        {
          type: Sequelize.STRING,
        },
      ),
    ])
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return Promise.all([
      queryInterface.removeColumn(
        'companys', // table name
        'twilio_api_key', // new field name
      ),
      queryInterface.removeColumn(
        'companys', // table name
        'twilio_api_secret', // new field name
      ),
      queryInterface.removeColumn(
        'companys', // table name
        'twilio_account_sid', // new field name
      ),
      queryInterface.removeColumn(
        'companys', // table name
        'twilio_auth_token', // new field name
      ),
    ])
  }
};
