import json
import time
from typing import Dict

#==============================================================================
# Config info
#==============================================================================

# File names of queried data
COLLATERAL_PRICES = './configs/collateralPrices.json'
BUSD_MODULE = './configs/BUSD-module.json'
DAI_MODULE = './configs/DAI-module.json'
DOT_MODULE = './configs/DOT-module.json'
USDC_MODULE = './configs/USDC-module.json'
USDT_MODULE = './configs/USDT-module.json'
WASTR_MODULE = './configs/WASTR-module.json'
WBTC_MODULE = './configs/WBTC-module.json'
WETH_MODULE = './configs/WETH-module.json'

# Reward config info
INIT_START_BLOCK   =  910000 # same as scanStartBlock
REWARD_START_BLOCK =  912772 # same as rewardStartBlock
REWARD_END_BLOCK   = 1530000 # same as rewardEndBlock (Inclusive)
TOTAL_REWARDS = 60000000000000000000000000 # 60M ATID
NUMBER_OF_BLOCKS_TO_REWARD = (REWARD_END_BLOCK + 1 - REWARD_START_BLOCK)
REWARD_PER_BLOCK = TOTAL_REWARDS / NUMBER_OF_BLOCKS_TO_REWARD

# collateral precisions
PRECISION = {
  'BUSD': 18, 
  'DAI': 18, 
  'DOT': 10, 
  'USDC': 6, 
  'USDT': 6, 
  'WASTR': 18, 
  'WBTC': 8, 
  'WETH': 18
}

#==============================================================================

#==============================================================================
# Helpers 
#==============================================================================

def readQueriedDataJson(fileName: str) -> list:
  jsonFile = open(fileName, 'r')

  queriedDataObjectUnsorted = json.load(jsonFile)
  queriedDataListSorted = sorted(queriedDataObjectUnsorted["queriedState"], key=lambda a: int(a['block']))

  return queriedDataListSorted

