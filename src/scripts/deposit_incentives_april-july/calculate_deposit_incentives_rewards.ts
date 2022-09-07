import { BigNumber, ethers } from "ethers";
import { readJSON, sleep, writeJSON } from "../../utils";
import {COLLATERAL_PRECISION} from "../../contracts"
import { exit } from "process";
const promptInput = require('prompt-sync')();

//=====================================Types====================================

type SupportedCollateralPairs = "BUSD/USD" | "DAI/USD" | "DOT/USD" | "USDC/USD" | "USDT/USD" | "ASTR/USD" | "BTC/USD" | "ETH/USD";

type SupportedCollateralNames = "BUSD" | "DAI" | "DOT" | "USDC" | "USDT" | "WASTR" | "WBTC" | "WETH";

type CollateralQueriedPrices = {
    event: "OracleUpdate", 
    block: number,
    price: {
      type: "BigNumber", 
      hex: string
    }, 
    collateralPair: SupportedCollateralPairs
  }[]

type ActivePoolCOLBalanceUpdated = "ActivePoolCOLBalanceUpdated";
type VaultUpdated = "VaultUpdated";

type BaseEvent = {
  block: number;
  collateralName: SupportedCollateralNames;
}

type ActivePoolCOLBalanceUpdatedEvent = {
  event: ActivePoolCOLBalanceUpdated;
  collAmount: {
    type: "BigNumber", 
    hex: string
  };
} & BaseEvent;

type VaultUpdatedEvent = {
  event: VaultUpdated;
  userAddress: string;
  collateralBalance: {
    type: "BigNumber", 
    hex: string
  };
} & BaseEvent;

type IndividualInfo = {
  address: string, 
  BUSD: BigNumber, 
  DAI: BigNumber, 
  DOT: BigNumber, 
  USDC: BigNumber,
  USDT: BigNumber,
  WASTR: BigNumber, 
  WBTC: BigNumber, 
  WETH: BigNumber
}

type RecipientInfo = {
  userAddress: string, 
  recipientId: 0, 
  isRecipient: true,
  airdropAmount: string, 
  deployedLockupContractAddress: "0x0000000000000000000000000000000000000000"
}

//=====================================Config info====================================

const DEPOSIT_INCENTIVES_DIRECTORY = 'configs/deposit_incentives_april-july/';

// File names of queried data
const COLLATERAL_PRICES_PATH = `./${DEPOSIT_INCENTIVES_DIRECTORY}collateralPrices.json`;
const BUSD_MODULE_PATH = `./${DEPOSIT_INCENTIVES_DIRECTORY}BUSD-module.json`;
const DAI_MODULE_PATH = `./${DEPOSIT_INCENTIVES_DIRECTORY}DAI-module.json`;
const DOT_MODULE_PATH = `./${DEPOSIT_INCENTIVES_DIRECTORY}DOT-module.json`;
const USDC_MODULE_PATH = `./${DEPOSIT_INCENTIVES_DIRECTORY}USDC-module.json`;
const USDT_MODULE_PATH = `./${DEPOSIT_INCENTIVES_DIRECTORY}USDT-module.json`;
const WASTR_MODULE_PATH = `./${DEPOSIT_INCENTIVES_DIRECTORY}WASTR-module.json`;
const WBTC_MODULE_PATH = `./${DEPOSIT_INCENTIVES_DIRECTORY}WBTC-module.json`;
const WETH_MODULE_PATH = `./${DEPOSIT_INCENTIVES_DIRECTORY}WETH-module.json`;

// Reward config info
const INIT_START_BLOCK   =  910000; // same as scanStartBlock
const REWARD_START_BLOCK =  915779; // same as rewardStartBlock
const REWARD_END_BLOCK   = 1530000; // same as rewardEndBlock (Inclusive)
const TOTAL_REWARDS = ethers.utils.parseUnits("60000000", 18); // 60M ATID
const NUMBER_OF_BLOCKS_TO_REWARD = (REWARD_END_BLOCK + 1 - REWARD_START_BLOCK);
const REWARD_PER_BLOCK = TOTAL_REWARDS.div(NUMBER_OF_BLOCKS_TO_REWARD);

