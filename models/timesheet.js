'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Timesheet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Timesheet.belongsTo(models.Carer, {
        as:'carer',
        foreignKey:{
          name:'carerId'
        },
        onDelete:'CASCADE'
      })
      Timesheet.belongsTo(models.Shift, {
        as:'shift',
        foreignKey:{
          name:'shiftId'
        },
        onDelete:'CASCADE'
      })
    }
  }
  Timesheet.init({
    authName: DataTypes.STRING,
    authPos: DataTypes.STRING,
    sign: DataTypes.STRING(10000000),
    type: DataTypes.STRING,
    homeName: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Timesheet',
  });
  return Timesheet;
};