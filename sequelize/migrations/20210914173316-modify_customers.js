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
        'company_id', // new field name
        {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'companys',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
      ),
      queryInterface.addColumn(
        'customers', // table name
        'is_deleted', // new field name
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
        'company_id', // new field name
      ),
      queryInterface.removeColumn(
        'customers', // table name
        'is_deleted', // new field name
      ),
    ])
  }
};
