'use strict';
module.exports = function(sequelize, DataTypes) {
  var Lot = sequelize.define('Lot', {
    col: DataTypes.INTEGER,
    row: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
      }
    }
  });
  Lot.associate = (models) => {
    Lot.hasMany(models.Floor, {as: 'floors'})
  }
  return Lot;
};