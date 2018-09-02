var RockPaperScissors = artifacts.require("./RockPaperScissors.sol");

var minWage = web3.toWei(0.5,"ether");
module.exports = function(deployer) {

  deployer.deploy(RockPaperScissors, minWage);
};
                    