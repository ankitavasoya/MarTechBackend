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
        'customers', // table name
        'is_unsubscribe_from_campaign', // new field name
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
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
        'customers', // table name
        'is_unsubscribe_from_campaign', // new field name
      ),
    ])
  }
};
