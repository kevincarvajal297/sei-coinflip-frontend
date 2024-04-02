import { useState } from 'react'
import { connectKeplr } from '../services/keplr'
import { SigningCosmWasmClient, CosmWasmClient, JsonObject } from '@cosmjs/cosmwasm-stargate'
import { fromBase64, toBase64 } from '@cosmjs/encoding'
import {
  convertMicroDenomToDenom, 
  convertDenomToMicroDenom,
  convertFromMicroDenom
} from '../util/conversion'
import {NotificationContainer, NotificationManager} from 'react-notifications'
import { create } from 'ipfs-http-client'
import { coin } from '@cosmjs/launchpad'

import { useNotification } from '../components/Notification'

export interface ISigningCosmWasmClientContext {
  walletAddress: string
  client: CosmWasmClient | null
  signingClient: SigningCosmWasmClient | null
  loading: boolean
  error: any
  connectWallet: Function,
  disconnect: Function,

  getConfig: Function,
  config: any,
  isAdmin: boolean,

  getBalances: Function,
  nativeBalanceStr: string,
  nativeBalance: number,

  executeFlip: Function,
  executeRemoveTreasury: Function,

  getHistory: Function,
  historyList: any

}

export const PUBLIC_CHAIN_RPC_ENDPOINT = process.env.NEXT_PUBLIC_CHAIN_RPC_ENDPOINT || ''
export const PUBLIC_CHAIN_REST_ENDPOINT = process.env.NEXT_PUBLIC_CHAIN_REST_ENDPOINT || ''
export const PUBLIC_CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || ''
export const PUBLIC_STAKING_DENOM = process.env.NEXT_PUBLIC_STAKING_DENOM || 'ujuno'
export const PUBLIC_COINFLIP_CONTRACT = process.env.NEXT_PUBLIC_COINFLIP_CONTRACT || ''

export const defaultFee = {
  amount: [],
  gas: "400000",
}


