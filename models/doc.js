'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Doc extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Doc.belongsTo(models.Carer, {
        as:'carer',
        foreignKey:{
          name:'carerId'
        }
      })
    }
  }
  Doc.init({
    file: DataTypes.STRING,
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Doc',
  });
  return Doc;
};