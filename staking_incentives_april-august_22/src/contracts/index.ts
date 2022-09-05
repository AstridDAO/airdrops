
import VaultManagerABI from "../../ABI/VaultManager.json";
import BorrowerOperationsABI from "../../ABI/BorrowerOperations.json";
import DiaOracleABI from "../../ABI/DiaOracle.json";
import ActivePoolABI from "../../ABI/ActivePool.json";
import GovTokenABI from "../../ABI/GovToken.json";
import * as dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

export const provider = new ethers.providers.WebSocketProvider(
  process.env.RPC_URL as string
);

//=================================Misc.=======================================

export const GOV_TOKEN_DEPLOYMENT_BLOCK = 912772;

// collateral precisions
export const COLLATERAL_PRECISION: {[key:string]: number} = {
  BUSD: 18, 
  DAI: 18, 
  DOT: 10, 
  USDC: 6, 
  USDT: 6, 
  WASTR: 18, 
  WBTC: 8, 
  WETH: 18
}

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

//===============================Addresses=====================================

export const ADDRESSES = {
  BUSD: {
    PriceFeed: "0x9dD24d2Fb60d031822D88693A299CA6C9780F24B", 
    ActivePool: "0x892af684Afd5fCee1023f7811C35fd695Bf0cd6f", 
    BorrowerOperations: "0xBC92e40740a2f7728FF279e98b8C040cc3826645", 
    VaultManager: "0xf31Fb1458607A7a7CF8Eb474283E9CBE0Bbd9DEB"
  }, 
  DAI: {
    PriceFeed: "0xC3f16f90503291F2f47C441b5e81E0becb218479", 
    ActivePool: "0xCE90059FbCEc696634981945600d642A79e262aD", 
    BorrowerOperations: "0xD514f010FEbC8C252386c36df80e629a9cDb7F51", 
    VaultManager: "0xcABF68A491B3B7D8Cf844847C987484ebBbD9525"
  },
  DOT: {
    PriceFeed: "0xEfc5c5D68b462bf322F4e47Bd662356016A5f427", 
    ActivePool: "0x8cd0b101838b082133e25eEb76C916Ae2AC56f36", 
    BorrowerOperations: "0xf3F2783cbe0f58DDA6Fc77c5f0bC8494BbCaEbf3", 
    VaultManager: "0x75A21e01075F110c169E3ba126D9aFa04fA86573"
  },
  USDC: {
    PriceFeed: "0xB0A4d91311371D4b6E89ee86FEE03704B86E42f2", 
    ActivePool: "0x5070d543654D866964C44E610a3b7f85fcAf2859", 
    BorrowerOperations: "0x139fE8B6bEE75218c8c4A701537370a7Fe08CE00", 
    VaultManager: "0xebb648434dE9be4C8462e94DAEF275D8ee14C955"
  },
  USDT: {
    PriceFeed: "0x12006f393eD216A7507ADf4bF4dEE2fB6Cc973f8", 
    ActivePool: "0x74dFF63491B39E5fFE0Be44Ee3B23F674C27DB7c", 
    BorrowerOperations: "0x086A4EEA3bFDA105CC8dbCcecF7693d5ABFf88B7", 
    VaultManager: "0xf5c3a571Bdc10d3d6cf19da700B7796204a13a37"
  },
  WASTR: {
    PriceFeed: "0xb2c9eb6B5835d3DC1d9428673ECF957D8b008Bf9", 
    ActivePool: "0x70724b57618548eE97623146F76206033E67086e", 
    BorrowerOperations: "0x75Ef1B48eFCb1839457E9978623bf75657821B8d", 
    VaultManager: "0x0cF3E16948418649498b59c336ba38678842E2d4"
  },
  WBTC: {
    PriceFeed: "0x0FF212552e16694751eB82338b361979e9df9B4D", 
    ActivePool: "0x1685E4f68FD9A50246ce92F0eb07a977591F5Ba2", 
    BorrowerOperations: "0xC8fA59fe571E489a39D54753F6DD06cAca1335fA", 
    VaultManager: "0x7D40F75fF98b5048A5EbBb556D1353a0Eba4102b"
  },
  WETH: {
    PriceFeed: "0xe5F68Fb8943Ba36D74B57d285c00B6C000f2FAcB", 
    ActivePool: "0x5Ec419F08602caE5e4C591dE65bD640d66673035", 
    BorrowerOperations: "0x6F0dF12909eca6bf17C0102c6B6ee30aA0fbBBBc", 
    VaultManager: "0x3fb40643a0B8338495Bd86301966a5780eAEAbb4"
  }
}

