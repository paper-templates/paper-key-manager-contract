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

  const PAPER_KEY = "0x768e25b305aF92DC2a610ac9D7a3732D7D049573";

  async function DeployContract() {
    const mutableConstructorArgs =
      PaperKeyManagerUpgradeableConstructorArgs.slice(0);
    const [owner, randomAccount1] = await ethers.getSigners();

    const contract = await ethers.getContractFactory(
      "PaperKeyManagerUpgradeable"
    );
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

  describe("Deployment", function () {
    it("Should have wallet deploying contract be given DEFAULT_ADMIN_ROLE", async function () {
      const { contract, owner } = await loadFixture(DeployContract);
      expect(
        await contract.hasRole(
          await contract.DEFAULT_ADMIN_ROLE(),
          owner.address
        )
      ).to.be.true;
    });
  });

  describe("registering contract", function () {
    it("Should be able to set paper key and emit RegisteredPaperKey event for caller", async function () {
      const { contract, owner, randomAccount1 } = await loadFixture(
        DeployContract
      );

      await expect(contract.connect(owner).register(PAPER_KEY))
        .to.emit(contract, "RegisteredPaperKey")
        .withArgs(owner.address, PAPER_KEY);

      await expect(contract.connect(randomAccount1).register(PAPER_KEY))
        .to.emit(contract, "RegisteredPaperKey")
        .withArgs(randomAccount1.address, PAPER_KEY);
    });
    it("Should be able registerBatch of contract and addresses if caller is DEFAULT_ADMIN_ROLE", async function () {
      const { contract, owner, randomAccount1 } = await loadFixture(
        DeployContract
      );
      await expect(
        contract
          .connect(owner)
          .registerBatch(
            [owner.address, randomAccount1.address],
            [PAPER_KEY, PAPER_KEY]
          )
      )
        .to.emit(contract, "RegisteredPaperKey")
        .withArgs(randomAccount1.address, PAPER_KEY);
    });
    it("Should not be able registerBatch of contract and addresses if caller is not DEFAULT_ADMIN_ROLE", async function () {
      const { contract, owner, randomAccount1 } = await loadFixture(
        DeployContract
      );
      await expect(
        contract.connect(randomAccount1).registerBatch([], [])
      ).to.be.revertedWith(
        "AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"
      );
    });
    it("Should not be able to registerBatch with mismatch contracts and paperKeys", async function () {
      const { contract, owner, randomAccount1 } = await loadFixture(
        DeployContract
      );
      await expect(
        contract
          .connect(owner)
          .registerBatch([owner.address, randomAccount1.address], [PAPER_KEY])
      ).to.be.revertedWith(
        "_contracts and _paperKey arguments have different length"
      );
    });
  });
  describe("verifying signature", function () {
    it("Should be able to verify signature", async function () {
      const { contract, owner, randomAccount1 } = await loadFixture(
        DeployContract
      );
    });
    it("Should not be able to use the same signature again", async function () {});
    it("Should not be able to verify if bytes is wrong", async function () {});
    it("Should not be able to verify if _nonce is wrong", async function () {});
    it("Should not be able to verify is _signature is wrong", async function () {});
  });
  describe("update contract", function () {
    it("Should be able to update paperKey if wallet has DEFAULT_ADMIN_ROLE and emit UpdatePaperKey event", async function () {});
    it("Should be able updateBatch paperKey if wallet has DEFAULT_ADMIN_ROLE", async function () {});
    it("Should not be able to update paperKey if wallet does not  have DEFAULT_ADMIN_ROLE", async function () {});
    it("Should not be able updateBatch paperKey if wallet does not have DEFAULT_ADMIN_ROLE", async function () {});
  });
});
