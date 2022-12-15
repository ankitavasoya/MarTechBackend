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
        'users', // table name
        'receiving_call', // new field name
        {
          type: Sequelize.STRING,
        },
      ),
      queryInterface.addColumn(
        'users', // table name
        'is_available', // new field name
        {
          type: Sequelize.BOOLEAN,
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
        'users', // table name
        'receiving_call', // new field name
      ),
      queryInterface.removeColumn(
        'users', // table name
        'is_available', // new field name
      )
    ])
  }
};
