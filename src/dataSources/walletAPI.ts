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

  //   /**
  //    * @dev Create profile NFT.
  //    * @param input see CreateProfileInput type
  //    */
  //   async createProfile(
  //     input: NexusGenInputs["CreateProfileInput"]
  //   ): Promise<{ status: string }> {
  //     return this.post(`profiles/create`, { body: { ...input } })
  //   }

  //   /**
  //    * @dev Set a profile as default.
  //    * @param handle {string} - the handle to be set as default
  //    */
  //   async setDefaultProfile(handle: string): Promise<{ status: string }> {
  //     return this.post(`profiles/default`, {
  //       body: { handle },
  //     })
  //   }

  //   /**
  //    * @dev Estimate gas for creating a profile nft.
  //    * @param input see CreateProfileInput type
  //    */
  //   async estimateGasCreateProfile(
  //     input: NexusGenInputs["CreateProfileInput"]
  //   ): Promise<{ gas: string }> {
  //     return this.post(`profiles/gas/create`, { body: { ...input } })
  //   }

  //   /**
  //    * @dev Get user's default profile.
  //    */
  //   async getDefaultProfile(): Promise<{
  //     token: NexusGenObjects["ProfileToken"]
  //   }> {
  //     return this.get(`profiles/default`)
  //   }

  //   /**
  //    * @dev Get profile's image uri.
  //    * @param tokenId {number}
  //    */
  //   async getProfileImage(tokenId: number): Promise<{ uri: string }> {
  //     return this.get(`profiles/token-uri/tokenId/${encodeURIComponent(tokenId)}`)
  //   }

  //   // ======================= //

  //   /// ***********************
  //   /// ***** Publish Contract *****
  //   /// ***********************

  //   /**
  //    * @dev The route to check if an address has specified role.
  //    * @param role {Role} - see Role enum
  //    */
  //   async hasRolePublish(
  //     role: NexusGenEnums["Role"]
  //   ): Promise<{ hasRole: boolean }> {
  //     return this.post(`publishes/role`, {
  //       body: { role },
  //     })
  //   }

  //   /**
  //    * @dev Create publish nft
  //    * @param input see CreatePublishInput type
  //    */
  //   async createPublishNFT(
  //     input: Pick<
  //       NexusGenInputs["CreatePublishNFTInput"],
  //       "creatorId" | "metadataURI"
  //     >
  //   ): Promise<{ status: string }> {
  //     return this.post(`publishes/create`, { body: { ...input } })
  //   }

  //   /**
  //    * @dev Delete publish nft
  //    * @param publishTokenId {string} - a publish token id
  //    * @param creatorTokenId {string} - a profile token id
  //    */
  //   async deletePublishNFT(
  //     publishTokenId: string,
  //     creatorTokenId: string
  //   ): Promise<{ status: string }> {
  //     return this.post(`publishes/delete`, {
  //       body: {
  //         publishTokenId,
  //         creatorTokenId,
  //       },
  //     })
  //   }

  //   /**
  //    * @dev Estimate gas for creating a publish nft.
  //    * @param input see CreateProfileInput type
  //    */
  //   async estimateGasCreatePublishNFT(
  //     input: NexusGenInputs["CreatePublishNFTInput"]
  //   ): Promise<{ gas: string }> {
  //     return this.post(`publishes/gas/create`, { body: { ...input } })
  //   }

  //   // ======================= //

  //   /// ***********************
  //   /// ***** Comment Contract *****
  //   /// ***********************

  //   /**
  //    * @dev The route to check if an address has specified role.
  //    * @param role {Role} - see Role enum
  //    */
  //   async hasRoleComment(
  //     role: NexusGenEnums["Role"]
  //   ): Promise<{ hasRole: boolean }> {
  //     return this.post(`comments/role`, {
  //       body: { role },
  //     })
  //   }

  //   /**
  //    * @dev Make a comment on a publish
  //    * @param input see CreateCommentOnPublishInput type
  //    */
  //   async commentOnPublish(
  //     input: NexusGenInputs["CreateCommentInput"]
  //   ): Promise<{ status: string }> {
  //     return this.post(`comments/publish`, { body: { ...input } })
  //   }

  //   /**
  //    * @dev Make a comment on a comment
  //    * @param input see CreateCommentOnCommentInput type
  //    */
  //   async commentOnComment(
  //     input: NexusGenInputs["CreateCommentInput"]
  //   ): Promise<{ status: string }> {
  //     return this.post(`comments/comment`, { body: { ...input } })
  //   }

  //   /**
  //    * @dev Update comment nft
  //    * @param input see UpdateCommentInput type
  //    */
  //   async updateComment(
  //     input: NexusGenInputs["UpdateCommentInput"]
  //   ): Promise<{ status: string }> {
  //     return this.post(`comments/update`, { body: { ...input } })
  //   }

  //   /**
  //    * @dev Delete comment nft
  //    * @param commentId {number} - a comment token id
  //    * @param creatorId {number} - a profile token id
  //    */
  //   async deleteComment(
  //     commentId: number,
  //     creatorId: number
  //   ): Promise<{ status: string }> {
  //     return this.post(`comments/delete`, {
  //       body: {
  //         commentId,
  //         creatorId,
  //       },
  //     })
  //   }

  //   /**
  //    * @dev Like a comment
  //    * @param commentId {number} - a comment token id
  //    * @param profileId {number} - a profile token id
  //    */
  //   async likeComment(
  //     commentId: number,
  //     profileId: number
  //   ): Promise<{ status: string }> {
  //     return this.post(`comments/like`, {
  //       body: {
  //         commentId,
  //         profileId,
  //       },
  //     })
  //   }

  //   /**
  //    * @dev DisLike a comment
  //    * @param commentId {number} - a comment token id
  //    * @param profileId {number} - a profile token id
  //    */
  //   async disLikeComment(
  //     commentId: number,
  //     profileId: number
  //   ): Promise<{ status: string }> {
  //     return this.post(`comments/disLike`, {
  //       body: {
  //         commentId,
  //         profileId,
  //       },
  //     })
  //   }

  //   /**
  //    * @dev Get one comment by provided token id
  //    */
  //   async getComment(
  //     tokenId: number
  //   ): Promise<{ token: NexusGenObjects["CommentToken"] }> {
  //     return this.get(`comments/commentId/${encodeURIComponent(tokenId)}`)
  //   }

  //   /**
  //    * @dev Get the Profile contract address stored on the Comment contract.
  //    */
  //   async getProfileAddressFromComment(): Promise<{ address: string }> {
  //     return this.get(`comments/profile-contract`)
  //   }

  //   /**
  //    * @dev Get the Publish contract address stored on the Comment contract.
  //    */
  //   async getPublishAddressFromComment(): Promise<{ address: string }> {
  //     return this.get(`comments/publish-contract`)
  //   }

  //   // ======================= //

  //   /// ***********************
  //   /// ***** Like Contract *****
  //   /// ***********************

  //   /**
  //    * @dev The route to check if an address has specified role.
  //    * @param role {Role} - see Role enum
  //    */
  //   async hasRoleLike(
  //     role: NexusGenEnums["Role"]
  //   ): Promise<{ hasRole: boolean }> {
  //     return this.post(`likes/role`, {
  //       body: { role },
  //     })
  //   }

  //   /**
  //    * @dev Like a publish
  //    * @param publishId {number} - a publish token id
  //    * @param profileId {number} - a profile token id
  //    */
  //   async likePublish(
  //     publishId: number,
  //     profileId: number
  //   ): Promise<{ status: string }> {
  //     return this.post(`likes/like`, {
  //       body: {
  //         publishId,
  //         profileId,
  //       },
  //     })
  //   }

  //   /**
  //    * @dev DisLike a publish
  //    * @param publishId {number} - a publish token id
  //    * @param profileId {number} - a profile token id
  //    */
  //   async disLikePublish(
  //     publishId: number,
  //     profileId: number
  //   ): Promise<{ status: string }> {
  //     return this.post(`likes/disLike`, {
  //       body: {
  //         publishId,
  //         profileId,
  //       },
  //     })
  //   }

  //   /**
  //    * @dev Estimate gas to like a publish.
  //    * @param publishId {number} - a publish token id
  //    * @param profileId {number} - a profile token id
  //    */
  //   async estimateGasLikePublish(
  //     publishId: number,
  //     profileId: number
  //   ): Promise<{ gas: string }> {
  //     return this.post(`likes/gas/like`, {
  //       body: {
  //         publishId,
  //         profileId,
  //       },
  //     })
  //   }

  //   async getOwnerAddress(): Promise<{ address: string }> {
  //     return this.get("likes/platform-owner")
  //   }

  //   async getProfileAddressFromLike(): Promise<{ address: string }> {
  //     return this.get("likes/profile-contract")
  //   }

  //   async getPublishAddressFromLike(): Promise<{ address: string }> {
  //     return this.get("likes/publish-contract")
  //   }

  //   async getLikeFee(): Promise<{ fee: number }> {
  //     return this.get("likes/fee/like")
  //   }

  //   async getPlatformFee(): Promise<{ fee: number }> {
  //     return this.get("likes/fee/platform")
  //   }
}
