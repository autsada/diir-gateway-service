import { WillSendRequestOptions, RESTDataSource } from "@apollo/datasource-rest"
// KeyValueCache is the type of Apollo server's default cache
import type { KeyValueCache } from "@apollo/utils.keyvaluecache"

import { NexusGenObjects, NexusGenEnums, NexusGenInputs } from "../typegen"
import type { Environment } from "../types"
import { authClient } from "../client/authClient"

const { NODE_ENV } = process.env

const env = NODE_ENV as Environment

export class WalletAPI extends RESTDataSource {
  override baseURL = "http://localhost:8000"
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
   * @dev A route to create Firebase auth user
   */
  async createAuthUser(
    address: string
  ): Promise<NexusGenObjects["AuthUser"] | null> {
    return this.post("auth/user/create", { body: { address } })
  }

  /**
   * @dev A route to create blockchain wallet.
   */
  async createWallet(): Promise<NexusGenObjects["CreateWalletResult"] | null> {
    return this.post("wallet/create")
  }

  //   /**
  //    * @dev The route to get balance of a specific address.
  //    */
  //   async getBalance(address: string): Promise<{ balance: string }> {
  //     return this.get(`wallet/balance/${encodeURIComponent(address)}`)
  //   }

  //   // =========================== //
  //   // These below functions except `createFirstProfile` are for only admin role, and will be used in development only, in production admin will connect to the blockchain directly from the UI for better security.
  //   async setProfileForFollow(
  //     contractAddress: string
  //   ): Promise<{ status: string }> {
  //     return this.post("admin/set/profile-follow", { body: { contractAddress } })
  //   }

  //   async setProfileForPublish(
  //     contractAddress: string
  //   ): Promise<{ status: string }> {
  //     return this.post("admin/set/profile-publish", { body: { contractAddress } })
  //   }

  //   async setOwner(ownerAddress: string): Promise<{ status: string }> {
  //     return this.post("admin/set/owner", { body: { ownerAddress } })
  //   }

  //   async setProfileForLike(
  //     contractAddress: string
  //   ): Promise<{ status: string }> {
  //     return this.post("admin/set/profile-like", { body: { contractAddress } })
  //   }

  //   async setPublishForLike(
  //     contractAddress: string
  //   ): Promise<{ status: string }> {
  //     return this.post("admin/set/publish-like", { body: { contractAddress } })
  //   }

  //   async setLikeFee(fee: number): Promise<{ status: string }> {
  //     return this.post("admin/set/fee/like", { body: { fee } })
  //   }

  //   async setPlatformFee(fee: number): Promise<{ status: string }> {
  //     return this.post("admin/set/fee/platform", { body: { fee } })
  //   }

  //   async withdrawFunds(): Promise<{ status: string }> {
  //     return this.post("admin/withdraw")
  //   }

  //   async setProfileForComment(
  //     contractAddress: string
  //   ): Promise<{ status: string }> {
  //     return this.post("admin/set/profile-comment", { body: { contractAddress } })
  //   }

  //   async setPublishForComment(
  //     contractAddress: string
  //   ): Promise<{ status: string }> {
  //     return this.post("admin/set/publish-comment", { body: { contractAddress } })
  //   }

  //   /**
  //    * This function will be also used in production
  //    */
  //   async createFirstProfile(
  //     input: NexusGenInputs["CreateDefaultProfileInput"]
  //   ): Promise<{ status: string }> {
  //     return this.post("admin/profile/create", { body: { ...input } })
  //   }

  //   // ======================= //
  //   /**
  //    * A route to verify id token
  //    * @dev We need to verify user's id token for the mutation/route that makes write request to the `API` service directly.
  //    */
  //   async verifyIdToken(): Promise<{ uid: string }> {
  //     return this.get("token/verify")
  //   }

  //   // ======================= //

  //   /// ***********************
  //   /// ***** Profile Contract *****
  //   /// ***********************

  //   /**
  //    * @dev The route to check if an address has specified role.
  //    * @param role {Role} - see Role enum
  //    */
  //   async hasRoleProfile(
  //     role: NexusGenEnums["Role"]
  //   ): Promise<{ hasRole: boolean }> {
  //     return this.post(`profiles/role`, {
  //       body: { role },
  //     })
  //   }

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
  //    * @dev Call validate handle on the contract which will validate length and uniqueness.
  //    * @param handle {string}
  //    */
  //   async verifyHandle(handle: string): Promise<{ valid: boolean }> {
  //     return this.post("profiles/handle/verify", { body: { handle } })
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
