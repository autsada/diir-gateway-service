import {
  objectType,
  inputObjectType,
  extendType,
  nonNull,
  nullable,
} from "nexus"
import { Station as StationModel, Follow as FollowModel } from "nexus-prisma"

import { NexusGenInputs } from "../typegen"
import {
  throwError,
  badInputErrMessage,
  unauthorizedErrMessage,
  notFoundErrMessage,
} from "./Error"
import { generateColor, validateAuthenticity } from "../lib"

export const Follow = objectType({
  name: FollowModel.$name,
  definition(t) {
    t.field(FollowModel.followerId)
    t.field(FollowModel.follower)
    t.field(FollowModel.followingId)
    t.field(FollowModel.following)
  },
})

/**
 * A Station type that map to the prisma Station model.
 */
export const Station = objectType({
  name: StationModel.$name,
  definition(t) {
    t.field(StationModel.id)
    t.field(StationModel.tokenId)
    t.nonNull.field("createdAt", { type: "DateTime" })
    t.field("updatedAt", { type: "DateTime" })
    t.field(StationModel.owner)
    t.field(StationModel.name)
    t.field(StationModel.displayName)
    t.field(StationModel.image)
    t.field(StationModel.imageRef)
    t.field(StationModel.bannerImage)
    t.field(StationModel.bannerImageRef)
    t.field(StationModel.defaultColor)
    t.field(StationModel.accountId)
    t.field(StationModel.account)
    t.field(StationModel.watchLater)
    // t.field(StationModel.playlists)

    t.nonNull.field("followersCount", {
      type: "Int",
      resolve: (parent, _, { prisma }) => {
        return prisma.follow.count({
          where: {
            followerId: parent.id,
          },
        })
      },
    })
    t.nonNull.field("followingCount", {
      type: "Int",
      resolve: (parent, _, { prisma }) => {
        return prisma.follow.count({
          where: {
            followingId: parent.id,
          },
        })
      },
    })

    /**
     * A boolean to check whether a station (who makes the query) is following the queried station or not, if no `userId` provided resolve to null.
     */
    t.nullable.field("isFollowing", {
      type: "Boolean",
      resolve: async (parent, _, { prisma }, info) => {
        const { input } = info.variableValues as {
          input: NexusGenInputs["QueryByIdInput"]
        }

        if (!input || !input.requestorId) return null
        const { requestorId } = input

        const following = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: parent.id,
              followingId: requestorId,
            },
          },
        })

        return !!following
      },
    })

    /**
     * Query first 30 publishes of the station
     */
    t.field({
      ...StationModel.publishes,
      async resolve(parent, _, { prisma }) {
        return prisma.publish.findMany({
          where: {
            creatorId: parent.id,
          },
          take: 30,
        })
      },
    })

    /**
     * Station's publishes count.
     */
    t.nonNull.field("publishesCount", {
      type: "Int",
      resolve: (parent, _, { prisma }) => {
        return prisma.publish.count({
          where: {
            creatorId: parent.id,
          },
        })
      },
    })

    /**
     * A boolean to indicate of the querying user is the owner of the station
     */
    t.nullable.field("isOwner", {
      type: "Boolean",
      resolve: async (parent, _, { prisma }, info) => {
        const { input } = info.variableValues as {
          input: NexusGenInputs["QueryByIdInput"]
        }

        if (!input || !input.requestorId) return null
        const { requestorId } = input
        const stationOwner = parent.owner.toLowerCase()

        // Get requestor station
        const requestor = await prisma.station.findUnique({
          where: {
            id: requestorId,
          },
        })

        return stationOwner === requestor?.owner?.toLowerCase()
      },
    })
  },
})

/**
 * An input type for `getStationById` query.
 */
export const QueryByIdInput = inputObjectType({
  name: "QueryByIdInput",
  definition(t) {
    // An id of the target station.
    t.nonNull.string("targetId")
    // An id of the requestor station.
    t.nullable.string("requestorId")
  },
})

/**
 * An input type for `getStationByName` query.
 */
