const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarketplace", function () {
  let nftMarketplace;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    nftMarketplace = await NFTMarketplace.deploy();
    await nftMarketplace.deployed();
  });

  it("Should have correct initial listing price", async function () {
    const listingPrice = await nftMarketplace.getListingPrice();
    expect(listingPrice).to.equal(ethers.utils.parseEther("0.025"));
  });

  it("Should create a token without price", async function () {
    const tokenURI = "data:application/json;base64,eyJuYW1lIjoidGVzdCJ9";

    const tx = await nftMarketplace.createToken(tokenURI, 0, { value: 0 });
    await tx.wait();

    const balance = await nftMarketplace.balanceOf(owner.address);
    expect(balance).to.equal(1);
  });

  it("Should create a token with price", async function () {
    const tokenURI = "data:application/json;base64,eyJuYW1lIjoidGVzdCJ9";
    const price = ethers.utils.parseEther("1");
    const listingPrice = await nftMarketplace.getListingPrice();

    const tx = await nftMarketplace.createToken(tokenURI, price, {
      value: listingPrice
    });
    await tx.wait();

    const balance = await nftMarketplace.balanceOf(owner.address);
    expect(balance).to.equal(1);
  });
});