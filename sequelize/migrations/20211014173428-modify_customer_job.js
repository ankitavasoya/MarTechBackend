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
        'customer_company_name', // new field name
        {
          type: Sequelize.STRING,
        },
      ),
      queryInterface.addColumn(
        'customers', // table name
        'customer_job_title', // new field name
        {
          type: Sequelize.STRING,
        },
      ),
      queryInterface.addColumn(
        'customers', // table name
        'first_name', // new field name
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: '',
        },
      ),
      queryInterface.addColumn(
        'customers', // table name
        'last_name', // new field name
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: '',
        },
      ),
      queryInterface.addColumn(
        'customers', // table name
        'tag_id', // new field name
        {
          type: Sequelize.UUID,
          references: {
            model: 'customer_tags',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
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
        'customer_company_name', // new field name
      ),
      queryInterface.removeColumn(
        'customers', // table name
        'customer_job_title', // new field name
      ),
      queryInterface.removeColumn(
        'customers', // table name
        'tag_id', // new field name
      ),
      queryInterface.removeColumn(
        'customers', // table name
        'first_name', // new field name
      ),
      queryInterface.removeColumn(
        'customers', // table name
        'last_name', // new field name
      ),
    ])
  }
};
