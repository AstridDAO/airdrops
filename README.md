# Scanning Repository 
This repository contains scripts for querying blockchain data and calculating incentive rewards. 

## Table of Contents

1. [Environment Setup](#environment-setup)

2. [Airdrop events](#airdrop-events)

    1. [Deposit incentives 4/28-7/28](#deposit-incentives-event---428-728)

    2. [Staking incentives 4/27-8/27](#staking-incentives-event---427-827)

## Environment Setup

### Install dependencies 
Run `yarn` in repository root directory

### Set RPC URL
1. Locate `.env.example`
2. Replace `INSERT_RPC_URL_HERE` with RPC URL
3. Rename file to `.env`

## Airdrop events
### Deposit Incentives event - 4/28-7/28 

**Covered blocks:** 

915779 - 1530000

**Total distribution:** 

60M ATID

**Details**:
    
  This event reward users who had deposit collateral into the AstridDAO system within the first 3 months of the initial protocol deployment. 60M ATID will be rewarded in total, which will be divided evenly among the blocks in the incentive period. Reward amount per block will be based on percentage of user's individual deposit value compared to total system deposit value. 

  Below are the instructions for running the scripts that output the list of user rewards for this event. Due to the high volume of transaction and data, the runtime of these scripts are long. Step 2 will take approximately 2-3 hours. Step 3 will take approximately 8-10 hours. 

**Instructions for running scripts:**

1. Navigate to root directory of repository

2. Query chain data
  
    Run `yarn run:query-deposit-data` to start querying script

    - Each section will prompt you to type `run`, `skip`, or `end`. 
    
      `run` will run the current section of querying. `skip` will skip the current section and move to the next section, where you will be prompted again. `end` will end the querying script. 

      It is reccomended to query each section seperately due to how long the querying takes. 

      Sections:

        The first section fetches all of the collateral price data. The other sections make up all of the individual collatera data gathering the pool and invidual vault balances. 

    - List of required data to move forward (located in the `configs/deposit_incentives_april-july` directory):
      
      - `collateralPrices.json`: Contains collateral price data
      - `BUSD-module.json`: Contains BUSD pool and individual data
      - `DAI-module.json`: Contains DAI pool and individual data
      - `DOT-module.json`: Contains DOT pool and individual data
      - `USDC-module.json`: Contains USDC pool and individual data
      - `USDT-module.json`: Contains USDT pool and individual data
      - `WASTR-module.json`: Contains WASTR pool and individual data
      - `WBTC-module.json`: Contains WBTC pool and individual data
      - `WETH-module.json`: Contains WETH pool and individual data
  
3. Calculate reward values 

    Run `yarn run:calculate-deposit-rewards` to start calculating rewards

    - Each section will prompt you to type `run`, `skip`, or `end`. 
    
      `run` will run the current section of querying. `skip` will skip the current section and move to the next section, where you will be prompted again. `end` will end the querying script. 

      It is reccomended to run each section seperately due to how long the querying takes. 

      Sections:

        1. The first section will start parsing through the data queried in step 2, and calculate the total reward per user. Once the setion is done, the list of users and their total reward amounts (in Wei) will be located in `configs/deposit_incentives_april-july/userTotalRewardsList.json`. 
    
        2. The second section is used to calculate the difference between the expected reward total amount and the actual reward total amount. Note that there will be a slight difference due to ether's BigNumber library division functionality. This number should be neglible due to how small it is. 

        3. The third section will generate the airdrop recipient list. This list wil be used to set the recipients in the deployed airdrop instance. The generated input for the airdrop instance will be located in `configs/deposit_incentives_april-july/recipientList.json`

### Staking incentives event - 4/27-8/27

**Covered blocks:** 

915820 - 1738250

**Total distribution:** 

20M ATID over 2 years. 3.3M ATID for this event batch. 

**Details:** 

This event reward users who had staked ATID into the AstridDAO system within the first 4 months of the initial protocol deployment. 20M ATID will be rewarded in total over the first 2 years since initial deployment. 3.333M ATID will be distributed for this batch. Reward amount per block will be based on percentage of user's individual veATID balance compared to total system veATID balance. 

Below are the instructions for running the scripts that output the list of user rewards for this event. Step 2 will take approximately 1 hour. Step 3 will take approximately 30 minutes.

**Instructions for running scripts:**

1. Navigate to root directory of repository

2. Query chain data
  
    Run `yarn run:query-staking-data` to start querying script

    - Each section will prompt you to type `run`, `skip`, or `end`. 
    
      `run` will run the current section of querying. `skip` will skip the current section and move to the next section, where you will be prompted again. `end` will end the querying script. 

      It is reccomended to query each section seperately due to how long the querying takes. 

      Sections:

        There is only one section. The section to fetch the gov token transfers. 

    - List of required data to move forward (located in the `configs/staking_incentives/` directory):
      
      - `govTokenTransfers.json`: Contains gov token transfer events
  
3. Calculate reward values 

    Run `yarn run:calculate-staking-rewards` to start calculating rewards

    - Each section will prompt you to type `run`, `skip`, or `end`. 
    
      `run` will run the current section of querying. `skip` will skip the current section and move to the next section, where you will be prompted again. `end` will end the querying script. 

      It is reccomended to run each section seperately due to how long the querying takes. 

      Sections:

        1. The first section will start parsing through the data queried in step 2, and calculate the total reward per user. Once the setion is done, the list of users and their total reward amounts (in Wei) will be located in `configs/staking_incentives/userTotalRewardsList.json`. 
    
        2. The second section is used to calculate the difference between the expected reward total amount and the actual reward total amount. Note that there will be a slight difference due to ether's BigNumber library division functionality. This number should be neglible due to how small it is. 

        3. The third section will generate the airdrop recipient list. This list wil be used to set the recipients in the deployed airdrop instance. The generated input for the airdrop instance will be located in `configs/staking_incentives/recipientList.json`
