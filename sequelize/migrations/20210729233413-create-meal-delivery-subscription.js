'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('meal_delivery_subscription', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      order_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      driver: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      order_startdate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      order_enddate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      lunch_delivery: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      dinner_delivery: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      rice_addon: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      order_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      order_price: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      delivery_time: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'customers',
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
    await queryInterface.dropTable('meal_delivery_subscription');
  },
};
