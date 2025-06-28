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
    }
  }
  User.init({
    fullName: DataTypes.STRING,
    email: DataTypes.STRING,
    phoneNo: DataTypes.STRING,
    profile: DataTypes.STRING,
    password: DataTypes.STRING,
    country: DataTypes.STRING,
    referralCode: DataTypes.STRING,
    emailVerified: DataTypes.BOOLEAN,
    balance: DataTypes.FLOAT,
    withdrawBalance: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};