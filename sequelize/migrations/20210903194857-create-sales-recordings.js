'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sales_recordings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      url: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      is_selected: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      is_deleted: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      sales_template_id: {
        type: Sequelize.UUID,
        references: {
          model: 'sales_templates',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('sales_recordings');
  },
};