def calculateUserRewardsForBlock(user: Dict, collateralPricesForBlock: Dict, poolAmountsForBlock: Dict) -> int:
  # Get pool amount values for each collateral
  poolBusdValue = getUSDValueOfCollteralAmount(
    collateralName='BUSD', 
    collateralAmount=poolAmountsForBlock.get('BUSD', 0), 
    collateralPrice=collateralPricesForBlock.get('BUSD', 0)
  )
  poolDaiValue = getUSDValueOfCollteralAmount(
    collateralName='DAI', 
    collateralAmount=poolAmountsForBlock.get('DAI', 0), 
    collateralPrice=collateralPricesForBlock.get('DAI', 0)
  )
  poolDotValue = getUSDValueOfCollteralAmount(
    collateralName='DOT', 
    collateralAmount=poolAmountsForBlock.get('DOT', 0), 
    collateralPrice=collateralPricesForBlock.get('DOT', 0)
  )
  poolUsdcValue = getUSDValueOfCollteralAmount(
    collateralName='USDC', 
    collateralAmount=poolAmountsForBlock.get('USDC', 0), 
    collateralPrice=collateralPricesForBlock.get('USDC', 0)
  )
  poolUsdtValue = getUSDValueOfCollteralAmount(
    collateralName='USDT', 
    collateralAmount=poolAmountsForBlock.get('USDT', 0), 
    collateralPrice=collateralPricesForBlock.get('USDT', 0)
  )
  poolWastrValue = getUSDValueOfCollteralAmount(
    collateralName='WASTR', 
    collateralAmount=poolAmountsForBlock.get('WASTR', 0), 
    collateralPrice=collateralPricesForBlock.get('WASTR', 0)
  )
  poolWbtcValue = getUSDValueOfCollteralAmount(
    collateralName='WBTC', 
    collateralAmount=poolAmountsForBlock.get('WBTC', 0), 
    collateralPrice=collateralPricesForBlock.get('WBTC', 0)
  )
  poolWethValue = getUSDValueOfCollteralAmount(
    collateralName='WETH', 
    collateralAmount=poolAmountsForBlock.get('WETH', 0), 
    collateralPrice=collateralPricesForBlock.get('WETH', 0)
  )

  # Get user's pool balance value for all collaterals
  userBusdValue = getUSDValueOfCollteralAmount(
    collateralName='BUSD', 
    collateralAmount=user.get('BUSD', 0), 
    collateralPrice=collateralPricesForBlock.get('BUSD', 0)
  )
  userDaiValue = getUSDValueOfCollteralAmount(
    collateralName='DAI', 
    collateralAmount=user.get('DAI', 0), 
    collateralPrice=collateralPricesForBlock.get('DAI', 0)
  )
  userDotValue = getUSDValueOfCollteralAmount(
    collateralName='DOT', 
    collateralAmount=user.get('DOT', 0), 
    collateralPrice=collateralPricesForBlock.get('DOT', 0)
  )
  userUsdcValue = getUSDValueOfCollteralAmount(
    collateralName='USDC', 
    collateralAmount=user.get('USDC', 0), 
    collateralPrice=collateralPricesForBlock.get('USDC', 0)
  )
  userUsdtValue = getUSDValueOfCollteralAmount(
    collateralName='USDT', 
    collateralAmount=user.get('USDT', 0), 
    collateralPrice=collateralPricesForBlock.get('USDT', 0)
  )
  userWastrValue = getUSDValueOfCollteralAmount(
    collateralName='WASTR', 
    collateralAmount=user.get('WASTR', 0), 
    collateralPrice=collateralPricesForBlock.get('WASTR', 0)
  )
  userWbtcValue = getUSDValueOfCollteralAmount(
    collateralName='WBTC', 
    collateralAmount=user.get('WBTC', 0), 
    collateralPrice=collateralPricesForBlock.get('WBTC', 0)
  )
  userWethValue = getUSDValueOfCollteralAmount(
    collateralName='WETH', 
    collateralAmount=user.get('WETH', 0), 
    collateralPrice=collateralPricesForBlock.get('WETH', 0)
  )

  # calculate reward amount
  rewardDecimalNumerator= (userBusdValue+userDaiValue+userDotValue+userUsdcValue+userUsdtValue+userWastrValue+userWbtcValue+userWethValue)
  if (rewardDecimalNumerator == 0):
    return 0

  rewardDecimalDenominator = (poolBusdValue+poolDaiValue+poolDotValue+poolUsdcValue+poolUsdtValue+poolWastrValue+poolWbtcValue+poolWethValue)
  rewardDecimal = rewardDecimalNumerator / rewardDecimalDenominator
  rewardAmount = rewardDecimal * REWARD_PER_BLOCK
  return rewardAmount

def getUSDValueOfCollteralAmount(collateralName: str, collateralAmount: int, collateralPrice: int) -> int:
  if (collateralAmount == 0):
    return 0
  return (collateralAmount * 10**18 * 10**(PRECISION[collateralName])) / collateralPrice

def getBlockIndexFromBlockNumber(blockNumber: int) -> int:
  return blockNumber - REWARD_START_BLOCK

def calculateRewardsForAllBlocks(blocks: list) -> Dict:
  userTotalRewardAmount = {}

  for currBlockNum in range(REWARD_START_BLOCK, REWARD_END_BLOCK + 1, 1):
    blockIndex = getBlockIndexFromBlockNumber(currBlockNum)
    currBlock = blocks[blockIndex]
    for user in currBlock.individualPoolBalances:
      # Calculate user's reward for this block
      userRewardAmountForCurrentBlock = calculateUserRewardsForBlock(
        user=user, 
        collateralPricesForBlock=currBlock.collateralPrices, 
        poolAmountsForBlock=currBlock.poolAmounts
      )
      # Update total award amount for user
      userTotalRewardAmount['address'] = user['address'] # Set address for user
      userTotalRewardAmount[user['address']]['rewardAmount'] = userTotalRewardAmount.get(user['address'], 0) + userRewardAmountForCurrentBlock
  
  return userTotalRewardAmount

#==============================================================================

#==============================================================================
# Runtime functions
#==============================================================================