export const useSigningCosmWasmClient = (): ISigningCosmWasmClientContext => {
  const [client, setClient] = useState<CosmWasmClient | null>(null)
  const [signingClient, setSigningClient] = useState<SigningCosmWasmClient | null>(null)

  const [walletAddress, setWalletAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  
  const [nativeBalanceStr, setNativeBalanceStr] = useState('')
  const [nativeBalance, setNativeBalance] = useState(0)

  const [config, setConfig] = useState({ owner: '', enabled: true, denom: null, treasury_amount: 0, flip_count: 0 })
  const [historyList, setHistoryList] = useState([])
  
  const { success: successNotification, error: errorNotification } = useNotification()

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ///////////////////////    connect & disconnect   //////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  const showNotification = false;
  const notify = (flag:boolean, str:String) => {
    if (!showNotification)
      return;

    if (flag)
      NotificationManager.success(str)
    else 
      NotificationManager.error(str)
  }
  const connectWallet = async (inBackground:boolean) => {
    if (!inBackground)
      setLoading(true)

    try {
      await connectKeplr()

      // enable website to access kepler
      await (window as any).keplr.enable(PUBLIC_CHAIN_ID)

      // get offline signer for signing txs
      const offlineSigner = await (window as any).getOfflineSignerOnlyAmino(
        PUBLIC_CHAIN_ID
      )

      // make client
      setClient(
        await CosmWasmClient.connect(PUBLIC_CHAIN_RPC_ENDPOINT)
      )

      // make client
      setSigningClient(
        await SigningCosmWasmClient.connectWithSigner(
          PUBLIC_CHAIN_RPC_ENDPOINT,
          offlineSigner
        )
      )

      // get user address
      const [{ address }] = await offlineSigner.getAccounts()
      setWalletAddress(address)

      localStorage.setItem("address", address)
      
      if (!inBackground) {
        setLoading(false)
        notify(true, "Connected Successfully")
      }
    } catch (error) {
      notify(false, `Connect error : ${error}`)
      if (!inBackground) {
        setLoading(false)
      }
    }
  }

  const disconnect = () => {
    if (signingClient) {
      localStorage.removeItem("address")
      signingClient.disconnect()
      
    }
    setIsAdmin(false)
    setWalletAddress('')
    setSigningClient(null)
    setLoading(false)
    notify(true, `Disconnected successfully`)
  }

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ///////////////////////    global variables    /////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  const getBalances = async () => {
    setLoading(true)
    try {
      const objectNative:JsonObject = await signingClient.getBalance(walletAddress, PUBLIC_STAKING_DENOM)
      setNativeBalanceStr(`${convertMicroDenomToDenom(objectNative.amount)} ${convertFromMicroDenom(objectNative.denom)}`)
      setNativeBalance(convertMicroDenomToDenom(objectNative.amount))
      setLoading(false)
      notify(true, `Successfully got balances`)
    } catch (error) {
      setLoading(false)
      notify(false, `GetBalances error : ${error}`)
    }
  }

  const getConfig = async () => {
    
    setLoading(true)
    try {
      const response:JsonObject = await signingClient.queryContractSmart(PUBLIC_COINFLIP_CONTRACT, {
        config: {}
      })
      setConfig(response)
      setIsAdmin(response.owner == walletAddress)
      setLoading(false)   
      notify(true, `Successfully got config`)
    } catch (error) {
      setLoading(false)
      notify(false, `getConfig error : ${error}`)
    }
  }

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ///////////////    Execute Flip and Remove Treasury     ////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  const executeFlip = async (level:string) => {
    setLoading(true)
    try {
    
      const result = await signingClient?.execute(
        walletAddress, // sender address
        PUBLIC_COINFLIP_CONTRACT, // token escrow contract
        { 
          "flip":
          {
            "level":level, 
          } 
        },
        defaultFee,
        undefined,
        [coin(parseInt(convertDenomToMicroDenom(level), 10), PUBLIC_STAKING_DENOM)]
      )
      setLoading(false)
      getBalances()
      if (result && result.transactionHash) {

        const response:JsonObject = await signingClient.getTx(result.transactionHash)
        let log_json = JSON.parse(response.rawLog)
        let wasm_events = log_json[0].events[5].attributes
        
        if (wasm_events[4].value == 'true') 
          successNotification({ title: `You Win`, txHash: result.transactionHash })
        else
          errorNotification({ title: `You Lose`, txHash: result.transactionHash })
      }
    } catch (error) {
      setLoading(false)
      notify(false, `Flip error : ${error}`)
    }
  }

  const executeRemoveTreasury = async (amount:number) => {
    setLoading(true)
 
    try {
    
      const result = await signingClient?.execute(
        walletAddress, // sender address
        PUBLIC_COINFLIP_CONTRACT, // token escrow contract
        { 
          "remove_treasury":
          {
            "amount":`${parseInt(convertDenomToMicroDenom(amount), 10)}`, 
          } 
        }, // msg
        defaultFee,
        undefined,
        []
      )
      setLoading(false)
      getConfig()
      getBalances()
      if (result && result.transactionHash) {
        successNotification({ title: 'Remove Treasury Successful', txHash: result.transactionHash })
      }
      notify(true, 'Successfully executed')
    } catch (error) {
      setLoading(false)
      notify(false, `RemoveTreasury error : ${error}`)
    }
  }

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ///////////////    Get History            //////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  
  const getHistory = async () => {
    setLoading(true)
    try {
      const response:JsonObject = await signingClient.queryContractSmart(PUBLIC_COINFLIP_CONTRACT, {
        history: {count: 100}
      })
      
      setHistoryList(response.list)
      setLoading(false)

      notify(true, 'Successfully got History')
    } catch (error) {
      setLoading(false)
      notify(false, `GetHistory Error : ${error}`)
      console.log(error)
    }
  }

  return {
    walletAddress,
    signingClient,
    loading,
    error,
    connectWallet,
    disconnect,
    client,
    getConfig,
    config,
    isAdmin,


    getBalances,
    nativeBalanceStr,
    nativeBalance,

    executeFlip,
    executeRemoveTreasury,

    getHistory,
    historyList
  }
}