// output file names
const USER_TOTAL_REWARD_AMOUNTS_PATH = `./${DEPOSIT_INCENTIVES_DIRECTORY}userTotalRewardAmounts.json`;
const RECIPIENT_LIST_PATH = `./${DEPOSIT_INCENTIVES_DIRECTORY}recipientList.json`;


//=====================================Helpers====================================

function readQueriedDataJson(filePath: string): any[] {
  const queriedDataObject: any = readJSON(filePath)

  const queriedDataArray = queriedDataObject.queriedState;

  queriedDataArray.sort((a: any, b: any) => {
    return a.block - b.block;
  });

  return queriedDataArray
}

function calculateUserRewardsForBlock(
  userInfo: IndividualInfo, 
  collateralPricesForBlock: {[key: string]: BigNumber},
  poolAmountsForBlock: {[key: string]: BigNumber}
) {
  // Get pool amount values for each collateral
  const poolBusdValue = getUSDValueOfCollteralAmount(
    'BUSD', 
    poolAmountsForBlock.BUSD, 
    collateralPricesForBlock.BUSD
  )
  const poolDaiValue = getUSDValueOfCollteralAmount(
    'DAI', 
    poolAmountsForBlock.DAI, 
    collateralPricesForBlock.DAI
  )
  const poolDotValue = getUSDValueOfCollteralAmount(
    'DOT', 
    poolAmountsForBlock.DOT, 
    collateralPricesForBlock.DOT
  )
  const poolUsdcValue = getUSDValueOfCollteralAmount(
    'USDC', 
    poolAmountsForBlock.USDC, 
    collateralPricesForBlock.USDC
  )
  const poolUsdtValue = getUSDValueOfCollteralAmount(
    'USDT', 
    poolAmountsForBlock.USDT, 
    collateralPricesForBlock.USDT
  )
  const poolWastrValue = getUSDValueOfCollteralAmount(
    'WASTR', 
    poolAmountsForBlock.WASTR, 
    collateralPricesForBlock.WASTR
  )
  const poolWbtcValue = getUSDValueOfCollteralAmount(
    'WBTC', 
    poolAmountsForBlock.WBTC, 
    collateralPricesForBlock.WBTC
  )
  const poolWethValue = getUSDValueOfCollteralAmount(
    'WETH', 
    poolAmountsForBlock.WETH, 
    collateralPricesForBlock.WETH
  )

  // Get user's pool balance value for all collaterals
  const userBusdValue = getUSDValueOfCollteralAmount(
    'BUSD', 
    userInfo.BUSD, 
    collateralPricesForBlock.BUSD
  )
  const userDaiValue = getUSDValueOfCollteralAmount(
    'DAI', 
    userInfo.DAI, 
    collateralPricesForBlock.DAI
  )
  const userDotValue = getUSDValueOfCollteralAmount(
    'DOT', 
    userInfo.DOT, 
    collateralPricesForBlock.DOT
  )
  const userUsdcValue = getUSDValueOfCollteralAmount(
    'USDC', 
    userInfo.USDC, 
    collateralPricesForBlock.USDC
  )
  const userUsdtValue = getUSDValueOfCollteralAmount(
    'USDT', 
    userInfo.USDT, 
    collateralPricesForBlock.USDT
  )
  const userWastrValue = getUSDValueOfCollteralAmount(
    'WASTR', 
    userInfo.WASTR, 
    collateralPricesForBlock.WASTR
  )
  const userWbtcValue = getUSDValueOfCollteralAmount(
    'WBTC', 
    userInfo.WBTC, 
    collateralPricesForBlock.WBTC
  )
  const userWethValue = getUSDValueOfCollteralAmount(
    'WETH', 
    userInfo.WETH, 
    collateralPricesForBlock.WETH
  )

  // calculate reward amount
  const rewardDecimalNumerator = userBusdValue.add(userDaiValue).add(userDotValue).add(userUsdcValue).add(userUsdtValue).add(userWastrValue).add(userWbtcValue).add(userWethValue);
  if (rewardDecimalNumerator.toString() == '0'){
    return BigNumber.from('0');
  }

  const rewardDecimalDenominator = poolBusdValue.add(poolDaiValue).add(poolDotValue).add(poolUsdcValue).add(poolUsdtValue).add(poolWastrValue).add(poolWbtcValue).add(poolWethValue);
  const rewardFraction = rewardDecimalNumerator.mul(ethers.constants.WeiPerEther).div(rewardDecimalDenominator)
  const rewardAmount = REWARD_PER_BLOCK.mul(rewardFraction).div(ethers.constants.WeiPerEther)

  return rewardAmount
}

