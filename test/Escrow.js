const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
let buyer ,seller,inspector,lender;
let realEstate,escrow;

beforeEach(async() => {
    const RealEstate = await ethers.getContractFactory("RealEstate");
     realEstate = await RealEstate.deploy();
    [buyer,seller,inspector,lender] = await ethers.getSigners();

    await realEstate.connect(seller);
    const tx = await realEstate.mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS")
    const txReceipt = await tx.wait()

    const Escrow = await ethers.getContractFactory("Escrow");
     escrow = await Escrow.deploy(realEstate.address, lender.address, inspector.address, seller.address);
});

describe('Deployment', () => {
    it('Returns NFT address', async () => {
        const result = await escrow.nftAddress()
        expect(result).to.be.equal(realEstate.address)
    })

    it('Returns seller', async () => {
        const result = await escrow.seller()
        expect(result).to.be.equal(seller.address)
    })

    it('Returns inspector', async () => {
        const result = await escrow.inspector()
        expect(result).to.be.equal(inspector.address)
    })

    it('Returns lender', async () => {
        const result = await escrow.lender()
        expect(result).to.be.equal(lender.address)
    })
})




})
