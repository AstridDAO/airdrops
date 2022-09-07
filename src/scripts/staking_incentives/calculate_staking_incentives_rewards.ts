import { BigNumber, ethers } from "ethers";
import { readJSON, sleep, writeJSON } from "../../utils";
import {COLLATERAL_PRECISION, GOV_TOKEN_DEPLOYMENT_BLOCK, ZERO_ADDRESS} from "../../contracts"
import { exit } from "process";
const promptInput = require('prompt-sync')();

//=====================================Types====================================

type GovTokenTransferEvent = {
  block: number, 
  from: string, 
  to: string, 
  amount: {
    type: "BigNumber", 
    hex: string
  }
}

type RecipientInfo = {
  userAddress: string, 
  recipientId: 0, 
  isRecipient: true,
  airdropAmount: string, 
  deployedLockupContractAddress: "0x0000000000000000000000000000000000000000"
}

//=====================================Config info====================================

const STAKING_INCENTIVES_DIRECTORY = 'configs/staking_incentives/';

// File names of queried data
const GOV_TOKEN_TRANSFERS_PATH = `./${STAKING_INCENTIVES_DIRECTORY}govTokenTransfers.json`;

// Reward config info
const INIT_START_BLOCK   =  GOV_TOKEN_DEPLOYMENT_BLOCK; // same as scanStartBlock in query script
const REWARD_START_BLOCK =  915820; // Inclusive
const REWARD_END_BLOCK   = 1738250; // Inclusive
const TOTAL_REWARDS = ethers.utils.parseUnits("3333333.333333333333333333", 18); // (20M ATID over 2 years)
const NUMBER_OF_BLOCKS_TO_REWARD = (REWARD_END_BLOCK + 1 - REWARD_START_BLOCK);
const REWARD_PER_BLOCK = TOTAL_REWARDS.div(NUMBER_OF_BLOCKS_TO_REWARD);

// output file names
const USER_TOTAL_REWARD_AMOUNTS_PATH = `./${STAKING_INCENTIVES_DIRECTORY}userTotalRewardAmounts.json`;
const RECIPIENT_LIST_PATH = `./${STAKING_INCENTIVES_DIRECTORY}recipientList.json`;


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
  userGovTokenBalance: BigNumber, 
  totalGovTokenSupply: BigNumber
) {

  // calculate reward amount
  const rewardFraction = userGovTokenBalance.mul(ethers.constants.WeiPerEther).div(totalGovTokenSupply)
  const rewardAmount = REWARD_PER_BLOCK.mul(rewardFraction).div(ethers.constants.WeiPerEther)

  return rewardAmount
}

//=====================================Runtime functions====================================


