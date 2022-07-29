import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
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
    const [owner, randomAccount1, paperKeySigner] = await ethers.getSigners();

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
      paperKeySigner,
    };
  }
  function getSignatureNonce(length: number = 31) {
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let text = "";
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  async function createDefaultSignature(signer: SignerWithAddress) {
    const nonce = ethers.utils.formatBytes32String(getSignatureNonce());
    const data = ["hello", [signer.address, 22]];
    const dataType = ["string", "tuple(address, uint256)"];
    const packedData = ethers.utils.defaultAbiCoder.encode(dataType, data);
    const encodedData = ethers.utils.solidityKeccak256(["bytes"], [packedData]);

    const dataToSign = ethers.utils.arrayify(
      ethers.utils.solidityKeccak256(
        ["bytes32", "bytes32"],
        [encodedData, nonce]
      )
    );

    const signature = await signer.signMessage(dataToSign);
    const recoveredAddr = ethers.utils.recoverAddress(
      ethers.utils.hashMessage(dataToSign),
      signature
    );
    return {
      signature,
      data,
      dataType,
      packedData,
      encodedData,
      nonce,
      recoveredAddr,
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
      const { contract, owner, randomAccount1, paperKeySigner } =
        await loadFixture(DeployContract);
      const paperKey = paperKeySigner.address;

      await expect(contract.connect(owner).register(paperKey))
        .to.emit(contract, "RegisteredPaperKey")
        .withArgs(owner.address, paperKey);

      await expect(contract.connect(randomAccount1).register(paperKey))
        .to.emit(contract, "RegisteredPaperKey")
        .withArgs(randomAccount1.address, paperKey);
    });
    it("Should be able registerBatch of contract and addresses if caller is DEFAULT_ADMIN_ROLE", async function () {
      const { contract, owner, randomAccount1, paperKeySigner } =
        await loadFixture(DeployContract);
      const paperKey = paperKeySigner.address;
      await expect(
        contract
          .connect(owner)
          .registerBatch(
            [owner.address, randomAccount1.address],
            [paperKey, paperKey]
          )
      )
        .to.emit(contract, "RegisteredPaperKey")
        .withArgs(randomAccount1.address, paperKey);
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
      const { contract, owner, randomAccount1, paperKeySigner } =
        await loadFixture(DeployContract);
      const paperKey = paperKeySigner.address;
      await expect(
        contract
          .connect(owner)
          .registerBatch([owner.address, randomAccount1.address], [paperKey])
      ).to.be.revertedWith(
        "_contracts and _paperKey arguments have different length"
      );
    });
  });
  describe("verifying signature", function () {
    it("Should be able to verify signature", async function () {
      const { contract, paperKeySigner } = await loadFixture(DeployContract);
      const { signature, encodedData, nonce } = await createDefaultSignature(
        paperKeySigner
      );
      await contract.register(paperKeySigner.address);

      await expect(contract.verify(encodedData, nonce, signature))
        .to.emit(contract, "Verified")
        .withArgs(nonce, signature);
    });
    it("Should not be able to use the same signature again", async function () {
      const { contract, paperKeySigner } = await loadFixture(DeployContract);
      const { signature, encodedData, nonce } = await createDefaultSignature(
        paperKeySigner
      );
      await contract.register(paperKeySigner.address);

      await expect(contract.verify(encodedData, nonce, signature))
        .to.emit(contract, "Verified")
        .withArgs(nonce, signature);
      await expect(
        contract.verify(encodedData, nonce, signature)
      ).to.be.revertedWith("Signature already used");
    });
    it("Should not be able to verify if bytes is wrong", async function () {
      const { contract, paperKeySigner } = await loadFixture(DeployContract);
      const { signature, nonce } = await createDefaultSignature(paperKeySigner);
      await contract.register(paperKeySigner.address);

      await expect(
        contract.verify(ethers.utils.randomBytes(32), nonce, signature)
      ).to.be.revertedWith("Invalid signature or hash");
    });

    it("Should not be able to verify if _nonce is wrong", async function () {
      const { contract, paperKeySigner } = await loadFixture(DeployContract);
      const { signature, encodedData } = await createDefaultSignature(
        paperKeySigner
      );
      await contract.register(paperKeySigner.address);
      const newNonce = ethers.utils.formatBytes32String(getSignatureNonce());
      await expect(
        contract.verify(encodedData, newNonce, signature)
      ).to.be.revertedWith("Invalid signature or hash");
    });
    it("Should not be able to verify is _signature is wrong", async function () {
      const { contract, owner, paperKeySigner } = await loadFixture(
        DeployContract
      );
      const { nonce, encodedData } = await createDefaultSignature(
        paperKeySigner
      );
      await contract.register(paperKeySigner.address);
      const ownerSigned = owner.signMessage(
        ethers.utils.arrayify(
          ethers.utils.solidityKeccak256(
            ["bytes32", "bytes32"],
            [encodedData, nonce]
          )
        )
      );

      await expect(
        contract.verify(encodedData, nonce, ownerSigned)
      ).to.be.revertedWith("Invalid signature or hash");
    });
  });

  describe("update contract", function () {
    it("Should be able to update paperKey if wallet has DEFAULT_ADMIN_ROLE and emit UpdatePaperKey event", async function () {});
    it("Should be able updateBatch paperKey if wallet has DEFAULT_ADMIN_ROLE", async function () {});
    it("Should not be able to update paperKey if wallet does not  have DEFAULT_ADMIN_ROLE", async function () {});
    it("Should not be able updateBatch paperKey if wallet does not have DEFAULT_ADMIN_ROLE", async function () {});
  });
});
