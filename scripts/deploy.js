const hre = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

async function main() {
  [buyer, seller, inspector, lender] = await ethers.getSigners();

  const RealEstate = await ethers.getContractFactory("RealEstate");
  realEstate = await RealEstate.deploy();
  await realEstate.deployed();

  console.log(`Deployed real Estate: ${realEstate.address}`);
  console.log(`Minting 3 properties`);

  for(let i=0;i < 3; i++){
    const transaction = await realEstate.connect(seller).mint(`https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/${i + 1}.json`);
    await transaction.wait();
  }

  //Deploy Escrow
  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(
    realEstate.address,
    seller.address,
    inspector.address,
    lender.address
  );
  console.log(escrow.address);

  await escrow.deployed();

  for(let i=0;i <3; i++){
    let transaction = await realEstate.connect(seller).approve(escrow.address, i+1);
    await transaction.wait();
  }

  transaction = await escrow.connect(seller).list(1, buyer.address,tokens(20),tokens(10));
  await transaction.wait();
  transaction = await escrow.connect(seller).list(2, buyer.address,tokens(15),tokens(5));
  await transaction.wait();
  transaction = await escrow.connect(seller).list(3, buyer.address,tokens(10),tokens(5));
  await transaction.wait();

  console.log("Finished");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    process.exit(1);
  });


//   samarjeetmohite@Samarjeets-MacBook-Pro-2 Trillow4907 % npx hardhat run ./scripts/deploy.js --network sepolia
// Deployed real Estate: 0x3Fc52652c31213696438768304FD352C7DB8de9d
// Minting 3 properties
// 0xE5e932d70a3d1c840852cBCBDAE0769053B9b016
// Finished