import {
  objectType,
  inputObjectType,
  extendType,
  nonNull,
  nullable,
  list,
} from "nexus"

import { NexusGenInputs, NexusGenObjects } from "../typegen"
import { throwError, badInputErrMessage, unauthorizedErrMessage } from "./Error"
import { validateAuthenticity } from "../lib"

/**
 * A Station type that map to the prisma Station model.
 */
export const Station = objectType({
  name: "Station",
  definition(t) {
    t.nonNull.string("id")
    t.int("tokenId")
    t.nonNull.field("createdAt", { type: "DateTime" })
    t.field("updatedAt", { type: "DateTime" })
    t.nonNull.string("owner")
    t.nonNull.string("name")
    t.nonNull.string("displayName")
    t.string("image")
    t.string("imageRef")
    t.string("bannerImage")
    t.string("bannerImageRef")
    t.nonNull.string("accountId")

    t.field("account", {
      type: "Account",
      resolve: async (parent, _, { prisma }) => {
        return prisma.account.findUnique({
          where: {
            id: parent.accountId,
          },
        })
      },
    })

    t.nonNull.list.nonNull.field("followers", {
      type: "Station",
      resolve: async (parent, _, { prisma }) => {
        const data = await prisma.station
          .findUnique({
            where: {
              id: parent.id,
            },
          })
          .followers({
            select: {
              following: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          })

        return !data ? [] : data.map((d) => d.following)
      },
    })
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

    t.nonNull.list.field("following", {
      type: "Station",
      resolve: async (parent, _, { prisma }) => {
        const data = await prisma.station
          .findUnique({
            where: {
              id: parent.id,
            },
          })
          .following({
            select: {
              follower: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          })

        return !data ? [] : data.map((d) => d.follower)
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
     * Query first 20 publishes of the station
     */
    t.field("publishes", {
      type: list("Publish"),
      resolve: (parent, _, { prisma }) => {
        return prisma.publish.findMany({
          where: {
            creatorId: parent.id,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
        }) as unknown as NexusGenObjects["Publish"][]
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

          const station = (await prisma.station.findUnique({
            where: { id: targetId },
          })) as NexusGenObjects["Station"] | null

          return station
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

          const station = (await prisma.station.findUnique({
            where: { name },
          })) as NexusGenObjects["Station"] | null

          return station
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
     * For user's first station, mint a Station NFT by admin so user will not have to pay gas
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
            },
          })

          return station
        } catch (error) {
          console.log("error: ", error)
          throw error
        }
      },
    })

    /**
     * @dev Validate name length and uniqueness
     * @param name {string}
     */
    t.field("validateName", {
      type: nonNull("Boolean"),
      args: { name: nonNull("String") },
      async resolve(_root, { name }, { dataSources }) {
        try {
          // Validation.
          if (!name) throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Call the api.
          // Has to lowercase the name before sending to the blockchain.
          const { valid } = await dataSources.walletAPI.validateName(name)
          return valid
        } catch (error) {
          // DON'T throw, return false instead
          return false
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