def initializeBlocks() -> Dict:

  collateralPrices = readQueriedDataJson(COLLATERAL_PRICES)
  collateralModules = {
    "BUSD": {
      "data": readQueriedDataJson(BUSD_MODULE), 
      "listIndex": 0
    }, 
    "DAI": {
      "data": readQueriedDataJson(DAI_MODULE), 
      "listIndex": 0
    }, 
    "DOT": {
      "data": readQueriedDataJson(DOT_MODULE), 
      "listIndex": 0
    }, 
    "USDC": {
      "data": readQueriedDataJson(USDC_MODULE), 
      "listIndex": 0
    }, 
    "USDT": {
      "data": readQueriedDataJson(USDT_MODULE), 
      "listIndex": 0
    }, 
    "WASTR": {
      "data": readQueriedDataJson(WASTR_MODULE), 
      "listIndex": 0
    }, 
    "WBTC": {
      "data": readQueriedDataJson(WBTC_MODULE), 
      "listIndex": 0
    }, 
    "WETH": {
      "data": readQueriedDataJson(WETH_MODULE), 
      "listIndex": 0
    }, 
  }

  collateralPricesIndex = 0
  currentCollateralPrices = {
    "BUSD": 0, 
    "DAI": 0, 
    "DOT": 0, 
    "USDC": 0,
    "USDT": 0,
    "WASTR": 0, 
    "WBTC": 0, 
    "WETH": 0
  }
  currentPoolAmounts = {
    "BUSD": 0, 
    "DAI": 0, 
    "DOT": 0, 
    "USDC": 0,
    "USDT": 0,
    "WASTR": 0, 
    "WBTC": 0, 
    "WETH": 0
  }
  currentIndividualPoolBalances = {}
  userTotalRewards = {}

  for currBlock in range(INIT_START_BLOCK, REWARD_END_BLOCK + 1, 1):
    
    # Output completion percentage
    completionPercentage = ((currBlock - INIT_START_BLOCK) / (REWARD_END_BLOCK + 1 - INIT_START_BLOCK)) * 100
    print('ℹ️  Calculation process:', '{:3.4f}'.format(completionPercentage), '%')

    # Make sure collateral price list is not exhausted
    if (collateralPricesIndex < len(collateralPrices)):

      # get current event's block number 
      currEventBlockNum = int(collateralPrices[collateralPricesIndex]["block"])

      # Look for events in this block
      while (currEventBlockNum == currBlock): 

        # Fetch collateral name from current event (requires some modifying)
        eventCollateralPair = collateralPrices[collateralPricesIndex]["collateralPair"]
        eventCollateralName = eventCollateralPair.split('/')[0]
        if (eventCollateralName == 'ASTR' or eventCollateralName == 'BTC' or eventCollateralName == 'ETH'):
          eventCollateralName = 'W' + eventCollateralName

        # Fetch collateral price from current event
        eventCollateralPrice = int(collateralPrices[collateralPricesIndex]["price"]["hex"], 16) * 10**10

        # Update collateral price
        currentCollateralPrices[eventCollateralName] = eventCollateralPrice


        # move to next event
        collateralPricesIndex += 1 

        # Check if event was last event in list
        if (collateralPricesIndex >= len(collateralPrices)):
          break # leave loop if event list is exhuasted

        # get next event's block number
        currEventBlockNum = int(collateralPrices[collateralPricesIndex]["block"])

  
    # Iterate through collaterals
    for collateral in collateralModules:

      # Check if event was last event in list
      if (collateralModules[collateral]['listIndex'] >= len(collateralModules[collateral]['data'])):
        continue # skip this collateral if event list is exhuasted

      # current event block number
      currEventBlockNum = int(collateralModules[collateral]['data'][collateralModules[collateral]['listIndex']]["block"])

      # Look for collateral module events in this block
      while (currEventBlockNum == currBlock): # Event has updated price

        eventName = collateralModules[collateral]['data'][collateralModules[collateral]['listIndex']]["event"]

        # event is for pool amount
        if (eventName == 'ActivePoolCOLBalanceUpdated'):

          # Fetch collateral info from current event
          eventCollateralName = collateralModules[collateral]['data'][collateralModules[collateral]['listIndex']]["collateralName"]
          eventCollateralAmount = int(collateralModules[collateral]['data'][collateralModules[collateral]['listIndex']]["collAmount"]["hex"], 16)

          # update pool's collateral amount
          currentPoolAmounts[eventCollateralName] = eventCollateralAmount
        
        # event is for an individual pool balance
        else: 

          # Fetch user's address from event
          userAddress = collateralModules[collateral]['data'][collateralModules[collateral]['listIndex']]["userAddress"]

          # Initialize new users 
          if (userAddress not in currentIndividualPoolBalances):
            currentIndividualPoolBalances[userAddress] = {
              'address': userAddress, 
              'BUSD': 0, 
              'DAI': 0,
              'DOT': 0,
              'USDC': 0,
              'USDT': 0,
              'WASTR': 0,
              'WBTC': 0,
              'WETH': 0,
            }

          # Fetch collateral info from current event
          eventCollateralName = eventCollateralName
          eventCollateralAmount = int(collateralModules[collateral]['data'][collateralModules[collateral]['listIndex']]["collateralBalance"]["hex"], 16)

          # Update user's pool balance for specific collateral
          currentIndividualPoolBalances[userAddress][eventCollateralName] = eventCollateralAmount
          
        # move to next event
        collateralModules[collateral]['listIndex'] += 1 

        # Check if event was last event in list
        if (collateralModules[collateral]['listIndex'] >= len(collateralModules[collateral]['data'])):
          break # leave loop if event list is exhuasted

        # next event block number
        currEventBlockNum = int(collateralModules[collateral]['data'][collateralModules[collateral]['listIndex']]["block"])

    # Sart calculating rewards once the current blocks hits the reward start block
    if (currBlock >= REWARD_START_BLOCK):

      # Update each user
      for user in currentIndividualPoolBalances:

        userPreviousTotalRewards = userTotalRewards.get(user, 0)

        userBlockRewards = calculateUserRewardsForBlock(
          user=currentIndividualPoolBalances[user], 
          collateralPricesForBlock=currentCollateralPrices, 
          poolAmountsForBlock=currentPoolAmounts
        )

        userTotalRewards[user] = userPreviousTotalRewards + userBlockRewards

  print('ℹ️  Calculation process: 100.00%')

  # open file to update
  userTotalRewardsFile = open('./configs/userTotalRewardsList.json', 'w')
  userTotalRewardsFile.write(json.dumps(userTotalRewards, indent=2, separators=(',', ': ')))
  userTotalRewardsFile.close()

  return userTotalRewards

