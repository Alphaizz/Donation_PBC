const hre = require("hardhat");

async function main() {
  // Get the account we are using to deploy
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Check the balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", balance.toString());

  // Proceed with deployment
  const charity = await hre.ethers.deployContract("Charity");
  await charity.waitForDeployment();
  console.log(`Charity contract deployed to: ${charity.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});