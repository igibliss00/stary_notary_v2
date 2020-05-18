const StarNotary = artifacts.require("./StarNotary");
// const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract("StarNotary", (accs) => {
  accounts = accs;
  owner = accounts[0];
});

it("can Create a Star", async () => {
  let tokenId = 4;
  let instance = await StarNotary.deployed();
  await instance.createStar("Awesome Star!", tokenId, { from: accounts[0] });
  const starInfo = await instance.tokenIdToStarInfo.call(tokenId);
  assert.equal(starInfo.name, "Awesome Star!");
});

it("lets user1 put up their star for sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[0];
  let starId = 5;
  let starPrice = web3.utils.toWei(".01", "ether");
  await instance.createStar("dark star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it("lets user1 get the funds after the sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 3;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
  await instance.approve(user2, starId, { from: user1, gasPrice: 0 });
  await instance.buyStar(starId, { from: user2, value: balance });
  let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
  let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
  let value2 = Number(balanceOfUser1AfterTransaction);
  assert.equal(value1, value2);
});

it("lets user2 buy a star, if it is put up for sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 6;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  await instance.approve(user2, starId, { from: user1, gasPrice: 0 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance });
  assert.equal(await instance.ownerOf.call(starId), user2);
});

it("lets user2 buy a star and decreases its balance in ether", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 55;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  await instance.approve(user2, starId, { from: user1, gasPrice: 0 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, {
    from: user2,
    value: balance,
    gasPrice: 0,
  });
  const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
  let value =
    Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
  assert.equal(value, starPrice);
});

it("token name and token symbol are added properly", async () => {
  let instance = await StarNotary.deployed();

  // change the private token name to public in ERC721
  assert.equal(await instance.name.call(), "Star");

  // change the private token symbol to public in ERC721
  assert.equal(await instance.symbol.call(), "STR");
});

it("2 users can exchange their stars", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];

  let starName1 = "First star";
  let starName2 = "Second star";

  let token1 = 11;
  let token2 = 22;

  await instance.createStar(starName1, token1, { from: user1 });
  await instance.createStar(starName2, token2, { from: user2 });

  await instance.exchangeStars(token1, token2, { from: user1 });
  assert.equal(await instance.ownerOf.call(token1), user2);
  assert.equal(await instance.ownerOf.call(token2), user1);
});

it("Stars Tokens can be transferred from one address to another", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starName = "Orion";
  let token = 10;

  await instance.createStar(starName, token, { from: user1 });
  await instance.transferAStar(token, user2, { from: user1 });
  assert.equal(await instance.ownerOf(token), user2);
});
