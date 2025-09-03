const hre = require("hardhat");

async function main() {
  console.log("Déploiement du NFTMarketplace...");
  
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();

  await nftMarketplace.deployed();

  console.log("NFTMarketplace déployé à l'adresse:", nftMarketplace.address);
  
  // Créer les dossiers pour sauvegarder l'adresse et l'ABI
  const fs = require("fs");
  const contractsDir = "./src/contracts";

  if (!fs.existsSync("./src")) {
    fs.mkdirSync("./src");
  }
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  // Sauvegarder l'adresse du contrat
  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ NFTMarketplace: nftMarketplace.address }, undefined, 2)
  );

  console.log("Adresse du contrat sauvegardée dans src/contracts/");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});