export const QueryByNameInput = inputObjectType({
  name: "QueryByNameInput",
  definition(t) {
    // A name of the target station.
    t.nonNull.string("name")
    // An id of the requestor station.
    t.nullable.string("requestorId")
  },
})

export const StationQuery = extendType({
  type: "Query",
  definition(t) {
    /**
     * Query station by id
     */
    t.field("getStationById", {
      type: nullable("Station"),
      args: { input: nonNull("QueryByIdInput") },
      async resolve(_parent, { input }, { prisma }) {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { targetId } = input

          if (!targetId) throwError(badInputErrMessage, "BAD_USER_INPUT")

          return prisma.station.findUnique({
            where: { id: targetId },
          })
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * Query station by name
     */
    t.field("getStationByName", {
      type: nullable("Station"),
      args: { input: nonNull("QueryByNameInput") },
      async resolve(_parent, { input }, { prisma }) {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { name } = input

          if (!name) throwError(badInputErrMessage, "BAD_USER_INPUT")

          return prisma.station.findUnique({
            where: { name },
          })
        } catch (error) {
          throw error
        }
      },
    })
  },
})

/**
 * An input type for `mintStationNFT` mutation.
 */
export const MintStationNFTInput = inputObjectType({
  name: "MintStationNFTInput",
  definition(t) {
    t.nonNull.string("to")
    t.nonNull.string("name")
    t.nonNull.string("accountId")
  },
})

/**
 * A result for `mintStationNFT` mutation
 */
export const MintStationNFTResult = objectType({
  name: "MintStationNFTResult",
  definition(t) {
    t.nonNull.int("tokenId")
  },
})

/**
 * An input type for `createStation` mutation.
 */
export const CreateStationInput = inputObjectType({
  name: "CreateStationInput",
  definition(t) {
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("name")
    t.nonNull.int("tokenId")
  },
})

/**
 * An input type for `updateDisplayName` mutation.
 */
export const UpdateDisplayNameInput = inputObjectType({
  name: "UpdateDisplayNameInput",
  definition(t) {
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("name")
    t.nonNull.string("stationId")
  },
})

/**
 * An input type for `updateProfileImage` mutation.
 */
export const UpdateImageInput = inputObjectType({
  name: "UpdateImageInput",
  definition(t) {
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("image")
    t.nonNull.string("imageRef")
    t.nonNull.string("stationId")
  },
})

/**
 * A result for `calculateTips` mutation
 */
export const CalculateTipsResult = objectType({
  name: "CalculateTipsResult",
  definition(t) {
    t.nonNull.int("tips")
  },
})

/**
 * An input type for `sendTips` mutation
 */
export const SendTipsInput = inputObjectType({
  name: "SendTipsInput",
  definition(t) {
    t.nonNull.string("senderId")
    t.nonNull.string("publishId")
    t.nonNull.string("receiverId")
    t.nonNull.int("qty") // An amount of usd to be sent
  },
})

/**
 * A result for `sendTips` mutation
 */
export const SendTipsResult = objectType({
  name: "SendTipsResult",
  definition(t) {
    t.nonNull.string("from")
    t.nonNull.string("to")
    t.nonNull.string("amount")
    t.nonNull.string("fee")
  },
})

export const StationMutation = extendType({
  type: "Mutation",
  definition(t) {
    /**
     * For user's first station, mint a Station NFT by admin so user will not have to pay gas
     */
    t.field("mintFirstStationNFT", {
      type: "MintStationNFTResult",
      args: { input: nonNull("MintStationNFTInput") },
      resolve: async (
        _parent,
        { input },
        { dataSources, prisma, signature }
      ) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { to, name, accountId } = input
          if (!to || !name || !accountId)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Validate authentication/authorization
          await validateAuthenticity({
            accountId,
            owner: to,
            dataSources,
            prisma,
            signature,
          })

          const result = await dataSources.walletAPI.mintStationNFTByAdmin({
            to,
            name,
          })

          return { tokenId: result?.tokenId }
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * Mint next station NFT, user has to pay gas
     */
    t.field("mintStationNFT", {
      type: "MintStationNFTResult",
      args: { input: nonNull("MintStationNFTInput") },
      resolve: async (
        _parent,
        { input },
        { dataSources, prisma, signature }
      ) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { to, name, accountId } = input
          if (!to || !name || !accountId)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Validate authentication/authorization
          await validateAuthenticity({
            accountId,
            owner: to,
            dataSources,
            prisma,
            signature,
          })

          const result = await dataSources.walletAPI.mintStationNFT({
            to,
            name,
          })

          return { tokenId: result?.tokenId }
        } catch (error) {
          throw error
        }
      },
    })

    t.field("createStation", {
      type: "Station",
      args: { input: nonNull("CreateStationInput") },
      resolve: async (
        _parent,
        { input },
        { prisma, dataSources, signature }
      ) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { owner, accountId, name, tokenId } = input
          if (!owner || !accountId || !name || !tokenId)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          const ownerAddress = owner.toLowerCase()

          // Validate authentication/authorization
          await validateAuthenticity({
            accountId,
            owner,
            dataSources,
            prisma,
            signature,
          })

          // Create a station in the database
          const station = await prisma.station.create({
            data: {
              tokenId,
              owner: ownerAddress,
              name: name.toLowerCase(), // Make sure to lowercase name
              displayName: name,
              accountId,
              defaultColor: generateColor(),
            },
          })

          return station
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Validate display name uniqueness
     * @param name {string}
     */
    t.field("validateDisplayName", {
      type: "Boolean",
      args: { name: nonNull("String") },
      async resolve(_root, { name }, { dataSources, prisma }) {
        try {
          // Validation.
          if (!name) throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Check if the displayName is unique in the database.
          const exist = await prisma.station.findUnique({
            where: {
              displayName: name,
            },
          })

          return !exist
        } catch (error) {
          // DON'T throw, return false instead
          return false
        }
      },
    })

    /**
     * @dev Validate name length and uniqueness
     * @param name {string}
     */
    t.field("validateName", {
      type: "Boolean",
      args: { name: nonNull("String") },
      async resolve(_root, { name }, { dataSources, prisma }) {
        try {
          // Validation.
          if (!name) throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Check if the name (displayName) is unique in the database.
          const exist = await prisma.station.findUnique({
            where: {
              displayName: name,
            },
          })
          if (exist) return false

          // Check if the name is unique in the smart contract
          // Has to lowercase the name
          const { valid } = await dataSources.walletAPI.validateName(name)
          return valid
        } catch (error) {
          // DON'T throw, return false instead
          return false
        }
      },
    })

    /**
     * @dev Update display name
     */
    t.field("updateDisplayName", {
      type: "WriteResult",
      args: { input: nonNull("UpdateDisplayNameInput") },
      async resolve(_root, { input }, { dataSources, prisma, signature }) {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { owner, accountId, name, stationId } = input
          if (!owner || !accountId || !name || !stationId)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Validate authentication/authorization
          const account = await validateAuthenticity({
            accountId,
            owner,
            dataSources,
            prisma,
            signature,
          })
          if (!account) throwError(badInputErrMessage, "BAD_USER_INPUT")

          const station = await prisma.station.findUnique({
            where: {
              id: stationId,
            },
          })
          if (!station) throwError(notFoundErrMessage, "NOT_FOUND")

          // Check ownership of the to-be-updated station
          if (account?.owner?.toLowerCase() !== station?.owner?.toLowerCase())
            throwError(unauthorizedErrMessage, "UN_AUTHORIZED")

          // Update display name in the database.
          await prisma.station.update({
            where: {
              id: stationId,
            },
            data: {
              displayName: name,
            },
          })

          return { status: "Ok" }
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Update profile image
     */
    t.field("updateProfileImage", {
      type: "WriteResult",
      args: { input: nonNull("UpdateImageInput") },
      async resolve(_root, { input }, { dataSources, prisma, signature }) {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { owner, accountId, image, imageRef, stationId } = input
          if (!owner || !accountId || !image || !imageRef || !stationId)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Validate authentication/authorization
          const account = await validateAuthenticity({
            accountId,
            owner,
            dataSources,
            prisma,
            signature,
          })
          if (!account) throwError(badInputErrMessage, "BAD_USER_INPUT")

          const station = await prisma.station.findUnique({
            where: {
              id: stationId,
            },
          })
          if (!station) throwError(notFoundErrMessage, "NOT_FOUND")

          // Check ownership of the to-be-updated station
          if (account?.owner?.toLowerCase() !== station?.owner?.toLowerCase())
            throwError(unauthorizedErrMessage, "UN_AUTHORIZED")

          // Update display name in the database.
          await prisma.station.update({
            where: {
              id: stationId,
            },
            data: {
              image,
              imageRef,
            },
          })

          return { status: "Ok" }
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Update banner image
     */
    t.field("updateBannerImage", {
      type: "WriteResult",
      args: { input: nonNull("UpdateImageInput") },
      async resolve(_root, { input }, { dataSources, prisma, signature }) {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { owner, accountId, image, imageRef, stationId } = input
          if (!owner || !accountId || !image || !imageRef || !stationId)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Validate authentication/authorization
          const account = await validateAuthenticity({
            accountId,
            owner,
            dataSources,
            prisma,
            signature,
          })
          if (!account) throwError(badInputErrMessage, "BAD_USER_INPUT")

          const station = await prisma.station.findUnique({
            where: {
              id: stationId,
            },
          })
          if (!station) throwError(notFoundErrMessage, "NOT_FOUND")

          // Check ownership of the to-be-updated station
          if (account?.owner?.toLowerCase() !== station?.owner?.toLowerCase())
            throwError(unauthorizedErrMessage, "UN_AUTHORIZED")

          // Update display name in the database.
          await prisma.station.update({
            where: {
              id: stationId,
            },
            data: {
              bannerImage: image,
              bannerImageRef: imageRef,
            },
          })

          return { status: "Ok" }
        } catch (error) {
          throw error
        }
      },
    })

    t.field("calculateTips", {
      type: "CalculateTipsResult",
      args: { qty: nonNull("Int") },
      resolve: async (_parent, { qty }, { dataSources }) => {
        try {
          const result = await dataSources.walletAPI.calculateTips(qty)
          console.log("result: ", result)

          return result
        } catch (error) {
          throw error
        }
      },
    })

    // For `TRADITIONAL` accounts only
    t.field("sendTips", {
      type: "SendTipsResult",
      args: { input: nonNull("SendTipsInput") },
      resolve: async (_parent, { input }, { dataSources, prisma }) => {
        try {
          // Validate input
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { senderId, receiverId, publishId, qty } = input
          if (!senderId || !receiverId || !publishId || !qty)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Verify if user is authenticated
          const { uid } = await dataSources.walletAPI.verifyUser()

          // Get sender account
          const account = await prisma.account.findUnique({
            where: {
              authUid: uid,
            },
          })
          if (!account) throwError(unauthorizedErrMessage, "UN_AUTHENTICATED")

          // Check if the given sender id is valid
          const sender = await prisma.station.findUnique({
            where: {
              id: senderId,
            },
          })
          if (!sender || sender.accountId !== account?.id)
            throwError(unauthorizedErrMessage, "UN_AUTHENTICATED")

          // Send tips
          // Get receiver station name
          const receiver = await prisma.station.findUnique({
            where: {
              id: receiverId,
            },
          })
          if (!receiver) throw new Error("Receiver not found")
          const { result } = await dataSources.walletAPI.sendTips(
            receiver.name,
            qty
          )
          console.log("result: ", result)
          const { from, to, amount, fee } = result

          // Create a tip in the database
          await prisma.tip.create({
            data: {
              senderId,
              from: from.toLowerCase(),
              publishId,
              receiverId,
              to: to.toLowerCase(),
              amount,
              fee,
            },
          })

          return result
        } catch (error) {
          throw error
        }
      },
    })
  },
})
