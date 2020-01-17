
# Overview

Alice is a decentralised financial protocol for projects that make a verifiable impact. It allows service providers to make promises about impact they want to achieve, and ensures that they are held accountable by only rewarding them if that impact is verified. Unlike a traditional bounty mechanism however, Alice allows future rewards to be transferred to third parties thanks to a new financial primitive called the Impact Delivery Agreement (IDA).

This can be helpful in many different use cases, such as allowing service providers to transfer the risk of failure to investors. The “investable bounties” dApp built on Alice, for example, allows service providers to create IDAs, raise funds for their promises, and create markets to sell their future payment rights to investors at a discount: https://ida.alice.si/

# Building

[To be added]

# Protocol description

### Core contracts
  - Ida.sol: contains the core logic of the Impact Delivery Agreement primitive
  - FluidBalanceToken.sol and PaymentRights.sol: a new “semi-fungible” token type with a “fluid balance” to manage the IDA’s payment rights (more details below)
  - ImpactPromise: standard ERC20 token contract used to allow funders (or secondary funders) to claim refunds when the IDA ends.
  - Escrow.sol, FluidEscrow.sol and RefundableEscrow.sol: manage funds escrowed in the IDA
  - ClaimsRegistry.sol: registers promise fulfilment claims and validations

### Helper contracts

  - IdaMarketCreator.sol: allows a service provider to easily create an IDA investment market, such as that used in the [reference dApp](https://ida.alice.si/)
  - IdaFactory.sol: helper contract for creating IDAs, with the creator set as default service provider, and linking to IdaMarketCreator.sol
  - ImpactPromiseFactory: helper contract allowing each new IDA to create their own impact promise tokens

### Definitions

  - _Promises_: can be conceived of as bounties, i.e. actions that, when completed by the service provider and verified by the validator will unlock funds in escrow.
    - `promiseNumber` sets the number of promises that can be fulfilled by the service provider
    - `promisePrice` sets the amount of money in the specified payment token that will be unlocked in the escrow contract
  - _Validator_: this points to the Ethereum address that is authorised to verify that Promises have been fulfilled. Every validation unlocks a number of payment tokens held in escrow equal to `promisePrice`
  - _End date_ (`endTime` in Ida.sol): this indicates the deadline by which the IDA's promises will be completed. After this date, any funds left in escrow will be returned to the IDA's funders
  - _Service Provider_: this is the account that is authorised to fulfill Promises by making claims that will be reviewed by the Validator. The IDA creator is the default Service Provider when using IdaFactory.sol
  - _Promise tokens_: these tokens will be received by anyone who funds an IDA's promises. They can be used after the IDA's end date to receive a pro-rata share of any funds that are remaining in the escrow account.
  - _Payment rights tokens_: these tokens are fluid balance tokens (see section below). They are initially received by the IDA's Service Provider, and are transferable. Every Payment Rights token holder can claim a share of escrowed funds that are unlocked each time a promise is fulfilled, as verified by the Validator.

### Reference use case

[Graphs]

# Fluid balance tokens

Fluid balance tokens (FBTs) are a new type of token that manage the rights to funds held in escrow. Each FBT keeps track of a triple balance: funds that have already been withdrawn from the escrow account, funds that are available for immediate withdrawal, and funds that may be available in future.

We call the balances of these tokens “fluid” because they are automatically combined when transferred, making them easy to trade. FBTs are therefore “semi-fungible”, and offer significant advantages to both fungible and non-fungible tokens.

[Kuba to add fluid balance animation]

### Basic example: combining balances

Let’s take an example: Alice creates an IDA to help two homeless people find a home. These constitute two “promises”, and each will pay out 100 Dai from the linked escrow contract when they are fulfilled. As the IDA’s service provider, Alice initially receives the full amount of 200 payment rights tokens, which are FBTs, and transfers half to Bob who is helping her deliver the promises. When they fulfil their first promise, 100 Dai is unlocked from escrow. Alice immediately uses her tokens to withdraw or “redeem” her share of the unlocked funds, but Bob is lazy and decides to wait.

At this point, here are Alice and Bob’s FBT balances:
  - Alice: redeemed: 50, available: 0, potential: 50
  - Bob: redeemed: 0, available: 50, potential: 50

It turns out that Bob isn’t just too lazy to redeem his funds, he’s also helping Alice a lot less than he said he would. Out of fairness, he therefore transfers half of his tokens back to Alice. This is where the FBTs do their magic and combine the two sets of tokens in Alice’s account to create a new balance:
  - Alice: redeemed: 50, available: 25, potential: 75
  - Bob: redeemed: 0, available: 25, potential: 25

### Reference dApp example: creating investment markets

In the reference IDA dApp, the same logic is applied for the creation of investment markets, when a service provider sells their payment rights tokens at a discount using IdaMarketCreator.sol.

As an example, let’s take the same conditions as above. Alice has 200 payment rights token, and decides to create an investment market where she sells half her payment rights at a 50% discount to reflect the high risk that she might not fulfill her promises. Bob thinks that this is an excellent investment opportunity and buys half the available tokens for 25 Dai. We now have:
  - Alice: redeemed: 0, available: 0, potential: 100
  - Bob: redeemed: 0, available: 0, potential: 50
  - Remaining market: redeemed: 0, available: 0, potential: 50

Alice fulfills one of her promises, which unlocks 100 Dai from the escrow account. Quick as a flash, she cancels the investment market to recover the remaining 50 tokens, and redeems her share of the escrowed funds. Bob, as usual, is being lazy. The balances are now:
  - Alice: redeemed: 75, available: 0, potential: 75
  - Bob: redeemed: 0, available: 25, potential: 25

Alice needs more money upfront, so she decides to create a new investment market. This time, based on her successful track record, she sells a third of her tokens (50) at a 20% discount. Note that in this case the discount is applied to the “potential” balance to avoid investors buying tokens at a price that is higher than what the token can possibly return. Bob decides to invest again, and buys the whole lot for 20 Dai. We now have:
  - Alice: redeemed: 50, available: 0, potential: 50
  - Bob: redeemed: 25, available: 25, potential: 50

### Pro-rata redemption

As well as combining balances, FBTs offer another advantage, in that they ensure that token holders may only ever redeem a fair, pro-rata share of funds that are available in escrow at any given time.

For example, if X Dai is authorised for redemption from an escrow account which currently only holds Y == X/2 Dai, then holders will only be allowed to redeem their pro-rata share of Y, even if the total allowance their holding gives them is >= Y. They will be allowed to redeem the remainder as and when additional funds are added to the escrow account up to a full amount of X.

As an example, using the same initial conditions as above, let’s imagine that Alice at first only manages to raise 100 Dai from funders who want to support her promises to find a home for two homeless people, out of the full 200 Dai that she’s hoping to raise. Bob buys half her promises. After fulfilling her first promise she is quick to redeem as usual. But given that the escrow account is only half full, the balances are:
  - Alice: redeemed: 25, available: 0, potential: 75
  - Bob: redeemed: 0, available: 25, potential: 75

At this point, a wealthy donor decides to fund the remaining 100 Dai to support Alice’s mission. As soon as the fresh funds hit the escrow account, Alice and Bob’s new balances are:
  - Alice: redeemed: 25, available: 25, potential: 50
  - Bob: redeemed: 0, available: 50, potential: 50

### Advantages compared to fungible and non-fungible tokens

FBTs offer significantly more convenience and flexibility for escrow management than both ERC20-type fungible tokens and ERC721-type non-fungible tokens (NFTs).

A naive implementation using fungible tokens would create a first-come first-served problem, where fast-acting token holders have an advantage over slower users. In the situation described just above, for example, Alice and Bob both have half the payment rights tokens that nominally entitles them to 100 Dai each. But because the escrow pot is only half full, Alice would be able to drain its entire contents (100 Dai) as soon as the the first promise is fulfilled. For Bob to get anything after this would require a double condition: 1) additional funds must be added to the escrow account, and 2) the second promise must be fulfilled, even though Alice now has no incentive to do so as she’s already collected her maximum reward.

Using fungible tokens would also make it unwieldy to manage IDA investment markets with discounts set on “unredeemed” balances.

NFTs on the other hand, could be used to manage the individual balance of each token, but these balances could not be combined. This would make them both impractical and expensive to use, as redeeming funds from the escrow account would require one transaction for every token.