const DIA_ADDRESS = "0xD7B7dc549A4C3E1113c9Ab92A82A31368082BCAc";

const GOV_TOKEN_ADDRESS = "0x97f6B7A15A77479F3EC331C6A93cbf599EC851A8";

//==================================Contracts==================================



export const ActivePoolContracts = {
  BUSD: new ethers.Contract(
    ADDRESSES.BUSD.ActivePool, 
    new ethers.utils.Interface(ActivePoolABI), 
    provider
  ), 
  DAI: new ethers.Contract(
    ADDRESSES.DAI.ActivePool, 
    new ethers.utils.Interface(ActivePoolABI), 
    provider
  ), 
  DOT: new ethers.Contract(
    ADDRESSES.DOT.ActivePool, 
    new ethers.utils.Interface(ActivePoolABI), 
    provider
  ), 
  USDC: new ethers.Contract(
    ADDRESSES.USDC.ActivePool, 
    new ethers.utils.Interface(ActivePoolABI), 
    provider
  ), 
  USDT: new ethers.Contract(
    ADDRESSES.USDT.ActivePool, 
    new ethers.utils.Interface(ActivePoolABI), 
    provider
  ), 
  WASTR: new ethers.Contract(
    ADDRESSES.WASTR.ActivePool, 
    new ethers.utils.Interface(ActivePoolABI), 
    provider
  ), 
  WBTC: new ethers.Contract(
    ADDRESSES.WBTC.ActivePool, 
    new ethers.utils.Interface(ActivePoolABI), 
    provider
  ), 
  WETH: new ethers.Contract(
    ADDRESSES.WETH.ActivePool, 
    new ethers.utils.Interface(ActivePoolABI), 
    provider
  )
}

export const BorrowerOperationsContracts = {
  BUSD: new ethers.Contract(
    ADDRESSES.BUSD.BorrowerOperations, 
    new ethers.utils.Interface(BorrowerOperationsABI), 
    provider
  ), 
  DAI: new ethers.Contract(
    ADDRESSES.DAI.BorrowerOperations, 
    new ethers.utils.Interface(BorrowerOperationsABI), 
    provider
  ), 
  DOT: new ethers.Contract(
    ADDRESSES.DOT.BorrowerOperations, 
    new ethers.utils.Interface(BorrowerOperationsABI), 
    provider
  ), 
  USDC: new ethers.Contract(
    ADDRESSES.USDC.BorrowerOperations, 
    new ethers.utils.Interface(BorrowerOperationsABI), 
    provider
  ), 
  USDT: new ethers.Contract(
    ADDRESSES.USDT.BorrowerOperations, 
    new ethers.utils.Interface(BorrowerOperationsABI), 
    provider
  ), 
  WASTR: new ethers.Contract(
    ADDRESSES.WASTR.BorrowerOperations, 
    new ethers.utils.Interface(BorrowerOperationsABI), 
    provider
  ), 
  WBTC: new ethers.Contract(
    ADDRESSES.WBTC.BorrowerOperations, 
    new ethers.utils.Interface(BorrowerOperationsABI), 
    provider
  ), 
  WETH: new ethers.Contract(
    ADDRESSES.WETH.BorrowerOperations, 
    new ethers.utils.Interface(BorrowerOperationsABI), 
    provider
  )
}

export const diaOracleContract = new ethers.Contract(
  DIA_ADDRESS, 
  new ethers.utils.Interface(DiaOracleABI), 
  provider
);

export const govTokenContract = new ethers.Contract(
  GOV_TOKEN_ADDRESS, 
  new ethers.utils.Interface(GovTokenABI), 
  provider
);

export const VaultManagerContracts = {
  BUSD: new ethers.Contract(
    ADDRESSES.BUSD.VaultManager, 
    new ethers.utils.Interface(VaultManagerABI), 
    provider
  ), 
  DAI: new ethers.Contract(
    ADDRESSES.DAI.VaultManager, 
    new ethers.utils.Interface(VaultManagerABI), 
    provider
  ), 
  DOT: new ethers.Contract(
    ADDRESSES.DOT.VaultManager, 
    new ethers.utils.Interface(VaultManagerABI), 
    provider
  ), 
  USDC: new ethers.Contract(
    ADDRESSES.USDC.VaultManager, 
    new ethers.utils.Interface(VaultManagerABI), 
    provider
  ), 
  USDT: new ethers.Contract(
    ADDRESSES.USDT.VaultManager, 
    new ethers.utils.Interface(VaultManagerABI), 
    provider
  ), 
  WASTR: new ethers.Contract(
    ADDRESSES.WASTR.VaultManager, 
    new ethers.utils.Interface(VaultManagerABI), 
    provider
  ), 
  WBTC: new ethers.Contract(
    ADDRESSES.WBTC.VaultManager, 
    new ethers.utils.Interface(VaultManagerABI), 
    provider
  ), 
  WETH: new ethers.Contract(
    ADDRESSES.WETH.VaultManager, 
    new ethers.utils.Interface(VaultManagerABI), 
    provider
  )
}

