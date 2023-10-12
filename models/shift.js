'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Shift extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Shift.belongsTo(models.Home, {
        as:'home',
        foreignKey:{
          name:'home_id'
        }
      })
      Shift.hasMany(models.Assigned, {
        as:'ass',
        foreignKey:'shiftId',
        onDelete:'cascade',
        onUpdate:"cascade"
      })
      Shift.hasMany(models.Timesheet, {
        as:'sheet',
        foreignKey:{
          name:'shiftId'
        },
        onDelete:"CASCADE"
      })
    }
  }
  Shift.init({
    date:DataTypes.DATE,
    longday: DataTypes.INTEGER,
    night: DataTypes.INTEGER,
    late: DataTypes.INTEGER,
    early: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Shift',
  });
  return Shift;
};