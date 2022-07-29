import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers, upgrades } from "hardhat";
import ConstructorArgs from "../config/ConstructorArgs";

const IERC20 =
  "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol:ERC20Upgradeable";

// In case we change the contract name in the future
type PaperMultiCallContractType = PaperMultiCall;

describe("PaperMultiCall", function () {
  const GasOverrides = {
    gasLimit: 1_000_000,
    maxFeePerGas: ethers.utils.parseUnits("200", "gwei"),
    maxPriorityFeePerGas: ethers.utils.parseUnits("50", "gwei"),
  };
  const USDC_WHALE = "0xCaC437276CF7A033658445E7F0aB03FA3eAd447d";
  const USDC_CONTRACT_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

  async function DeployPaperMultiCall() {
    const mutableConstructorArgs = ConstructorArgs.slice(0);
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
    )) as PaperMultiCallContractType;
    await deployedContract.deployed();
    return {
      contract: deployedContract,
      constructorArgs: mutableConstructorArgs,
      owner,
      randomAccount1,
    };
  }

  async function getUsdcContract() {
    const usdcSigner = await ethers.getImpersonatedSigner(USDC_WHALE);
    const usdcContract = (await ethers.getContractAt(
      IERC20,
      USDC_CONTRACT_ADDRESS,
      usdcSigner
    )) as ERC20Upgradeable;
    return usdcContract;
  }

  async function transferUsdcToContract(
    contract: Contract,
    usdcToSend: string = "20"
  ) {
    const usdcContract = await getUsdcContract();
    return await usdcContract.transfer(
      contract.address,
      ethers.utils.parseUnits(usdcToSend, "6"),
      {
        ...GasOverrides,
      }
    );
  }
  async function assertERC20Balance(
    contract: ERC20Upgradeable,
    address: string,
    amountInEther: string
  ) {
    expect(await contract.balanceOf(address)).to.deep.equal(
      ethers.utils.parseUnits(amountInEther, await contract.decimals())
    );
  }

  async function verifyRole(
    role: string,
    roleAddresses: string[],
    imposterAddresses: string[]
  ) {}

  describe("Deployment", function () {
    it("Should set the correct roles for ADMIN_ROLE", async function () {
      const { constructorArgs, contract, owner, randomAccount1 } =
        await loadFixture(DeployPaperMultiCall);
      const role = await contract.DEFAULT_ADMIN_ROLE();

      for (const addresses of constructorArgs) {
        for (const address of addresses) {
          expect(await contract.hasRole(role, address)).to.be.false;
        }
      }
      expect(await contract.hasRole(role, randomAccount1.address)).to.be.false;
      expect(await contract.hasRole(role, owner.address)).to.be.true;
    });
    it("Should set the correct roles for PAUSER_ROLE", async function () {
      const { constructorArgs, contract, owner, randomAccount1 } =
        await loadFixture(DeployPaperMultiCall);
      const pauserAddress = constructorArgs[0];
      const role = await contract.PAUSER_ROLE();
      for (const address of pauserAddress) {
        expect(await contract.hasRole(role, address)).to.be.true;
      }

      for (const addresses of constructorArgs.slice(1)) {
        for (const address of addresses) {
          expect(await contract.hasRole(role, address)).to.be.false;
        }
      }
      expect(await contract.hasRole(role, randomAccount1.address)).to.be.false;
      expect(await contract.hasRole(role, owner.address)).to.be.true;
    });
    it("Should set the correct roles for UPGRADER_ROLE", async function () {
      const { constructorArgs, contract, owner, randomAccount1 } =
        await loadFixture(DeployPaperMultiCall);
      const roleAddresses = constructorArgs[1];
      const role = await contract.PAUSER_ROLE();
      for (const address of roleAddresses) {
        expect(await contract.hasRole(role, address)).to.be.true;
      }

      for (const addresses of constructorArgs
        .slice(2)
        .concat(constructorArgs[0])) {
        for (const address of addresses) {
          expect(await contract.hasRole(role, address)).to.be.false;
        }
      }
      expect(await contract.hasRole(role, randomAccount1.address)).to.be.false;
      expect(await contract.hasRole(role, owner.address)).to.be.true;
    });
    it("Should set the correct roles for WITHDRAW_ROLE", async function () {});
    it("Should set the correct roles for CALLER_ROLE", async function () {});
  });

  describe("Moving ERC20 Token", function () {
    it("Should be able to receive funds", async function () {
      const { contract } = await loadFixture(DeployPaperMultiCall);
      const usdcContract = await getUsdcContract();
      const amountString = "20";
      const amountBigNumber = ethers.utils.parseUnits(amountString, "6");
      await expect(
        transferUsdcToContract(contract, amountString)
      ).to.changeTokenBalance(usdcContract, contract, amountBigNumber);
    });

    it("Should be able to transfer funds out using WITHDRAW_ROLE and the contract is not paused", async function () {
      const { contract, randomAccount1, owner } = await loadFixture(
        DeployPaperMultiCall
      );
      const usdcContract = await getUsdcContract();

      const amountString = "20";
      const amountBigNumber = ethers.utils.parseUnits(amountString, "6");
      await expect(
        transferUsdcToContract(contract, amountString)
      ).to.changeTokenBalance(usdcContract, contract, amountBigNumber);

      await expect(
        contract
          .connect(owner)
          .withdrawTokens(
            USDC_CONTRACT_ADDRESS,
            amountBigNumber,
            randomAccount1.address
          )
      ).to.changeTokenBalances(
        usdcContract,
        [randomAccount1, contract],
        [amountBigNumber, -amountBigNumber]
      );
    });

    it("Should not be able to transfer funds out without WITHDRAW_ROLE", async function () {
      const { contract, randomAccount1, owner } = await loadFixture(
        DeployPaperMultiCall
      );
      const usdcContract = await getUsdcContract();
      const amountString = "20";
      const amountBigNumber = ethers.utils.parseUnits(amountString, "6");

      await transferUsdcToContract(contract, amountString);

      await expect(
        contract
          .connect(randomAccount1)
          .withdrawTokens(
            USDC_CONTRACT_ADDRESS,
            ethers.utils.parseUnits("20", "6"),
            randomAccount1.address
          )
      ).to.be.revertedWith("Not allowed");
    });

    it("Should not be able to transfer funds out when contract is paused", async function () {
      const { contract, randomAccount1, owner } = await loadFixture(
        DeployPaperMultiCall
      );
      await transferUsdcToContract(contract, "20");
      await contract.pause();

      await expect(
        contract
          .connect(owner)
          .withdrawTokens(
            USDC_CONTRACT_ADDRESS,
            ethers.utils.parseUnits("20", "6"),
            randomAccount1.address
          )
      ).to.be.revertedWith("Pausable: paused");
    });
  });

  describe("Calling other function", function () {
    it("Should be able to call 'callSingleTransaction' using CALLER_ROLE and the contract is not paused", async function () {
      const { contract, randomAccount1, owner } = await loadFixture(
        DeployPaperMultiCall
      );
      const usdcContract = await getUsdcContract();

      expect(
        await usdcContract.allowance(
          await usdcContract.signer.getAddress(),
          contract.address
        )
      ).to.deep.equal(ethers.BigNumber.from(0));
      expect(await contract.signer.getAddress()).to.equal(owner.address);

      await contract.callSingleTransaction(
        [USDC_CONTRACT_ADDRESS],
        [
          usdcContract.interface.encodeFunctionData("increaseAllowance", [
            randomAccount1.address,
            ethers.utils.parseUnits("1", "6"),
          ]),
        ]
      );

      expect(
        await usdcContract.allowance(contract.address, randomAccount1.address)
      ).to.deep.equal(ethers.utils.parseUnits("1", "6"));
    });
    it("Should be able to call a single function", async function () {});
    it("Should be able to call two functions in one transaction", async function () {});
    it("Should fail both function if any one of the two function fails", async function () {});
    it("Should not be able to call the function out without CALLER_ROLE", async function () {});
    it("Should not be able to call the function when contract is paused", async function () {});
  });
});

// describe("Lock", function () {
//   // We define a fixture to reuse the same setup in every test.
//   // We use loadFixture to run this setup once, snapshot that state,
//   // and reset Hardhat Network to that snapshopt in every test.
//   async function deployOneYearLockFixture() {
//     const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
//     const ONE_GWEI = 1_000_000_000;

//     const lockedAmount = ONE_GWEI;
//     const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

//     // Contracts are deployed using the first signer/account by default
//     const [owner, otherAccount] = await ethers.getSigners();

//     const Lock = await ethers.getContractFactory("Lock");
//     const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

//     return { lock, unlockTime, lockedAmount, owner, otherAccount };
//   }

//   describe("Withdrawals", function () {
//     describe("Events", function () {
//       it("Should emit an event on withdrawals", async function () {
//         const { lock, unlockTime, lockedAmount } = await loadFixture(
//           deployOneYearLockFixture
//         );

//         await time.increaseTo(unlockTime);

//         await expect(lock.withdraw())
//           .to.emit(lock, "Withdrawal")
//           .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
//       });
//     });
