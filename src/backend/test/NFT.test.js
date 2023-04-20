const { expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => parseInt(ethers.utils.formatEther(num))

describe("NFT", async function() {
    let deployer, addr1, addr2, nft
    let price = 0
    let initialTeamBalance = 750

    beforeEach(async function() {
        // Get contract factories
        const NFT = await ethers.getContractFactory("NFT");

        // Get signers
        [deployer, addr1, addr2, addr3] = await ethers.getSigners();
        whitelist = [addr1.address, addr2.address, addr3.address]

        // Deploy contracts
        nft = await NFT.deploy();
    });

    describe("Deployment", function() {
        it("Should track name and symbol of the nft collection", async function() {
            expect(await nft.name()).to.equal("Genesis Scratchy Card")
            expect(await nft.symbol()).to.equal("GSC")
        })
    })

    describe("Mint", function() {
        it("Should mint NFTs correctly", async function() {
            expect(await nft.balanceOf(deployer.address)).to.equal(initialTeamBalance);
            await expect(nft.connect(addr1).mint(1, { value: toWei(price)})).to.be.revertedWith('Minting is not enabled');
            await nft.connect(deployer).setMintEnabled(true);

            await expect(nft.connect(addr1).mint(3, { value: toWei(price * 3)})).to.be.revertedWith('Each address may only mint x NFTs!');
            await expect(nft.connect(addr1).mint(10000, { value: toWei(price)})).to.be.revertedWith('Cannot mint more than max supply');
            // await expect(nft.connect(addr1).mint(1)).to.be.revertedWith('Not enough ETH sent; check price!');

            await nft.connect(addr1).mint(1, { value: toWei(price)});
            expect(await nft.balanceOf(addr1.address)).to.equal(1);
            expect(await nft.totalSupply()).to.equal(initialTeamBalance + 1);

        })
        it("Should burn and track NFTs", async function() {
            await nft.connect(deployer).setMintEnabled(true);
            await nft.connect(addr1).mint(2, { value: toWei(price)});
            expect(await nft.balanceOf(addr1.address)).to.equal(2);
            
            await expect(nft.connect(addr2).scratch(initialTeamBalance + 1)).to.be.revertedWith("You don't have the right to scratch this NFT");
            await expect(nft.connect(addr1).scratch(initialTeamBalance + 3)).to.be.revertedWith("OwnerQueryForNonexistentToken()");

            await nft.connect(addr1).scratch(initialTeamBalance + 1);
            expect(await nft.balanceOf(addr1.address)).to.equal(1);
            console.log("getScratched", await nft.getScratched(addr1.address))
            expect((await nft.getScratched(addr1.address))[0]).to.equal(initialTeamBalance + 1);
            
            await nft.connect(addr1).scratch(initialTeamBalance + 2);
            expect(await nft.balanceOf(addr1.address)).to.equal(0);
            console.log("getScratched", await nft.getScratched(addr1.address))
            expect((await nft.getScratched(addr1.address))[0]).to.equal(initialTeamBalance + 1);
            expect((await nft.getScratched(addr1.address))[1]).to.equal(initialTeamBalance + 2);

        })
        it("Should perform owner functions", async function() {
            let newAmountMintPerAccount = 10
            let newPrice = 0

            await expect(nft.connect(addr1).setMintEnabled(true)).to.be.revertedWith('Ownable: caller is not the owner');
            await expect(nft.connect(addr1).setAmountMintPerAccount(newAmountMintPerAccount)).to.be.revertedWith('Ownable: caller is not the owner');
            await expect(nft.connect(addr1).setPrice(newPrice)).to.be.revertedWith('Ownable: caller is not the owner');
            await expect(nft.connect(addr1).withdraw()).to.be.revertedWith('Ownable: caller is not the owner');
            
            await nft.connect(deployer).setAmountMintPerAccount(newAmountMintPerAccount);
            expect(await nft.amountMintPerAccount()).to.equal(newAmountMintPerAccount);
            await nft.connect(deployer).setPrice(newPrice);
            expect(await nft.getPrice()).to.equal(newPrice);
        })
    })
    
})