def outputRecipientList():

  # Fetch list of recipient reward amounts
  userTotalRewardsFile = open('./configs/userTotalRewardsList.json', 'r')
  userTotalRewardAmounts = json.load(userTotalRewardsFile)
  userTotalRewardsFile.close()

  # Output json
  recipientList = {
    'recipients': []
  }

  # Create recipientInfo object for each recipient
  for user in userTotalRewardAmounts:
    userRecipientInfo = {
      'userAddress': user, 
      'recipientId': 0, 
      'isRecipient': True, 
      'airdropAmount': '{:f}'.format(userTotalRewardAmounts.get(user, 0)).split('.')[0], 
      'deployedLockupContractAddress': "0x0000000000000000000000000000000000000000"
    }
    recipientList['recipients'].append(userRecipientInfo)

  # Write recipientInfo list to recipientList.json
  recipientListFile = open('./configs/recipientList.json', 'w')  
  prettyRecipientList = json.dumps(recipientList, indent=2, separators=(',', ': '))
  recipientListFile.write(prettyRecipientList)
  

print('⏳⏳⏳ Start calculating rewards...')
time.sleep(2)
initializeBlocks()
print('✅ ...rewards calculated')
time.sleep(2)
print('⏳ Generating airdrop recipient list...')
time.sleep(2)
outputRecipientList()
print('✅ ...airdrop recipient list generated')
time.sleep(2)
print('🏁 reward calculation script complete 🏁')
