'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CancelRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CancelRequest.init({
    name: DataTypes.STRING,
    shiftId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'CancelRequest',
  });
  return CancelRequest;
};