function getUSDValueOfCollteralAmount(
  collateralName: string, 
  collateralAmount: BigNumber, 
  collateralPrice: BigNumber
) {
  if (collateralAmount.toString() == '0') {
    return BigNumber.from('0');
  } 

  const ether = ethers.constants.WeiPerEther;
  const collateralPriceScale = ethers.utils.parseUnits('1', 18 - COLLATERAL_PRECISION[collateralName])

  const usdValueBigNumber = collateralAmount.mul(
    collateralPrice
  ).mul(
    collateralPriceScale
  ).div(
    ether
  );

  return usdValueBigNumber;
}

//=====================================Runtime functions====================================


async function parseBlocksAndCalculateUserRewards() {

  console.log(`⏳⏳ Starting reward calculation...`);
  await sleep(1000);

  console.log(`⏳ Retrieving queried data...`);
  await sleep(1000);

  const collateralPrices: CollateralQueriedPrices = readQueriedDataJson(COLLATERAL_PRICES_PATH);
  let collateralPricesIndex = 0

  const collateralModules: {[key:string]: {data: (ActivePoolCOLBalanceUpdatedEvent | VaultUpdatedEvent)[], listIndex: number}} = {
    BUSD: {
      data: readQueriedDataJson(BUSD_MODULE_PATH), 
      listIndex: 0
    }, 
    DAI: {
      data: readQueriedDataJson(DAI_MODULE_PATH), 
      listIndex: 0
    }, 
    DOT: {
      data: readQueriedDataJson(DOT_MODULE_PATH), 
      listIndex: 0
    }, 
    USDC: {
      data: readQueriedDataJson(USDC_MODULE_PATH), 
      listIndex: 0
    }, 
    USDT: {
      data: readQueriedDataJson(USDT_MODULE_PATH), 
      listIndex: 0
    }, 
    WASTR: {
      data: readQueriedDataJson(WASTR_MODULE_PATH), 
      listIndex: 0
    }, 
    WBTC: {
      data: readQueriedDataJson(WBTC_MODULE_PATH), 
      listIndex: 0
    }, 
    WETH: {
      data: readQueriedDataJson(WETH_MODULE_PATH), 
      listIndex: 0
    }, 
  }

  let currentCollateralPrices: {[key:string]: BigNumber} = {
    BUSD: BigNumber.from(0), 
    DAI: BigNumber.from(0), 
    DOT: BigNumber.from(0), 
    USDC: BigNumber.from(0),
    USDT: BigNumber.from(0),
    WASTR: BigNumber.from(0), 
    WBTC: BigNumber.from(0), 
    WETH: BigNumber.from(0)
  }
  let currentPoolAmounts: {[key:string]: BigNumber} = {
    BUSD: BigNumber.from(0), 
    DAI: BigNumber.from(0), 
    DOT: BigNumber.from(0), 
    USDC: BigNumber.from(0),
    USDT: BigNumber.from(0),
    WASTR: BigNumber.from(0), 
    WBTC: BigNumber.from(0), 
    WETH: BigNumber.from(0)
  }
  let currentIndividualPoolBalances: {[key:string]: IndividualInfo} = {}
  let userTotalRewards: {[key:string]: BigNumber} = {}

  console.log(`✅ ...queried data retrieved`);
  await sleep(1000);

  console.log(`⏳ Calculating rewards...`);
  await sleep(1000);

  // Iterate through all 
  for (let currBlock = INIT_START_BLOCK; currBlock <= REWARD_END_BLOCK; currBlock ++) {

    // Output completion percentage
    const completionPercentage = ((currBlock - INIT_START_BLOCK) / (REWARD_END_BLOCK + 1 - INIT_START_BLOCK)) * 100
    console.log(`ℹ️  Calculation process: ${completionPercentage.toFixed(2)}%`) 

    // Make sure collateral price list is not exhausted
    if (collateralPricesIndex < collateralPrices.length) {
      
      // Get current event's block number
      let currEventBlockNum = collateralPrices[collateralPricesIndex].block;

      while (currEventBlockNum == currBlock) {

        // Fetch ocllateral name form current event (requires some modification)
        const eventCollateralPair = collateralPrices[collateralPricesIndex].collateralPair;
        let eventCollateralName = eventCollateralPair.split('/')[0];
        if (eventCollateralName == 'ASTR' || eventCollateralName == 'BTC' || eventCollateralName == 'ETH') {
          eventCollateralName = 'W'.concat(eventCollateralName);
        }

        // Fetch collateral price from current event
        const eventCollateralPrice = BigNumber.from(collateralPrices[collateralPricesIndex].price.hex).mul('10000000000');

        // Update collateral price
        currentCollateralPrices[eventCollateralName] = eventCollateralPrice;

        // move to next event
        collateralPricesIndex += 1;

        // Check if event was last event in list
        if (collateralPricesIndex >= collateralPrices.length){
          break; // leave loop if event list is exhuasted
        }

        // get next event's block number
        currEventBlockNum = collateralPrices[collateralPricesIndex].block

      }
    }

    for (const collateral in collateralModules) {

      const currCollateralModule = collateralModules[collateral]

      // Check if event was last event in list
      if (currCollateralModule.listIndex >= currCollateralModule.data.length){
        continue; // skip this collateral if event list is exhuasted
      }
        
      // current event block number
      let currEventData = currCollateralModule.data[currCollateralModule.listIndex];

      let currEventBlockNum = currEventData.block

      // Look for collateral module events in this block
      while (currEventBlockNum == currBlock) { // Event has updated price

        // Fetch collateral info from current event
        const eventCollateralName = currEventData.collateralName;

        // event is for pool amount
        if (currEventData.event == 'ActivePoolCOLBalanceUpdated') {

          // Fetch collateral amount
          const eventCollateralAmount = currEventData.collAmount;

          // update pool's collateral amount
          currentPoolAmounts[eventCollateralName] = BigNumber.from(eventCollateralAmount.hex)

        } else { // event is for an individual pool balance

          // Fetch user's address from event
          const userAddress = currEventData.userAddress

          // Fetch collateral amount
          const eventCollateralAmount = currEventData.collateralBalance;

          // Initialize new users 
          if (!(userAddress in currentIndividualPoolBalances)){
            currentIndividualPoolBalances[userAddress] = {
              address: userAddress, 
              BUSD: BigNumber.from(0), 
              DAI: BigNumber.from(0), 
              DOT: BigNumber.from(0), 
              USDC: BigNumber.from(0),
              USDT: BigNumber.from(0),
              WASTR: BigNumber.from(0), 
              WBTC: BigNumber.from(0), 
              WETH: BigNumber.from(0)
            }
          }

          // Update user's pool balance for specific collateral
          currentIndividualPoolBalances[userAddress][eventCollateralName] = BigNumber.from(eventCollateralAmount.hex);
          
        }

        // move to next event
        collateralModules[collateral].listIndex += 1 

        // Check if event was last event in list
        if (currCollateralModule.listIndex >= currCollateralModule.data.length) {
          break; // leave loop if event list is exhuasted
        }

        // next event block number
        currEventBlockNum = currCollateralModule.data[currCollateralModule.listIndex].block;

        // Get next event's data
        currEventData = currCollateralModule.data[currCollateralModule.listIndex];
      }
    }

    // Sart calculating rewards once the current blocks hits the reward start block
    if (currBlock >= REWARD_START_BLOCK){

      // Update each user
      for (const userAddress in currentIndividualPoolBalances) {

        const userPreviousTotalRewards = (userAddress in userTotalRewards) ? userTotalRewards[userAddress] : BigNumber.from(0);

        const userBlockRewards = calculateUserRewardsForBlock(
          currentIndividualPoolBalances[userAddress], 
          currentCollateralPrices, 
          currentPoolAmounts
        );

        userTotalRewards[userAddress] = userPreviousTotalRewards.add(userBlockRewards);

      }

    }
  }

  // Write users' rewards to json to be used by other function
  writeJSON(USER_TOTAL_REWARD_AMOUNTS_PATH, userTotalRewards)
  
  console.log(`✅ ...Rewards calculated. Written to: "${USER_TOTAL_REWARD_AMOUNTS_PATH}"\n`)

}

