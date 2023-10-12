'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Carer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Carer.belongsTo(models.User, {
        as:'user',
        foreignKey:{
          name:'userId'
        }
      })
      Carer.hasMany(models.Assigned, {
        as:'ass',
        foreignKey:'carerId'
      })
      Carer.hasMany(models.Timesheet, {
        as:'sheet',
        foreignKey:{
          name:"carerId"
        }
      })
      Carer.hasMany(models.Doc, {
        as:'doc',
        foreignKey:{
          name:'carerId'
        }
      })
    }
  }
  Carer.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    phone: DataTypes.STRING,
    dob: DataTypes.STRING,
    postcode: DataTypes.STRING,
    adress1: DataTypes.STRING,
    city: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Carer',
  });
  return Carer;
};