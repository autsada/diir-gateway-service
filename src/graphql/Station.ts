import {
  objectType,
  inputObjectType,
  extendType,
  nonNull,
  nullable,
} from "nexus"

import { NexusGenInputs, NexusGenObjects } from "../typegen"
import { throwError, badInputErrMessage, unauthorizedErrMessage } from "./Error"

/**
 * A Station type that map to the prisma Station model.
 */
export const Station = objectType({
  name: "Station",
  definition(t) {
    t.nonNull.string("id")
    t.string("tokenId")
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

export const StationQuery = extendType({
  type: "Query",
  definition(t) {
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
  },
})

/**
 * An input type for `createStation` mutation.
 */
export const CreateStationInput = inputObjectType({
  name: "CreateStationInput",
  definition(t) {
    t.nonNull.string("owner")
    t.nonNull.string("name")
    t.nonNull.string("displayName")
    t.nonNull.string("accountId")
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
    t.field("createStation", {
      type: nullable("Station"),
      args: { input: nonNull("CreateStationInput") },
      resolve: async (
        _parent,
        { input },
        { prisma, dataSources, walletAccount }
      ) => {
        try {
          // Verify if user is authenticated
          const { uid } = await dataSources.walletAPI.verifyUser()

          // Find account by the authenticated user's uid
          let account1 = await prisma.account.findUnique({
            where: {
              authUid: uid,
            },
          })

          // For `WALLET` account, account query by authUid will be null, for this case we have to query the account by a wallet address that is sent by the frontend in the headers
          if (!account1 && walletAccount) {
            account1 = await prisma.account.findUnique({
              where: {
                owner: walletAccount.toLowerCase(),
              },
            })
          }

          // Account must be found at this point
          if (!account1) throwError(unauthorizedErrMessage, "UN_AUTHORIZED")
          const account1Address = account1?.owner.toLowerCase()

          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")

          const { owner, name, displayName, accountId } = input
          if (!owner || !name || !displayName || !accountId)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Find account by the provided account id
          const account2 = await prisma.account.findUnique({
            where: {
              id: accountId,
            },
          })
          if (!account2) throwError(unauthorizedErrMessage, "UN_AUTHORIZED")
          const account2Address = account2?.owner.toLowerCase()

          // // If `account1` found --> `TRADITIONAL` account
          // if (account1 && account2?.type === "WALLET")
          //   throwError(unauthorizedErrMessage, "UN_AUTHORIZED") // the provided accountId is wrong

          // // If NO `account1` found --> `WALLET` account because on a wallet typed account we don't store auth uid as we use anonymous sign in.
          // if (!account1 && account2?.type === "TRADITIONAL")
          //   throwError(unauthorizedErrMessage, "UN_AUTHORIZED") // the provided accountId is wrong

          const ownerAddress = owner.toLowerCase()

          // Validate if the accounts and the given address are correct
          if (account1Address !== account2Address)
            throwError(unauthorizedErrMessage, "UN_AUTHORIZED")
          if (account2Address !== ownerAddress)
            throwError(unauthorizedErrMessage, "UN_AUTHORIZED")

          // Check if the name is valid
          const { valid } = await dataSources.walletAPI.validateName(name)
          if (!valid) throw new Error(`The name: '${name}' is taken or invalid`)

          // Mint station NFT
          // Check if it's the user's first station, if yes create an NFT by admin so user doesn't have to pay gas.
          const stations = await prisma.station.findMany({
            where: {
              owner: ownerAddress,
            },
          })

          let tokenId: string = ""
          if (stations.length === 0) {
            // First station
            const result = await dataSources.walletAPI.mintStationNFTByAdmin({
              to: owner,
              name,
            })
            tokenId = `${result.tokenId}`
          } else {
            // Not the first station
            const result = await dataSources.walletAPI.mintStationNFT({
              to: owner,
              name,
            })
            tokenId = `${result.tokenId}`
          }

          // Create a station in the database
          const station = await prisma.station.create({
            data: {
              tokenId,
              owner: ownerAddress,
              name, // Make sure to lowercase name
              displayName,
              accountId,
            },
          })

          return station
        } catch (error) {
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
          // Verify if user is authenticated
          const { uid } = await dataSources.walletAPI.verifyUser()

          // Get sender account
          const account = await prisma.account.findUnique({
            where: {
              authUid: uid,
            },
          })
          if (!account) throwError(unauthorizedErrMessage, "UN_AUTHENTICATED")

          // Validate input
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { senderId, receiverId, publishId, qty } = input
          if (!senderId || !receiverId || !publishId || !qty)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

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
