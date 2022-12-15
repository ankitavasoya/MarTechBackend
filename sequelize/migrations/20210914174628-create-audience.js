'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('audiences', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      audience_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM,
        values: [
          'default',
          'active',
          'paused'
        ],
        allowNull: false,
        defaultValue: 'default',
      },
      creation_status: {
        type: Sequelize.ENUM,
        values: [
          'default',
          'inprogress',
          'created',
          'deleted'
        ],
        allowNull: false,
        defaultValue: 'default',
      },
      last_sync_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      filters: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'companys',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('audiences');
  }
};