async function verifyUserRewardAmounts() {

  console.log(`🔍 Verifying user reward amount total...`);
  await sleep(1000);

  // Fetch users' total rewards
  const userTotalRewardAmounts: {[key:string]: BigNumber} = readJSON(USER_TOTAL_REWARD_AMOUNTS_PATH);

  // sum all reward amounts
  let rewardAmountTotal = BigNumber.from('0');

  for (const user in userTotalRewardAmounts){
    rewardAmountTotal = rewardAmountTotal.add(userTotalRewardAmounts[user])
  }

  // Print amounts 
  console.log(`ℹ️  Reward amounts: `)
  console.log(`\tExpect amount: ${TOTAL_REWARDS.toString()}`);
  console.log(`\tActual amount: ${rewardAmountTotal.toString()}`);

}


async function outputRecipientlist() {
  
  console.log(`⏳⏳ Generating recipient list...`);
  await sleep(1000);

  console.log(`🔍 Retrieving list of users' rewards...`);
  await sleep(1000);

  // Fetch users' total rewards
  const userTotalRewardAmounts: {[key:string]: {type: string, hex: string}} = readJSON(USER_TOTAL_REWARD_AMOUNTS_PATH);

  // Output json
  let recipientList = {
    recipients: [] as RecipientInfo[]
  }

  console.log(`✅ ...user reward list retrieved`);
  await sleep(1000);

  console.log(`⏳ Generating list...`);
  await sleep(1000);

  // Create recipientInfo object for each recipient
  for (const user in userTotalRewardAmounts){
    const userRecipientInfo: RecipientInfo = {
      userAddress: user, 
      recipientId: 0, 
      isRecipient: true, 
      airdropAmount: BigNumber.from(userTotalRewardAmounts[user].hex).toString(), 
      deployedLockupContractAddress: "0x0000000000000000000000000000000000000000"
    }
    recipientList.recipients.push(userRecipientInfo)
  }

  // Write recipientInfo list to recipientList.json
  writeJSON(RECIPIENT_LIST_PATH, recipientList)

  console.log(`✅ ...recipient list generated. Written to: "${RECIPIENT_LIST_PATH}"`)
}

