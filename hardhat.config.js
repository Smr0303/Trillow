require("dotenv").config()
require("@nomicfoundation/hardhat-toolbox");


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    localhost:{
      allowUnlimitedContractSize: true,
    },
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: [
        `0x4aef616df22eb6ad446b91ec21b40baa6ee6aa91679a9a8397e17261625123ea`,
        `0x8fad5650d6eddc81720bff0aedd5d9ebc2da361d3f61c5b7d390dae695c81452`,
        `2fcac7dba35855f5e6373b4caa2f2ea11d4b4943f9623fd296c09cde7447faf7`,
        `f45215d84878f7cdc961ce59bcb514cd3e8ef71b96775b8a12e0cb5f562aed95`

      ],
    },
    sepolia: {
      url: process.env.RPC_URL,
      accounts: process.env.PRIVATE_KEY !== undefined && process.env.PRIVATE_KEY1 != undefined &&  process.env.PRIVATE_KEY2 != undefined && process.env.PRIVATE_KEY3 != undefined ?
          [process.env.PRIVATE_KEY,process.env.PRIVATE_KEY1,process.env.PRIVATE_KEY2,process.env.PRIVATE_KEY3] : [],
      saveDeployments:true,
      chainId: 11155111, //for rinkeby
      blockConfirmations:5,
    },
  },
};
