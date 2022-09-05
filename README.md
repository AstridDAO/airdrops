# Scanning Repository 
This repository contains scripts for querying blockchain data and calculating incentive rewards. 

## Environment Setup
Note that the root directory for each airdrop event is specified in the corresponding section. All other paths in instructions are relative to the specified root directory. 

### Install dependencies 
Run `yarn` in event's root directory (specified below per event)

### Set RPC URL
1. Locate `.env.example` (in event's root directory)
2. Replace `INSERT_RPC_URL_HERE` with RPC URL
3. Rename file to `.env`

## Running Scripts
### 4/28 - 7/28 Deposit Incentives event
1. Navigate to root directory (`airdrops/deposit_incentives_april-july/`)

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
1. Navigate to root directory (`airdrops/staking_incentives_april27-august27_2022/`)

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
