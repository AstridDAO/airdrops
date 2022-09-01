import assert from "assert";
import { exit } from "process";
import { ethers } from "ethers";
import { maybeRetry } from "../utils";
const promptInput = require('prompt-sync')();
import {checkDirectoryExists, writeJSON} from "../utils";
import { 
  activePoolCollAmountUpdatedEventHandler, 
  CapturedEvent, 
  diaOracleOracleUpdateEventHandler, 
  queryBlockForContractEvent, 
  VaultUpdatedEventsHandler 
} from "../services/handlers";
import { 
  ActivePoolActivePoolCOLBalanceUpdatedEventFilters, 
  ActivePoolContracts, 
  BorrowerOperationsContracts, 
  BorrowerOperationsVaultUpdatedEventFilters, 
  diaOracleContract, 
  DiaOracleUpdateEventFilter, 
  VaultManagerContracts, 
  VaultManagerVaultUpdatedEventFilters
} from "../contracts";

//=================================Config info================================= 

const CONFIG_DIRECTORY = "configs/"

const CONFIG = {
  rewardStartBlock: 912772,  // inclusive
  rewardEndBlock: 1530000,  // inclusive
  scanStartBlock: 910000,  // inclusive, deliberately set to be earlier than rewardStartBlock.
  queryChunkBlockCount: 1000,
  maxConcurrency: 5,
}

function validateConfig() {
  assert(CONFIG.rewardStartBlock < CONFIG.rewardEndBlock, "rewardStartBlock has to be smaller than rewardEndBlock");
  assert(CONFIG.scanStartBlock <= CONFIG.rewardStartBlock, "state scanning has to start no later than reward distribution");
}

