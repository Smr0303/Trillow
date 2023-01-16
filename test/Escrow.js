const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Escrow", () => {
  let buyer, seller, inspector, lender;
  let realEstate, escrow;

  beforeEach(async () => {
    const RealEstate = await ethers.getContractFactory("RealEstate");
    realEstate = await RealEstate.deploy();
    [buyer, seller, inspector, lender] = await ethers.getSigners();

    const tx = await realEstate
      .connect(seller)
      .mint(
        "https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS"
      );
    const txReceipt = await tx.wait();

    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(
      realEstate.address,
      seller.address,
      inspector.address,
      lender.address
    );

    //Approve property
    const tx1 = await realEstate.connect(seller).approve(escrow.address, 1);
    tx1.wait();
    //Update Listing
    const tx2 = await escrow
      .connect(seller)
      .list(1, buyer.address, tokens(10), tokens(5));
    tx2.wait();
  });

  describe("Deployment", () => {
    it("Returns NFT address", async () => {
      const result = await escrow.nftAddress();
      expect(result).to.be.equal(realEstate.address);
    });

    it("Returns seller", async () => {
      const result = await escrow.seller();
      expect(result).to.be.equal(seller.address);
    });

    it("Returns inspector", async () => {
      const result = await escrow.inspector();
      expect(result).to.be.equal(inspector.address);
    });

    it("Returns lender", async () => {
      const result = await escrow.lender();
      expect(result).to.be.equal(lender.address);
    });
  });

  describe("Listing", () => {
    it("Updates owner", async () => {
      expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address);
    });

    it("Updates the listing", async () => {
      expect(await escrow.isListed(1)).to.be.equal(true);
    });
    it("Updates the buyer", async () => {
      expect(await escrow.buyer(1)).to.be.equal(buyer.address);
    });
    it("Updates the purchasePrice", async () => {
      expect(await escrow.purchasePrice(1)).to.be.equal(tokens(10));
    });
    it("Updates the escrowAmount", async () => {
      expect(await escrow.escrowAmount(1)).to.be.equal(tokens(5));
    });
  });

  describe("Deposits", () => {
    it("Updates contract balance", async () => {
      const tx3 = await escrow.depositEarnest(1, { value: tokens(5) });
      await tx3.wait();
      expect(await escrow.getBalance()).to.be.equal(tokens(5));
    });
  });
  describe("Inspection", () => {
    it("updates inspection status", async () => {
      const tx = await escrow.connect(inspector).updateInspectionStatus(1);
      await tx.wait();
      expect(await escrow.inspectionPassed(1)).to.be.equal(true);
    });
  });

  describe("Approval", () => {
    it("updates approval status", async () => {
      let tx = await escrow.connect(buyer).approveSale(1);
      await tx.wait();
      tx = await escrow.connect(seller).approveSale(1);
      await tx.wait();
      tx = await escrow.connect(lender).approveSale(1);
      await tx.wait();
      expect(await escrow.approval(1, lender.address)).to.be.equal(true);
      expect(await escrow.approval(1, buyer.address)).to.be.equal(true);
      expect(await escrow.approval(1, seller.address)).to.be.equal(true);
    });
  });

  describe("sale", () => {
    beforeEach(async () => {
      let tx = await escrow.depositEarnest(1, { value: tokens(5) });
      await tx.wait();
      tx = await escrow.connect(inspector).updateInspectionStatus(1);
      await tx.wait();

      tx = await escrow.connect(buyer).approveSale(1);
      await tx.wait();
      tx = await escrow.connect(seller).approveSale(1);
      await tx.wait();
      tx = await escrow.connect(lender).approveSale(1);
      await tx.wait();

      await lender.sendTransaction({to:escrow.address, value:tokens(5)});

      tx = await escrow.connect(seller).finalizeSale(1);
      tx.wait();
    });
    it("Updates Ownership", async () => {
     expect(await realEstate.ownerOf(1)).to.be.equal(buyer.address);
    });
    it("Updates Balance", async () => {
      expect(await escrow.getBalance()).to.be.equal(0);
    })
  });
});
