'use strict';
module.exports = function(sequelize, DataTypes) {
  var Floor = sequelize.define('Floor', {
    floor: DataTypes.INTEGER,
    individual: DataTypes.STRING,
    type: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here

      }
    }
  });
  Floor.associate = (models) => {
    Floor.belongsTo(models.Lot)
  }
  return Floor;
};