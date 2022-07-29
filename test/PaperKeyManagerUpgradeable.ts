import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import PaperKeyManagerUpgradeableConstructorArgs from "../config/PaperKeyManagerUpgradeableConstructorArgs";
import { PaperKeyManagerUpgradeable } from "../typechain-types";

type ContractType = PaperKeyManagerUpgradeable;
describe("PaperKeyManagerUpgradeable", function () {
  const GasOverrides = {
    gasLimit: 1_000_000,
    maxFeePerGas: ethers.utils.parseUnits("200", "gwei"),
    maxPriorityFeePerGas: ethers.utils.parseUnits("50", "gwei"),
  };

  async function DeployContract() {
    const mutableConstructorArgs =
      PaperKeyManagerUpgradeableConstructorArgs.slice(0);
    const [owner, randomAccount1] = await ethers.getSigners();

    const contract = await ethers.getContractFactory("PaperMultiCall");
    contract.connect(owner);
    const deployedContract = (await upgrades.deployProxy(
      contract,
      mutableConstructorArgs,
      {
        kind: "uups",
        initializer: "initialize",
      }
    )) as ContractType;
    await deployedContract.deployed();
    return {
      contract: deployedContract,
      constructorArgs: mutableConstructorArgs,
      owner,
      randomAccount1,
    };
  }

  describe("registering contract", function () {
    it("Should be able to set paper key", async function () {
      const { contract } = await loadFixture(DeployContract);
      await expect(
        contract.register("0x768e25b305aF92DC2a610ac9D7a3732D7D049573")
      ).to.emit(contract, "");
    });
  });
  describe("verifying signature", () => {
    it("Should be able to verify signature", async function () {});
    it("Should not be able to use the same signature again", async function () {});
    it("Should not be able to verify if bytes is wrong", async function () {});
    it("Should not be able to verify if _nonce is wrong", async function () {});
    it("Should not be able to verify is _signature is wrong", async function () {});
  });
  describe("update contract", () => {
    it("Should be able to update paperKey if wallet has DEFAULT_ADMIN_ROLE", async function () {});
    it("Should be able to update paperKey if wallet has DEFAULT_ADMIN_ROLE", async function () {});
    it("Should be able to update paperKey if wallet has DEFAULT_ADMIN_ROLE", async function () {});
  });
});
