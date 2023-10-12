'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Agency extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Agency.belongsTo(models.User,{
        foreignKey:'userId',
        as:'user'
      })
    }
  }
  Agency.init({
    company: DataTypes.TEXT,
    address1: DataTypes.TEXT,
    country: DataTypes.TEXT,
    postcode: DataTypes.TEXT,
    city: DataTypes.TEXT,
    phone: DataTypes.STRING,
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Agency',
    tableName:'agency'
  });
  return Agency;
};