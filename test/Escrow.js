const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
it("saves the address",async()=>{
    let buyer ,seller,inspector,lender;

     const RealEstate = await ethers.getContractFactory("RealEstate");
     const realEstate = await RealEstate.deploy();

    [buyer,seller,inspector,lender] = await ethers.getSigners();


    await realEstate.connect(seller);
    const tx = await realEstate.mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS")
    const txReceipt = await tx.wait()
   

    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy(realEstate.address, lender.address, inspector.address, seller.address);

    const result = await escrow.nftAddress();
    expect(result).to.be.equal(realEstate.address);

    const res = await escrow.seller();
    expect(res).to.be.equal(seller.address);

    //  "https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS"

});
})
