'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Kyc extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Kyc.init({
    selfieImage: DataTypes.STRING,
    documentImage: DataTypes.STRING,
    documentType: DataTypes.STRING,
    status: DataTypes.STRING,
    paymentId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Kyc',
  });
  return Kyc;
};