'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Home extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Home.belongsTo(models.User, {
        as:'user',
        foreignKey:{
          name:'userId'
        }
      })
      Home.hasMany(models.Shift, {
        as:'shifts',
        foreignKey:{
          name:'home_id'
        }
      })
    }
  }
  Home.init({
    company: DataTypes.STRING,
    postcode: DataTypes.STRING,
    adress1: DataTypes.STRING,
    city: DataTypes.STRING,
    phone: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Home',
  });
  return Home;
};