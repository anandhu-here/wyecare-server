'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Timesheets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      authName: {
        type: Sequelize.STRING
      },
      authPos: {
        type: Sequelize.STRING
      },
      sign: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      homeName: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(()=>{
      return queryInterface.addColumn('Timesheets', 'shiftId', {
        type:Sequelize.INTEGER,
        references:{
          model:'Shifts',
          key:'id'
        },
        onDelete:'cascade'
      })
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Timesheets')
  }
};