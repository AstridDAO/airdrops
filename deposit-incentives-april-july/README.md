# Scanning Repository 
This repository contains scripts for querying blockchain data and calculating incentive rewards. 

## Environment Setup

### Install dependencies 
Run `yarn` in repo root directory

### Set RPC URL
1. Locate `.env.example`
2. Replace `INSERT_RPC_URL_HERE` with RPC URL
3. Rename file to `.env`

## Running Scripts
### 4/28 - 7/28 Deposit Incentives event
1. Navigate to root directory

2. Query chain data
  
    Run `yarn run:query-deposit-data` to start querying script

    - Each section will prompt you to type `run`, `skip`, or `end`. 
    
      `run` will run the current section of querying. `skip` will skip the current section and move to the next section, where you will be prompted again. `end` will end the querying script. 

      It is reccomended to query each section seperately due to how long the querying takes. 

    - List of required data to move forward (located in the `configs` directory):
      
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

    - The script will start parsing through the data queried in step 2. Once the script is done, the list of users and their total reward amounts (in Wei) will be located in `configs/userTotalRewardsList.json`. The generated input for the airdorp instance will be located in `configs/recipientList.json`