//=====================================Main====================================

async function main() {
  console.log(`Deposit incentives' reward calculation and reipient list generation`);

  // Calculate rewards section
  const calculateRewardsConfirmation = promptInput(`❓❓ Reward calculation: Type 'run', 'skip', or 'end' (See README.md): `);
  if (calculateRewardsConfirmation == 'skip') {
    console.log(`👍 Skipping this section\n`);
  } else if (calculateRewardsConfirmation == 'run') {
    console.log(`👍 Running this section`);
    await parseBlocksAndCalculateUserRewards()
  } else if (calculateRewardsConfirmation == 'end') {
    console.log(`❌ Ending script`);
    exit()
  } else {
    console.log(`🚨 Invalid response`);
    console.log(`❌ Ending script by default`);
    exit()
  }

  // Verify rewards section
  const verifyRewardsConfirmation = promptInput(`❓❓ Reward verification: Type 'run', 'skip', or 'end' (See README.md): `);
  if (verifyRewardsConfirmation == 'skip') {
    console.log(`👍 Skipping this section\n`);
  } else if (verifyRewardsConfirmation == 'run') {
    console.log(`👍 Running this section`);
    await verifyUserRewardAmounts()
  } else if (verifyRewardsConfirmation == 'end') {
    console.log(`❌ Ending script`);
    exit();
  } else {
    console.log(`🚨 Invalid response`);
    console.log(`❌ Ending script by default`);
    exit();
  }
  
  // Generate recipient list section
  const generateRecipientListConfirmation = promptInput(`❓❓ Airdrop recipientList generation: Type 'run', 'skip', or 'end' (See README.md): `);
  if (generateRecipientListConfirmation == 'skip') {
    console.log(`👍 Skipping this section\n`);
  } else if (generateRecipientListConfirmation == 'run') {
    console.log(`👍 Running this section`);
    await outputRecipientlist()
  } else if (generateRecipientListConfirmation == 'end') {
    console.log(`❌ Ending script`);
    exit();
  } else {
    console.log(`🚨 Invalid response`);
    console.log(`❌ Ending script by default`);
    exit();
  }

  console.log(`🏁 Deposit incentives' reward calculation and reipient list generation complete 🏁`)
}

main()