// List of batches of events to query
const EVENT_SCAN_CONFIG_BATCHES = [
  {
    batchName: "price querying", 
    batchFileName: "collateralPrices.json",
    batchStartScanBlock: CONFIG.scanStartBlock, // inclusive, deliberately set to be earlier than rewardStartBlock.
    maxConcurrency: 5,
    eventsToScan: [
      {
        name: "DiaOraclePriceUpdated",
        contract: diaOracleContract,
        eventFilter: DiaOracleUpdateEventFilter,
        eventHandler: diaOracleOracleUpdateEventHandler
      }
    ]
  }, 
  {
    batchName: "BUSD module querying", 
    batchFileName: "BUSD-module.json",
    batchStartScanBlock: 1040000, // inclusive, deliberately set to be earlier than contract deployment.
    maxConcurrency: 4,
    eventsToScan: [
      {
        name: "ActivePoolBusdCollAmountUpdated", 
        contract: ActivePoolContracts.BUSD, 
        eventFilter: ActivePoolActivePoolCOLBalanceUpdatedEventFilters.BUSD, 
        eventHandler: activePoolCollAmountUpdatedEventHandler
      },
      {
        name: "BorrowerOperationsBusdVaultUpdated", 
        contract: BorrowerOperationsContracts.BUSD, 
        eventFilter: BorrowerOperationsVaultUpdatedEventFilters.BUSD, 
        eventHandler: VaultUpdatedEventsHandler
      },
      {
        name: "VaultManagerBusdVaultUpdated", 
        contract: VaultManagerContracts.BUSD, 
        eventFilter: VaultManagerVaultUpdatedEventFilters.BUSD, 
        eventHandler: VaultUpdatedEventsHandler
      },
    ]
  }, 
  {
    batchName: "DAI module querying", 
    batchFileName: "DAI-module.json",
    batchStartScanBlock: 1120000, // inclusive, deliberately set to be earlier than deployment.
    maxConcurrency: 3,
    eventsToScan: [
      {
        name: "ActivePoolDaiCollAmountUpdated", 
        contract: ActivePoolContracts.DAI, 
        eventFilter: ActivePoolActivePoolCOLBalanceUpdatedEventFilters.DAI, 
        eventHandler: activePoolCollAmountUpdatedEventHandler
      },
      {
        name: "BorrowerOperationsDaiVaultUpdated", 
        contract: BorrowerOperationsContracts.DAI, 
        eventFilter: BorrowerOperationsVaultUpdatedEventFilters.DAI, 
        eventHandler: VaultUpdatedEventsHandler
      },
      {
        name: "VaultManagerDaiVaultUpdated", 
        contract: VaultManagerContracts.DAI, 
        eventFilter: VaultManagerVaultUpdatedEventFilters.DAI, 
        eventHandler: VaultUpdatedEventsHandler
      },
    ]
  }, 
  {
    batchName: "DOT module querying", 
    batchFileName: "DOT-module.json",
    batchStartScanBlock: 1190000, // inclusive, deliberately set to be earlier than deployment.
    maxConcurrency: 3,
    eventsToScan: [
      {
        name: "ActivePoolDotCollAmountUpdated", 
        contract: ActivePoolContracts.DOT, 
        eventFilter: ActivePoolActivePoolCOLBalanceUpdatedEventFilters.DOT, 
        eventHandler: activePoolCollAmountUpdatedEventHandler
      },
      {
        name: "BorrowerOperationsDotVaultUpdated", 
        contract: BorrowerOperationsContracts.DOT, 
        eventFilter: BorrowerOperationsVaultUpdatedEventFilters.DOT, 
        eventHandler: VaultUpdatedEventsHandler
      },
      {
        name: "VaultManagerDotVaultUpdated", 
        contract: VaultManagerContracts.DOT, 
        eventFilter: VaultManagerVaultUpdatedEventFilters.DOT, 
        eventHandler: VaultUpdatedEventsHandler
      },
    ]
  }, 
  {
    batchName: "USDC module querying", 
    batchFileName: "USDC-module.json",
    batchStartScanBlock: 1260000, // inclusive, deliberately set to be earlier than deployment.
    maxConcurrency: 3,
    eventsToScan: [
      {
        name: "ActivePoolUsdcCollAmountUpdated", 
        contract: ActivePoolContracts.USDC, 
        eventFilter: ActivePoolActivePoolCOLBalanceUpdatedEventFilters.USDC, 
        eventHandler: activePoolCollAmountUpdatedEventHandler
      },
      {
        name: "BorrowerOperationsUsdcVaultUpdated", 
        contract: BorrowerOperationsContracts.USDC, 
        eventFilter: BorrowerOperationsVaultUpdatedEventFilters.USDC, 
        eventHandler: VaultUpdatedEventsHandler
      },
      {
        name: "VaultManagerUsdcVaultUpdated", 
        contract: VaultManagerContracts.USDC, 
        eventFilter: VaultManagerVaultUpdatedEventFilters.USDC, 
        eventHandler: VaultUpdatedEventsHandler
      },
    ]
  }, 
  {
    batchName: "USDT module querying", 
    batchFileName: "USDT-module.json",
    batchStartScanBlock: 1500000, // inclusive, deliberately set to be earlier than deployment.
    maxConcurrency: 3,
    eventsToScan: [
      {
        name: "ActivePoolUsdtCollAmountUpdated", 
        contract: ActivePoolContracts.USDT, 
        eventFilter: ActivePoolActivePoolCOLBalanceUpdatedEventFilters.USDT, 
        eventHandler: activePoolCollAmountUpdatedEventHandler
      },
      {
        name: "BorrowerOperationsUsdtVaultUpdated", 
        contract: BorrowerOperationsContracts.USDT, 
        eventFilter: BorrowerOperationsVaultUpdatedEventFilters.USDT, 
        eventHandler: VaultUpdatedEventsHandler
      },
      {
        name: "VaultManagerUsdtVaultUpdated", 
        contract: VaultManagerContracts.USDT, 
        eventFilter: VaultManagerVaultUpdatedEventFilters.USDT, 
        eventHandler: VaultUpdatedEventsHandler
      },
    ]
  }, 
  {
    batchName: "WASTR module querying", 
    batchFileName: "WASTR-module.json",
    batchStartScanBlock: 910000, // inclusive, deliberately set to be earlier than deployment.
    maxConcurrency: 2,
    eventsToScan: [
      {
        name: "ActivePoolWastrCollAmountUpdated", 
        contract: ActivePoolContracts.WASTR, 
        eventFilter: ActivePoolActivePoolCOLBalanceUpdatedEventFilters.WASTR, 
        eventHandler: activePoolCollAmountUpdatedEventHandler
      },
      {
        name: "BorrowerOperationsWastrVaultUpdated", 
        contract: BorrowerOperationsContracts.WASTR, 
        eventFilter: BorrowerOperationsVaultUpdatedEventFilters.WASTR, 
        eventHandler: VaultUpdatedEventsHandler
      },
      {
        name: "VaultManagerWastrVaultUpdated", 
        contract: VaultManagerContracts.WASTR, 
        eventFilter: VaultManagerVaultUpdatedEventFilters.WASTR, 
        eventHandler: VaultUpdatedEventsHandler
      },
    ]
  }, 
  {
    batchName: "WBTC module querying", 
    batchFileName: "WBTC-module.json",
    batchStartScanBlock: 1340000, // inclusive, deliberately set to be earlier than deployment.
    maxConcurrency: 3,
    eventsToScan: [
      {
        name: "ActivePoolWbtcCollAmountUpdated", 
        contract: ActivePoolContracts.WBTC, 
        eventFilter: ActivePoolActivePoolCOLBalanceUpdatedEventFilters.WBTC, 
        eventHandler: activePoolCollAmountUpdatedEventHandler
      },
      {
        name: "BorrowerOperationsWbtcVaultUpdated", 
        contract: BorrowerOperationsContracts.WBTC, 
        eventFilter: BorrowerOperationsVaultUpdatedEventFilters.WBTC, 
        eventHandler: VaultUpdatedEventsHandler
      },
      {
        name: "VaultManagerWbtcVaultUpdated", 
        contract: VaultManagerContracts.WBTC, 
        eventFilter: VaultManagerVaultUpdatedEventFilters.WBTC, 
        eventHandler: VaultUpdatedEventsHandler
      },
    ]
  }, 
  {
    batchName: "WETH module querying", 
    batchFileName: "WETH-module.json",
    batchStartScanBlock: 1230000, // inclusive, deliberately set to be earlier than deployment.
    maxConcurrency: 3,
    eventsToScan: [
      {
        name: "ActivePoolWethCollAmountUpdated", 
        contract: ActivePoolContracts.WETH, 
        eventFilter: ActivePoolActivePoolCOLBalanceUpdatedEventFilters.WETH, 
        eventHandler: activePoolCollAmountUpdatedEventHandler
      },
      {
        name: "BorrowerOperationsWethVaultUpdated", 
        contract: BorrowerOperationsContracts.WETH, 
        eventFilter: BorrowerOperationsVaultUpdatedEventFilters.WETH, 
        eventHandler: VaultUpdatedEventsHandler
      },
      {
        name: "VaultManagerWethVaultUpdated", 
        contract: VaultManagerContracts.WETH, 
        eventFilter: VaultManagerVaultUpdatedEventFilters.WETH, 
        eventHandler: VaultUpdatedEventsHandler
      },
    ]
  }
];

