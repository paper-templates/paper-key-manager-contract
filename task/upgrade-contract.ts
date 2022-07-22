import { task, types } from "hardhat/config";

interface IUpgradeContract {
  contractAddress: string;
  newContractName: string;
}
task<IUpgradeContract>(
  "upgradeContract",
  "Upgrade the contract at a given address"
)
  .addParam(
    "contractAddress",
    "The contract address that is to be upgraded",
    undefined,
    types.string
  )
  .addParam(
    "newContractName",
    "The Name of the new contract that is to replace the contract specified in [contractAddress]",
    undefined,
    types.string
  )
  .setAction(
    async (
      { contractAddress, newContractName }: IUpgradeContract,
      { ethers, upgrades }
    ) => {
      const newContract = await ethers.getContractFactory(newContractName);
      const deployedContract = await upgrades.upgradeProxy(
        contractAddress,
        newContract,
        { kind: "uups" }
      );
      console.log(`Contract updated. Address: ${deployedContract.address}`);
    }
  );
