// todo: make it compile

describe("Paper mint function", function () {
  let owner!: SignerWithAddress;
  let paperKeySigner!: SignerWithAddress;
  let externalUser!: SignerWithAddress;
  let recipient!: SignerWithAddress;
  let contract!: NftContractType;

  // signature stuff
  let domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
  };
  const types = {
    PrimaryData: [
      {
        name: "recipient",
        type: "address",
      },
      { name: "quantity", type: "uint256" },
      { name: "tokenId", type: "uint256" },
      { name: "nonce", type: "bytes32" },
    ],
  };
  const tokenIds = getTokenIds();

  let message!: {
    recipient: string;
    quantity: number;
    tokenId: number;
    nonce: string;
  };

  before(async function () {
    [owner, externalUser, paperKeySigner, recipient] =
      await ethers.getSigners();

    const Contract = await ethers.getContractFactory(
      CollectionConfig.contractName
    );
    Contract.connect(owner);
    contract = (await Contract.deploy(
      paperKeySigner.address,
      ...ContractArguments.slice(1)
    )) as NftContractType;
    await contract.deployed();

    const mintDetails = CollectionConfig.mintDetails[0];

    await contract
      .connect(owner)
      .launchToken(
        mintDetails.tokenId,
        ethers.utils.parseEther(mintDetails.priceInEther.toString()),
        mintDetails.maxSupply,
        mintDetails.maxMintPerTx,
        mintDetails.uri
      );

    domain = {
      name: "Paper",
      version: "1",
      chainId: await paperKeySigner.getChainId(),
      verifyingContract: contract.address,
    };
    message = {
      recipient: recipient?.address,
      quantity: 1,
      tokenId: getFirstTokenId(tokenIds),
      nonce: ethers.utils.formatBytes32String(nonce(31)),
    };
  });

  it("Paper generated signature can mint", async function () {
    const signature = await paperKeySigner._signTypedData(
      domain,
      types,
      message
    );

    await contract.paperMint(
      message.recipient,
      message.quantity,
      message.tokenId,
      message.nonce,
      signature
    );

    expect(
      await contract.balanceOf(recipient.address, getFirstTokenId(tokenIds))
    ).deep.equal(BigNumber.from(1));
  });
  it("Minting with the same signature again should fail", async function () {
    const signature = await paperKeySigner._signTypedData(
      domain,
      types,
      message
    );
    await expect(
      contract.paperMint(
        message.recipient,
        message.quantity,
        message.tokenId,
        message.nonce,
        signature
      )
    ).to.be.revertedWith("'Mint request already processed");
  });

  it("Non paper wallets cannot generate signature to mint", async function () {
    const signature = await externalUser._signTypedData(domain, types, message);

    await expect(
      contract.paperMint(
        message.recipient,
        message.quantity,
        message.tokenId,
        message.nonce,
        signature
      )
    ).to.be.revertedWith("Invalid signature");
  });
});
