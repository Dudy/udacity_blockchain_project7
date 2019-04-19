var migrations = artifacts.require("Migrations");

module.exports = function(deployer) {
    deployer.deploy(migrations);
};
