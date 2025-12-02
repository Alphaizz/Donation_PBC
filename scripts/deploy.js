const hre = require("hardhat");

async function main() {
  const charity = await hre.ethers.deployContract("Charity");
  await charity.waitForDeployment();
  console.log(`Charity contract deployed to: ${charity.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});