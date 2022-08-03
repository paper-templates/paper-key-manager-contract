import { task, types } from "hardhat/config";

interface IDeployContract {
  contractName: string;
  initializerName: string;
  initializerArgs: Array<any>;
  initializerArgPath: string;
}
task<IDeployContract>(
  "deployUpgradeableContract",
  "Deploy [contractName] to the network of your choice"
)
  .addParam(
    "contractName",
    "The Name of the new contract that is to be deployed",
    undefined,
    types.string
  )
  .addParam(
    "initializerName",
    "The name of the initializer function in your upgradeable contract",
    "initialize",
    types.string
  )
  .addOptionalParam(
    "initializerArgs",
    "List of parameters to be passed into the initializer. Will override initializerArgPath if set.",
    undefined,
    types.json
  )
  .addOptionalParam(
    "initializerArgPath",
    "Path from the /task directory to the file containing the constructor argument. Will be over-written by initializerArgs if set",
    "../config/ConstructorArgs",
    types.string
  )
  .setAction(
    async (
      {
        contractName,
        initializerArgs,
        initializerName,
        initializerArgPath,
      }: IDeployContract,
      { ethers, upgrades, run }
    ) => {
      await run("compile");
      let args = initializerArgs;
      if (!args) {
        args = (await import(initializerArgPath)).default.slice(0);
      }
      const contract = await ethers.getContractFactory(contractName);
      const deployedContract = await upgrades.deployProxy(contract, args, {
        kind: "uups",
        initializer: initializerName,
      });
      await deployedContract.deployed();
      console.log(`Contract deployed to: ${deployedContract.address}`);

      await run("verify", { address: deployedContract.address });
    }
  );
