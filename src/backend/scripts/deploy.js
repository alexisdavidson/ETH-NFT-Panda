const fromWei = (num) => ethers.utils.formatEther(num)

async function main() {

  let teamWallet = "0x67Af61C47F0e131E7b8E55912182e612d1b9C390" // goerli

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", fromWei(await deployer.getBalance()));
  
  const NFT = await ethers.getContractFactory("NFT");
  const nft = await NFT.deploy();
  console.log("NFT contract address", nft.address)
  saveFrontendFiles(nft, "NFT");
  
  // const Token = await ethers.getContractFactory("Token");
  // const token = await Token.deploy();
  // console.log("Token contract address", token.address)
  // saveFrontendFiles(token, "Token");

  // For testing
  // await nft.setMintEnabled(true);
  // await nft.setPrice(0); // Price is already 0
  // await nft.mint(1, { value: 0}); // mint 222 for team
  
  await nft.transferOwnership(teamWallet)
  console.log("Goerli test functions called")
}

function saveFrontendFiles(contract, name) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../../frontend/contractsData";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
