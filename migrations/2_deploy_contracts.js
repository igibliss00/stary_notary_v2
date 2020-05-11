const StarNotary = artifacts.require("StarNotary");

module.exports = function (deployer) {
  deployer.deploy(StarNotary);
  deployer.link(ConvertLib, MetaCoin);
  deployer.deploy(MetaCoin);
};