//=====================================Main====================================

interface ScannedChunk {
  startBlock: number,
  endBlock: number,
  events: CapturedEvent[]
}

async function main() {

  // Pre-processes
  validateConfig();
  checkDirectoryExists(CONFIG_DIRECTORY);

  // // Skipping functionality confirmation
  // let canSkip;
  // const canSkipConfirmation = promptInput(`❓ Type 'skip' to gain access to skip querying certain modules and 'run all' otherwise. `);
  // if (canSkipConfirmation == 'skip') {
  //   canSkip = true;
  //   console.log(`👍 Skipping enabled`);
  // } else if (canSkipConfirmation == 'run all') {
  //   canSkip = false;
  //   console.log(`👍 Skipping disabled`);
  // } else {
  //   console.log(`🚨 Invalid response`);
  //   console.log(`❌ Canceling query`);
  //   exit();
  // }

  // Start scanning events 
  console.log("⏳⏳⏳ Start scanning...\n");

  for (const batch of EVENT_SCAN_CONFIG_BATCHES) { // Iterate through each scanning batch

    console.log(`⏳⏳ Starting ${batch.batchName}...`);

    // Skip or run confirmation. (will run unless 'skip' is entered)
    const canSkipConfirmation = promptInput(`❓ Type 'run', 'skip', or 'end' (See README.md): `);
    if (canSkipConfirmation == 'skip') {
      console.log(`👍 Skipping this section\n`);
      continue;
    } else if (canSkipConfirmation == 'run') {
      console.log(`👍 Running this section`);
    } else if (canSkipConfirmation == 'end') {
      console.log(`❌ Ending script`);
      break;
    } else {
      console.log(`🚨 Invalid response`);
      console.log(`❌ Ending script by default`);
      break;
    }

    // Global state of collateral price information
    let queriedState = [] as CapturedEvent[];   

    // Local list of promised scanned chunks
    let scanConcurrencyPromises: Promise<ScannedChunk>[] = [];

    // Iterate through block range
    for (let currBlock = batch.batchStartScanBlock; currBlock <= CONFIG.rewardEndBlock; currBlock += CONFIG.queryChunkBlockCount + 1) {
      
      // Get iteration block range
      const chunkStartBlock = currBlock;
      const chunkEndBlock = Math.min(
        chunkStartBlock + CONFIG.queryChunkBlockCount, 
        CONFIG.rewardEndBlock
      );

      console.log(`ℹ️  Scanning for block ${chunkStartBlock} - ${chunkEndBlock} for...`);

      // Scanner function
      const chunkScanHandler = async (): Promise<ScannedChunk> => {
        let eventCapturePromises: Promise<CapturedEvent[]>[] = [];

        for (const scanConfig of batch.eventsToScan) {
          eventCapturePromises.push(maybeRetry(async () => {
            const rawEvents = await queryBlockForContractEvent(
              {
                startBlock: chunkStartBlock,
                endBlock: chunkEndBlock, 
                contract: scanConfig.contract,
                eventFilter: scanConfig.eventFilter, 
                eventName: scanConfig.name
              }
            ) as ethers.Event[];
            const handledEvents = scanConfig.eventHandler(rawEvents);
            return handledEvents;
          }));
        }

        // Parse events
        const eventGroups = await Promise.all(eventCapturePromises);
        let allEvents = eventGroups.reduce((acc, group) => acc.concat(group), []);

        return {
          startBlock: chunkStartBlock, 
          endBlock: chunkEndBlock, 
          events: allEvents
        };
      };

      scanConcurrencyPromises.push(chunkScanHandler()); // Get new queries

      if (scanConcurrencyPromises.length >= batch.maxConcurrency) {// Update state and JSON if enough queries
        const scannedChunks = await Promise.all(scanConcurrencyPromises);
        const capturedEvents = scannedChunks.reduce((acc, chunk) => acc.concat(chunk.events), [] as CapturedEvent[]);
        queriedState = queriedState.concat(capturedEvents);
        writeJSON(
          `${CONFIG_DIRECTORY}${batch.batchFileName}`, 
          {queriedState}
        );
        scanConcurrencyPromises = [];
      }
    }
    if (scanConcurrencyPromises.length >= 0) { // Update state and JSON at end of querying
      const scannedChunks = await Promise.all(scanConcurrencyPromises);
      const capturedEvents = scannedChunks.reduce((acc, chunk) => acc.concat(chunk.events), [] as CapturedEvent[]);
      queriedState = queriedState.concat(capturedEvents);
      writeJSON(
        `${CONFIG_DIRECTORY}${batch.batchFileName}`, 
        {queriedState}
      );
    }
    console.log(`... ✅ Finished ${batch.batchName} @ ${CONFIG_DIRECTORY}${batch.batchFileName}`);
  }

  console.log("🏁 Scanning DONE 🏁");

  exit();
}

main();