async function parseBlocksAndCalculateUserRewards() {

  console.log(`⏳⏳ Starting reward calculation...`);
  await sleep(1000);

  console.log(`⏳ Retrieving queried data...`);
  await sleep(1000);

  const govTokenTransferEvents: GovTokenTransferEvent[] = readQueriedDataJson(GOV_TOKEN_TRANSFERS_PATH);
  let govTokenTransferEventsIndex = 0;

  let currentIndividualGovTokenBalances: {[key:string]: BigNumber} = {};
  let totalGovTokensInSupply = BigNumber.from(0);

  let userTotalRewards: {[key:string]: BigNumber} = {};

  console.log(`✅ ...queried data retrieved`);
  await sleep(1000);

  console.log(`⏳ Calculating rewards...`);
  await sleep(1000);

  // Iterate through all 
  for (let currBlock = INIT_START_BLOCK; currBlock <= REWARD_END_BLOCK; currBlock ++) {

    // Output completion percentage
    const completionPercentage = ((currBlock - INIT_START_BLOCK) / (REWARD_END_BLOCK + 1 - INIT_START_BLOCK)) * 100
    console.log(`ℹ️  Calculation process: ${completionPercentage.toFixed(2)}%`) 

    // Make sure gov token transfer event list is not exhausted
    if (govTokenTransferEventsIndex < govTokenTransferEvents.length) {
      
      // Get current event's block number
      let currEventBlockNum = govTokenTransferEvents[govTokenTransferEventsIndex].block;

      while (currEventBlockNum == currBlock) {

        // Fetch transfer data from current Transfer event
        const transferAmount = BigNumber.from(govTokenTransferEvents[govTokenTransferEventsIndex].amount.hex);
        const transferToAddress = govTokenTransferEvents[govTokenTransferEventsIndex].to;
        const transferFromAddress = govTokenTransferEvents[govTokenTransferEventsIndex].from;

        if (transferFromAddress == ZERO_ADDRESS) { // gov tokens minted

          // Initialize receiverAddress if new user
          if (!(transferToAddress in currentIndividualGovTokenBalances)) {
            currentIndividualGovTokenBalances[transferToAddress] = BigNumber.from(0);
          }

          // Update the totalGovTokenSupply 
          const prevTotalSupply = totalGovTokensInSupply;
          totalGovTokensInSupply = prevTotalSupply.add(transferAmount);

          // Update receiverAddress with transfer amount
          const prevBalance = currentIndividualGovTokenBalances[transferToAddress];
          currentIndividualGovTokenBalances[transferToAddress] = prevBalance.add(transferAmount);

        } else if (transferToAddress == ZERO_ADDRESS) { // gov tokens burned

          // Initialize senderAddress if new user
          if (!(transferFromAddress in currentIndividualGovTokenBalances)) {
            currentIndividualGovTokenBalances[transferFromAddress] = BigNumber.from(0);
          }

          // Update the totalGovTokenSupply 
          const prevTotalSupply = totalGovTokensInSupply;
          totalGovTokensInSupply = prevTotalSupply.sub(transferAmount);

          // Update senderAddress with transfer amount
          const prevBalance = currentIndividualGovTokenBalances[transferFromAddress];
          currentIndividualGovTokenBalances[transferFromAddress] = prevBalance.sub(transferAmount); 

        } else { // gov tokens transfer

          // Initialize receiverAddress if new user
          if (!(transferToAddress in currentIndividualGovTokenBalances)) {
            currentIndividualGovTokenBalances[transferFromAddress] = BigNumber.from(0);
          }

          // Initialize senderAddress if new user
          if (!(transferFromAddress in currentIndividualGovTokenBalances)) {
            currentIndividualGovTokenBalances[transferFromAddress] = BigNumber.from(0);
          }

          // Update receiverAddress with transfer amount
          const prevReceieverBalance = currentIndividualGovTokenBalances[transferToAddress];
          currentIndividualGovTokenBalances[transferToAddress] = prevReceieverBalance.add(transferAmount);

          // Update senderAddress with transfer amount
          const prevSenderBalance = currentIndividualGovTokenBalances[transferFromAddress];
          currentIndividualGovTokenBalances[transferFromAddress] = prevSenderBalance.sub(transferAmount); 
        }

        // move to next event
        govTokenTransferEventsIndex += 1;

        // Check if event was last event in list
        if (govTokenTransferEventsIndex >= govTokenTransferEvents.length){
          break; // leave loop if event list is exhuasted
        }

        // get next event's block number
        currEventBlockNum = govTokenTransferEvents[govTokenTransferEventsIndex].block

      }
    }

    // Sart calculating rewards once the current blocks hits the reward start block
    if (currBlock >= REWARD_START_BLOCK){

      // Update each user
      for (const userAddress in currentIndividualGovTokenBalances) {

        const userPreviousTotalRewards = (userAddress in userTotalRewards) ? userTotalRewards[userAddress] : BigNumber.from(0);

        const userBlockRewards = calculateUserRewardsForBlock(
          currentIndividualGovTokenBalances[userAddress], 
          totalGovTokensInSupply
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
  console.log(`Staking incentives' reward calculation and reipient list generation`);

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

  console.log(`🏁 Staking incentives' reward calculation and reipient list generation complete 🏁`)
}

main()