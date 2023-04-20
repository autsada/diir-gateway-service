import { WillSendRequestOptions, RESTDataSource } from "@apollo/datasource-rest"
// KeyValueCache is the type of Apollo server's default cache
import type { KeyValueCache } from "@apollo/utils.keyvaluecache"

import { NexusGenObjects, NexusGenEnums } from "../typegen"
import type { Environment } from "../types"
import { authClient } from "../client/authClient"

const { NODE_ENV, WALLET_SERVICE_URL } = process.env

const env = NODE_ENV as Environment

export class WalletAPI extends RESTDataSource {
  override baseURL =
    env === "development" ? "http://localhost:8000" : WALLET_SERVICE_URL!
  private idToken: string | undefined

  constructor(options: { idToken: string | undefined; cache: KeyValueCache }) {
    super(options) // this sends our server's `cache` through
    this.idToken = options.idToken
  }

  protected override async willSendRequest(
    req: WillSendRequestOptions
  ): Promise<void> {
    // The token for use to authenticate between services in GCP
    if (env !== "development") {
      const token = await authClient.getIdToken()
      req.headers["authorization"] = token || ""
    }
    // The id token that to be sent from the UI for use to verify user.
    req.headers["id-token"] = this.idToken || ""
  }

  // async createCryptoKey(): Promise<{ keyName: string }> {
  //   return this.post('admin/key/create/master')
  // }

  /**
   * @dev A route to get user's auth provider
   */
  async verifyUser(): Promise<{ uid: string }> {
    return this.get("auth/verify")
  }

  /**
   * @dev A route to create Firebase auth user
   */
  async createAuthUser(
    address: string
  ): Promise<{ user: NexusGenObjects["AuthUser"] }> {
    return this.post("auth/user/create", { body: { address } })
  }

  /**
   * @dev A route to get user's auth provider
   */
  async getAuthProvider(): Promise<{ provider: NexusGenEnums["AccountType"] }> {
    return this.get("auth/provider")
  }

  /**
   * @dev A route to get user's wallet address (for `TRADITIONAL` account)
   */
  async getWalletAddress(): Promise<{ address: string }> {
    return this.get("wallet/address")
  }

  /**
   * @dev A route to create blockchain wallet (for `TRADITIONAL` account).
   */
  async createWallet(): Promise<NexusGenObjects["CreateWalletResult"]> {
    return this.post("wallet/create")
  }

  /**
   * @dev A route to get balance of a specific address.
   */
  async getBalance(address: string): Promise<{ balance: string }> {
    return this.get(`wallet/balance/${encodeURIComponent(address)}`)
  }

  /// ***********************
  /// ***** Station Contract *****
  /// ***********************

  /**
   * @dev Validate station name
   * @param name {string}
   * @returns {valid} boolean
   */
  async validateName(name: string): Promise<{ valid: boolean }> {
    return this.post("station/validate", { body: { name } })
  }

  /**
   * @dev Mint user's first Station NFT
   */
  async mintStationNFTByAdmin(input: {
    to: string
    name: string
  }): Promise<{ tokenId: number }> {
    return this.post("station/mint-first", { body: input })
  }

  /**
   * @dev Mint Station NFT
   */
  async mintStationNFT(input: {
    to: string
    name: string
  }): Promise<{ tokenId: number }> {
    return this.post("station/mint", { body: input })
  }

  /**
   * @dev Calculate how much tips in wei for a given usd amount
   */
  async calculateTips(qty: number): Promise<{ tips: number }> {
    return this.post("station/tips/check", { body: { qty } })
  }

  /**
   * @dev Send tips to station owner
   * @param to station NAME to send the tips to
   * @param qty usd amount to be sent
   */
  async sendTips(
    to: string,
    qty: number
  ): Promise<{ result: NexusGenObjects["SendTipsResult"] }> {
    return this.post("station/tips/send", { body: { to, qty } })
  }
}
