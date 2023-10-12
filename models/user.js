'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasOne(models.Carer, {
        as:'carer',
        foreignKey:{
          name:'userId'
        }
      })
      User.hasOne(models.Home, {
        as:'home',
        foreignKey:{
          name:'userId'
        }
      })
      User.hasOne(models.Agency, {
        as:'agency',
        foreignKey:{
          name:'userId'
        }
      })
    }
  }
  User.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: {
      type:DataTypes.STRING,
      defaultValue:'CARER',
      allowNull:false
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName:'users'
  });
  return User;
};