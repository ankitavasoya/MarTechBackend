'use strict';

const { ALL_ROLES_ARRAY } = require('../../src/utils/constants');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      twilio_phone: {
        type: Sequelize.STRING,
      },
      mobile_phone: {
        type: Sequelize.STRING,
      },
      twilio_country_code: {
        type: Sequelize.STRING,
      },
      mobile_country_code: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      company_id: {
        type: Sequelize.UUID,
        references: {
          model: 'companys',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      roleType: {
        type: Sequelize.ENUM,
        values: ALL_ROLES_ARRAY,
        allowNull: false,
        defaultValue: 'none',
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
    await queryInterface.dropTable('users');
  },
};
