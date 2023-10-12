'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Assigned extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Assigned.belongsTo(models.Carer, {
        as:'carer',
        foreignKey:'carerId'
      })
      Assigned.belongsTo(models.Shift, {
        as:'shift',
        foreignKey:'shiftId'
      })
    }
  }
  Assigned.init({
    type: DataTypes.STRING,
    covered: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Assigned',
  });
  return Assigned;
};