//================================Event filters================================


export const ActivePoolActivePoolCOLBalanceUpdatedEventFilters = {
  BUSD: ActivePoolContracts.BUSD.filters.ActivePoolCOLBalanceUpdated(
    null
  ), 
  DAI: ActivePoolContracts.DAI.filters.ActivePoolCOLBalanceUpdated(
    null
  ),
  DOT: ActivePoolContracts.DOT.filters.ActivePoolCOLBalanceUpdated(
    null
  ),
  USDC: ActivePoolContracts.USDC.filters.ActivePoolCOLBalanceUpdated(
    null
  ),
  USDT: ActivePoolContracts.USDT.filters.ActivePoolCOLBalanceUpdated(
    null
  ),
  WASTR: ActivePoolContracts.WASTR.filters.ActivePoolCOLBalanceUpdated(
    null
  ),
  WBTC: ActivePoolContracts.WBTC.filters.ActivePoolCOLBalanceUpdated(
    null
  ),
  WETH: ActivePoolContracts.WETH.filters.ActivePoolCOLBalanceUpdated(
    null
  ),
}

export const BorrowerOperationsVaultUpdatedEventFilters = {
  BUSD: BorrowerOperationsContracts.BUSD.filters.VaultUpdated(
    null,
    null,
    null,
    null,
    null
  ), 
  DAI: BorrowerOperationsContracts.DAI.filters.VaultUpdated(
    null,
    null,
    null,
    null,
    null
  ),
  DOT: BorrowerOperationsContracts.DOT.filters.VaultUpdated(
    null,
    null,
    null,
    null,
    null
  ),
  USDC: BorrowerOperationsContracts.USDC.filters.VaultUpdated(
    null,
    null,
    null,
    null,
    null
  ),
  USDT: BorrowerOperationsContracts.USDT.filters.VaultUpdated(
    null,
    null,
    null,
    null,
    null
  ),
  WASTR: BorrowerOperationsContracts.WASTR.filters.VaultUpdated(
    null,
    null,
    null,
    null,
    null
  ),
  WBTC: BorrowerOperationsContracts.WBTC.filters.VaultUpdated(
    null,
    null,
    null,
    null,
    null
  ),
  WETH: BorrowerOperationsContracts.WETH.filters.VaultUpdated(
    null,
    null,
    null,
    null,
    null
  ),
}

export const DiaOracleUpdateEventFilter = diaOracleContract.filters.OracleUpdate(
  null, 
  null, 
  null
);

export const GovTokenTransferEventFilter = govTokenContract.filters.Transfer(
  null, 
  null, 
  null
);

export const VaultManagerVaultUpdatedEventFilters = {
  BUSD: VaultManagerContracts.BUSD.filters.VaultUpdated(
    null,
    null,
    null,
    null,
    null
  ), 
  DAI: VaultManagerContracts.DAI.filters.VaultUpdated(
    null,
    null,
    null,
    null,
    null
  ),
  DOT: VaultManagerContracts.DOT.filters.VaultUpdated(
    null,
    null,
    null,
    null,
    null
  ),
  USDC: VaultManagerContracts.USDC.filters.VaultUpdated(
    null,
    null,
    null,
    null,
    null
  ),
  USDT: VaultManagerContracts.USDT.filters.VaultUpdated(
    null,
    null,
    null,
    null,
    null
  ),
  WASTR: VaultManagerContracts.WASTR.filters.VaultUpdated(
    null,
    null,
    null,
    null,
    null
  ),
  WBTC: VaultManagerContracts.WBTC.filters.VaultUpdated(
    null,
    null,
    null,
    null,
    null
  ),
  WETH: VaultManagerContracts.WETH.filters.VaultUpdated(
    null,
    null,
    null,
    null,
    null
  ),
}