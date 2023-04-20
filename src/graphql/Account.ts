import { Station } from "@prisma/client"
import {
  extendType,
  objectType,
  nullable,
  nonNull,
  enumType,
  inputObjectType,
} from "nexus"
import { cacheTokenId, getStationFromCache } from "../client/redis"
import { NexusGenObjects } from "../typegen"

import { throwError, badInputErrMessage, unauthorizedErrMessage } from "./Error"

export const Edge = objectType({
  name: "Edge",
  definition(t) {
    t.string("cursor")
    t.field("node", { type: "Station" })
  },
})

export const PageInfo = objectType({
  name: "PageInfo",
  definition(t) {
    t.string("endCursor")
    t.boolean("hasNextPage")
  },
})

export const Response = objectType({
  name: "Response",
  definition(t) {
    t.nonNull.field("pageInfo", { type: "PageInfo" })
    t.nonNull.list.field("edges", { type: "Edge" })
  },
})

export const AccountType = enumType({
  name: "AccountType",
  members: ["TRADITIONAL", "WALLET"],
})

/**
 * A Account type that map to the prisma Account model.
 */
export const Account = objectType({
  name: "Account",
  definition(t) {
    t.nonNull.string("id")
    t.nonNull.field("createdAt", { type: "DateTime" })
    t.field("updatedAt", { type: "DateTime" })
    t.nonNull.string("owner")
    t.string("authUid")
    t.nonNull.field("type", { type: "AccountType" })
    t.nonNull.list.field("stations", {
      type: "Station",
      resolve: async (parent, _, { prisma }) => {
        const stations = (await prisma.account
          .findUnique({
            where: {
              id: parent.id,
            },
          })
          .stations({
            orderBy: {
              createdAt: "desc",
            },
          })) as unknown as NexusGenObjects["Station"][]

        if (!stations) return []
        else return stations
      },
    })
    t.field("defaultStation", { type: "Station" })
  },
})

export const GetMyAccountInput = inputObjectType({
  name: "GetMyAccountInput",
  definition(t) {
    t.nonNull.field("accountType", { type: "AccountType" })
  },
})

export const GetAccountResult = objectType({
  name: "GetAccountResult",
  definition(t) {
    t.field("account", { type: "Account" })
    t.field("defaultStation", { type: "Station" })
  },
})

export const AccountQuery = extendType({
  type: "Query",
  definition(t) {
    /**
     * Get user's account
     */
    t.field("getMyAccount", {
      type: nonNull("GetAccountResult"),
      args: { input: nullable("GetMyAccountInput") },
      async resolve(
        _parent,
        { input },
        { dataSources, prisma, walletAccount }
      ) {
        try {
          // Verify id token first.
          await dataSources.walletAPI.verifyUser()

          let account:
            | (NexusGenObjects["Account"] & {
                stations: NexusGenObjects["Station"][]
              })
            | null = null
          let owner: string | null = null

          if (!input) {
            // `TRADITIONAL` account
            // Get user's wallet address
            const { address } = await dataSources.walletAPI.getWalletAddress()

            if (address) {
              // Query account from the database
              owner = address.toLowerCase()
              const ac = await prisma.account.findUnique({
                where: {
                  owner,
                },
                include: {
                  stations: true,
                },
              })

              account = ac
            }
          } else {
            // `WALLET` account
            const { accountType } = input

            if (accountType && accountType === "WALLET" && walletAccount) {
              // Query account from the database
              owner = walletAccount.toLowerCase()
              const ac = await prisma.account.findUnique({
                where: {
                  owner,
                },
                include: {
                  stations: true,
                },
              })

              account = ac
            }
          }

          // Find the previous logged in station
          const defaultStation =
            !account || !owner || account.stations.length === 0
              ? null
              : await getStationFromCache(owner, account.stations as Station[])

          return { account, defaultStation }
        } catch (error) {
          throw error
        }
      },
    })

    t.field("getMyBalance", {
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
      args: { input: nullable("GetMyAccountInput") },
      async resolve(
        _parent,
        { input },
        { dataSources, prisma, walletAccount }
      ) {
        try {
          // Verify id token first.
          const { uid } = await dataSources.walletAPI.verifyUser()

          if (!input) {
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
            const { accountType } = input

            // Make sure that the authenticated user doesn't own an account yet.
            const ac = await prisma.account.findUnique({
              where: {
                authUid: uid,
              },
            })

            if (ac) throwError(unauthorizedErrMessage, "UN_AUTHORIZED")

            if (accountType && accountType === "WALLET" && walletAccount) {
              const owner = walletAccount.toLowerCase()

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
            } else {
              return null
            }
          }
        } catch (error) {
          throw error
        }
      },
    })

    t.field("cacheSession", {
      type: nonNull("WriteResult"),
      args: { input: nonNull("CacheSessionInput") },
      async resolve(_parent, { input }) {
        try {
          if (!input || !input.address || !input.stationId)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          await cacheTokenId(input.address, input.stationId)

          return { status: "Ok" }
        } catch (error) {
          throw error
        }
      },
    })
  },
})
