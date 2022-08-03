import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

import "./task/deploy-upgradeable-contract";
import "./task/upgrade-contract";

dotenv.config();

/*
 * If you have issues with stuck transactions or you simply want to invest in
 * higher gas fees in order to make sure your transactions will run smoother
 * and faster, then you can update the followind value.
 * This value is used by default in any network defined in this project, but
 * please make sure to add it manually if you define any custom network.
 *
 * Example:
 * Setting the value to "1.1" will raise the gas values by 10% compared to the
 * estimated value.
 */
const DEFAULT_GAS_MULTIPLIER: number = 1;

// Api Keys
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const POLYGON_BLOCK_EXPLORER_API_KEY =
  process.env.POLYGON_BLOCK_EXPLORER_API_KEY;
const ETH_BLOCK_EXPLORER_API_KEY = process.env.ETH_BLOCK_EXPLORER_API_KEY;
const EVM_PRIVATE_KEY = process.env.EVM_PRIVATE_KEY;

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: { sources: "./contracts" },
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
        // to enable caching for speeding up tests
        blockNumber: 15136645,
      },
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [EVM_PRIVATE_KEY!],
      gasMultiplier: DEFAULT_GAS_MULTIPLIER,
    },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [EVM_PRIVATE_KEY!],
      gasMultiplier: DEFAULT_GAS_MULTIPLIER,
    },
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [EVM_PRIVATE_KEY!],
      gasMultiplier: DEFAULT_GAS_MULTIPLIER,
    },
    matic: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [EVM_PRIVATE_KEY!],
      gasMultiplier: DEFAULT_GAS_MULTIPLIER,
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [EVM_PRIVATE_KEY!],
      gasMultiplier: DEFAULT_GAS_MULTIPLIER,
    },
  },
  etherscan: {
    apiKey: {
      // Ethereum
      rinkeby: ETH_BLOCK_EXPLORER_API_KEY as string,
      goerli: ETH_BLOCK_EXPLORER_API_KEY as string,
      mainnet: ETH_BLOCK_EXPLORER_API_KEY as string,

      // Polygon
      polygon: POLYGON_BLOCK_EXPLORER_API_KEY as string,
      polygonMumbai: POLYGON_BLOCK_EXPLORER_API_KEY as string,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
  },
};

export default config;
