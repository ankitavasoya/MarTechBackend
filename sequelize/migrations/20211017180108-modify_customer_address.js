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
        'customer_address', // table name
        'state', // new field name
        {
          type: Sequelize.STRING,
        },
      ),
      queryInterface.addColumn(
        'customer_address', // table name
        'country', // new field name
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
        'customer_address', // table name
        'state', // new field name
      ),
      queryInterface.removeColumn(
        'customer_address', // table name
        'country', // new field name
      ),
    ])
  }
};
