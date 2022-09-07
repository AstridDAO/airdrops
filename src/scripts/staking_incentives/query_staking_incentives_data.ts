import assert from "assert";
import { exit } from "process";
import { ethers } from "ethers";
import { maybeRetry } from "../../utils";
const promptInput = require('prompt-sync')();
import {checkDirectoryExists, writeJSON} from "../../utils";
import { 
  CapturedEvent, 
  govTokenTransferEventHandler, 
  queryBlockForContractEvent, 
} from "../../services/handlers";
import { 
  govTokenContract, 
  GovTokenTransferEventFilter, 
  GOV_TOKEN_DEPLOYMENT_BLOCK, 
} from "../../contracts";

//=================================Config info================================= 

const CONFIG_DIRECTORY = "configs/"
const STAKING_INCENTIVES_DIRECTORY = 'configs/staking_incentives/'

const CONFIG = {
  scanStartBlock: GOV_TOKEN_DEPLOYMENT_BLOCK,  // inclusive, deliberately set to be earlier than rewardStartBlock.
  scanEndBlock: 1738250,  // inclusive
  queryChunkBlockCount: 1000,
}

function validateConfig() {
  assert(CONFIG.scanStartBlock < CONFIG.scanEndBlock, "scanStartBlock has to be smaller than scanEndBlock");
}

// List of batches of events to query
const EVENT_SCAN_CONFIG_BATCHES = [
  {
    batchName: "Gov Token Transfer querying", 
    batchFileName: "govTokenTransfers.json", 
    batchStartScanBlock: CONFIG.scanStartBlock, 
    maxConcurrency: 5,
    eventsToScan: [
      {
        name: "GovTokenTransfer",
        contract: govTokenContract,
        eventFilter: GovTokenTransferEventFilter,
        eventHandler: govTokenTransferEventHandler
      }
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
  checkDirectoryExists(STAKING_INCENTIVES_DIRECTORY);

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
    for (let currBlock = batch.batchStartScanBlock; currBlock <= CONFIG.scanEndBlock; currBlock += CONFIG.queryChunkBlockCount + 1) {
      
      // Get iteration block range
      const chunkStartBlock = currBlock;
      const chunkEndBlock = Math.min(
        chunkStartBlock + CONFIG.queryChunkBlockCount, 
        CONFIG.scanEndBlock
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
          `${STAKING_INCENTIVES_DIRECTORY}${batch.batchFileName}`, 
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
        `${STAKING_INCENTIVES_DIRECTORY}${batch.batchFileName}`, 
        {queriedState}
      );
    }
    console.log(`... ✅ Finished ${batch.batchName} @ ${STAKING_INCENTIVES_DIRECTORY}${batch.batchFileName}`);
  }

  console.log("🏁 Scanning DONE 🏁");

  exit();
}

main();