import {
  extendType,
  objectType,
  nonNull,
  enumType,
  inputObjectType,
} from "nexus"

import {
  Account as AccountModel,
  AccountType as AccountTypeEnum,
} from "nexus-prisma"
import { cacheLoggedInSession, getStationFromCache } from "../client/redis"
import {
  throwError,
  badInputErrMessage,
  unauthorizedErrMessage,
  badRequestErrMessage,
} from "./Error"
import { recoverAddress, validateAuthenticity } from "../lib"

export const AccountType = enumType(AccountTypeEnum)

/**
 * A Account type that map to the prisma Account model.
 */
export const Account = objectType({
  name: AccountModel.$name,
  definition(t) {
    t.field(AccountModel.id)
    t.field(AccountModel.createdAt)
    t.field(AccountModel.updatedAt)
    t.field(AccountModel.owner)
    t.field(AccountModel.authUid)
    t.nonNull.field("type", { type: "AccountType" })
    t.field("defaultStation", {
      type: "Station",
      resolve: async (parent, _, { prisma }) => {
        const account = await prisma.account.findUnique({
          where: {
            id: parent.id,
          },
          include: {
            stations: true,
          },
        })

        if (!account || account.stations.length === 0) return null

        return getStationFromCache(parent.owner, account.stations)
      },
    })
    t.field(AccountModel.stations)
  },
})

export const GetMyAccountInput = inputObjectType({
  name: "GetMyAccountInput",
  definition(t) {
    t.nonNull.field("accountType", { type: "AccountType" })
  },
})

export const AccountQuery = extendType({
  type: "Query",
  definition(t) {
    /**
     * Get user's account
     */
    t.field("getMyAccount", {
      type: "Account",
      args: { input: nonNull("GetMyAccountInput") },
      async resolve(_parent, { input }, { dataSources, prisma, signature }) {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Verify id token first.
          await dataSources.walletAPI.verifyUser()

          const { accountType } = input
          if (accountType === "TRADITIONAL") {
            // `TRADITIONAL` account
            // Get user's wallet address
            const { address } = await dataSources.walletAPI.getWalletAddress()

            if (address) {
              // Query account from the database
              const owner = address.toLowerCase()
              return prisma.account.findUnique({
                where: {
                  owner,
                },
              })
            } else {
              return null
            }
          } else if (accountType === "WALLET") {
            // `WALLET` account
            if (!signature) throwError(unauthorizedErrMessage, "UN_AUTHORIZED")

            // Query account from the database
            const owner = recoverAddress(signature!).toLowerCase()
            return prisma.account.findUnique({
              where: {
                owner,
              },
            })
          } else {
            return null
          }
        } catch (error) {
          throw error
        }
      },
    })

    t.field("getBalance", {
      type: nonNull("String"),
      args: { address: nonNull("String") },
      async resolve(_root, { address }, { dataSources }) {
        try {
          if (!address) throwError(badInputErrMessage, "BAD_USER_INPUT")

          const { balance } = await dataSources.walletAPI.getBalance(address)

          return balance
        } catch (error) {
          throw error
        }
      },
    })
  },
})

export const CacheSessionInput = inputObjectType({
  name: "CacheSessionInput",
  definition(t) {
    t.nonNull.string("address")
    t.nonNull.string("stationId")
    t.nonNull.string("accountId")
  },
})

/**
 * Returned type of all the write operations that doesn't require return values.
 */
export const WriteResult = objectType({
  name: "WriteResult",
  definition(t) {
    t.nonNull.string("status")
  },
})

export const AccountMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createAccount", {
      type: "Account",
      args: { input: nonNull("GetMyAccountInput") },
      async resolve(_parent, { input }, { dataSources, prisma, signature }) {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Verify id token first.
          const { uid } = await dataSources.walletAPI.verifyUser()

          const { accountType } = input
          if (accountType === "TRADITIONAL") {
            // `TRADITIONAL` account
            // Create wallet first
            const { address, uid } = await dataSources.walletAPI.createWallet()
            const owner = address.toLowerCase()

            // Create (if not exist)  an account in the database
            let account = await prisma.account.findUnique({
              where: {
                owner,
              },
            })

            if (!account) {
              account = await prisma.account.create({
                data: {
                  type: "TRADITIONAL",
                  owner,
                  authUid: uid,
                },
              })
            }

            return account
          } else {
            // `WALLET` account
            if (!signature || accountType !== "WALLET")
              throwError(unauthorizedErrMessage, "UN_AUTHORIZED")

            // Make sure that the authenticated user doesn't own an account yet.
            const ac = await prisma.account.findUnique({
              where: {
                authUid: uid,
              },
            })

            if (ac) throwError(badRequestErrMessage, "BAD_REQUEST")

            const ownerAddress = recoverAddress(signature!)
            const owner = ownerAddress.toLowerCase()

            // Create (if not exist)  an account in the database
            let account = await prisma.account.findUnique({
              where: {
                owner,
              },
            })

            if (!account) {
              account = await prisma.account.create({
                data: {
                  type: accountType,
                  owner,
                },
              })
            }

            return account
          }
        } catch (error) {
          throw error
        }
      },
    })

    t.field("cacheSession", {
      type: nonNull("WriteResult"),
      args: { input: nonNull("CacheSessionInput") },
      async resolve(_parent, { input }, { dataSources, prisma, signature }) {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { address, stationId, accountId } = input
          if (!address || !stationId || !accountId)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Validate authentication/authorization
          await validateAuthenticity({
            accountId,
            owner: address,
            dataSources,
            prisma,
            signature,
          })

          await cacheLoggedInSession(input.address, input.stationId)

          return { status: "Ok" }
        } catch (error) {
          throw error
        }
      },
    })
  },
})
