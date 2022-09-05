import { BigNumber, ethers } from "ethers";
import { ADDRESSES } from "../contracts/index";

//================================Block querying helper=================================

type QueryBlockForContractEventOptions = {
  startBlock: number;
  endBlock: number;
  contract: ethers.Contract;
  eventFilter: ethers.EventFilter;
  eventName: string;
}

export const queryBlockForContractEvent = async (options: QueryBlockForContractEventOptions, eventsHandler?: (result: ethers.Event[]) => Promise<any | void>) => {
  const { startBlock, endBlock, contract, eventFilter, eventName } = options;
  console.log(`🔍 ... Query from ${startBlock} to ${endBlock} for ${eventName}`);

  const eventsStartToEnd = await contract.queryFilter(
    eventFilter,
    startBlock,
    endBlock
  );

  if (eventsHandler) {
    return await eventsHandler(eventsStartToEnd);
  } else {
    return eventsStartToEnd;
  }
}

//================================Event Handlers=================================

export type CapturedEvent = 
  DiaOracleOracleUpdateEventHandlerResults | 
  ActivePoolCollAmountUpdatedEventHandlerResults | 
  VaultManagerEventsHandlerResults | 
  GovTokenTransferEventHandlerResults;

export type VaultManagerEventsHandlerResults = {
  event: string,
  block: number, 
  userAddress: string,
  collateralBalance: BigNumber, 
  collateralName: string
}

export function VaultUpdatedEventsHandler(events: ethers.Event[]): CapturedEvent[] {
  const eventResults: any = [];
  for (const i of events) {
    const event: any = i;
    const eventName = event.event;
    const borrower = event.args[0];
    const collateralAmount = event.args[2];
    const block = event.blockNumber;

    const contractAddress = event.address;
    let collateralName;
    if (contractAddress == ADDRESSES.BUSD.BorrowerOperations || contractAddress == ADDRESSES.BUSD.VaultManager) {
      collateralName = "BUSD";
    } else if (contractAddress == ADDRESSES.DAI.BorrowerOperations || contractAddress == ADDRESSES.DAI.VaultManager) {
      collateralName = "DAI";
    } else if (contractAddress == ADDRESSES.DOT.BorrowerOperations || contractAddress == ADDRESSES.DOT.VaultManager) {
      collateralName = "DOT";
    } else if (contractAddress == ADDRESSES.USDC.BorrowerOperations || contractAddress == ADDRESSES.USDC.VaultManager) {
      collateralName = "USDC";
    } else if (contractAddress == ADDRESSES.USDT.BorrowerOperations || contractAddress == ADDRESSES.USDT.VaultManager) {
      collateralName = "USDT";
    } else if (contractAddress == ADDRESSES.WASTR.BorrowerOperations || contractAddress == ADDRESSES.WASTR.VaultManager) {
      collateralName = "WASTR";
    } else if (contractAddress == ADDRESSES.WBTC.BorrowerOperations || contractAddress == ADDRESSES.WBTC.VaultManager) {
      collateralName = "WBTC";
    } else {
      collateralName = "WETH";
    }

    eventResults.push({
      event: eventName == undefined ? "no name" : eventName,
      block, 
      userAddress: borrower,
      collateralBalance: collateralAmount, 
      collateralName
    });
  };
  return eventResults;
}

export type DiaOracleOracleUpdateEventHandlerResults = {
  event: string,
  block: number, 
  price: BigNumber, 
  collateralPair: string
};

export function diaOracleOracleUpdateEventHandler(events: ethers.Event[]): CapturedEvent[] {
  const eventResults: DiaOracleOracleUpdateEventHandlerResults[] = [];
  for (const event of events) {
    if (!event.args) {
      continue;
    }
    const eventName = event.event;
    const collateralPair = event.args.key;
    const price = event.args.value;
    const block = event.blockNumber;

    if (
      collateralPair == 'ASTR/USD' || 
      collateralPair == 'BUSD/USD' ||
      collateralPair == 'DAI/USD'  || 
      collateralPair == 'DOT/USD'  ||
      collateralPair == 'USDC/USD' || 
      collateralPair == 'USDT/USD' ||
      collateralPair == 'BTC/USD'  || 
      collateralPair == 'ETH/USD'
    ) {
      eventResults.push({
        event: eventName == undefined ? "no name" : eventName,
        block, 
        price, 
        collateralPair
      });
    }

  };
  return eventResults;
}

export type ActivePoolCollAmountUpdatedEventHandlerResults = {
  event: string,
  block: number, 
  collAmount: BigNumber, 
  collateralName: string
};

export function activePoolCollAmountUpdatedEventHandler(events: ethers.Event[]): CapturedEvent[] {
  const eventResults: ActivePoolCollAmountUpdatedEventHandlerResults[] = [];
  for (const event of events) {
    if (!event.args) {
      continue;
    }
    const eventName = event.event;
    const collAmount = event.args._COL;
    const block = event.blockNumber;
    const contractAddress = event.address;

    let collateralName;
    if (contractAddress == ADDRESSES.BUSD.ActivePool) {
      collateralName = "BUSD";
    } else if (contractAddress == ADDRESSES.DAI.ActivePool) {
      collateralName = "DAI";
    } else if (contractAddress == ADDRESSES.DOT.ActivePool) {
      collateralName = "DOT";
    } else if (contractAddress == ADDRESSES.USDC.ActivePool) {
      collateralName = "USDC";
    } else if (contractAddress == ADDRESSES.USDT.ActivePool) {
      collateralName = "USDT";
    } else if (contractAddress == ADDRESSES.WASTR.ActivePool) {
      collateralName = "WASTR";
    } else if (contractAddress == ADDRESSES.WBTC.ActivePool) {
      collateralName = "WBTC";
    } else {
      collateralName = "WETH";
    }

    eventResults.push({
      event: eventName == undefined ? "no name" : eventName, 
      block, 
      collAmount, 
      collateralName
    });

  };
  return eventResults;
}

export type GovTokenTransferEventHandlerResults = {
  block: number, 
  from: string, 
  to: string,
  amount: BigNumber
};

export function govTokenTransferEventHandler(events: ethers.Event[]): CapturedEvent[] {
  const eventResults: GovTokenTransferEventHandlerResults[] = [];
  for (const event of events) {
    if (!event.args) {
      continue;
    }
    const block  = event.blockNumber;
    const from   = event.args.from;
    const to     = event.args.to;
    const amount = event.args.value;

    eventResults.push({
      block, 
      from, 
      to, 
      amount
    });

  };
  return eventResults;
}