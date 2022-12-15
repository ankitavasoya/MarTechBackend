'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('campaign_steps', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      campaign_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'campaigns',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      step_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      step_index: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      step_delay_time: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      step_delay_value: {
        type: Sequelize.STRING,
      },
      step_campaign_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      step_campaign_content_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      step_sales_template_id: {
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
    await queryInterface.dropTable('campaign_steps');
  },
};
