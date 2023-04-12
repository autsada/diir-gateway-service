import { Station } from "@prisma/client"
import { GraphQLError } from "graphql"
import {
  extendType,
  objectType,
  nullable,
  nonNull,
  stringArg,
  enumType,
  inputObjectType,
} from "nexus"
import { cacheTokenId, getStationFromCache } from "../client/redis"

import { throwError, badInputErrMessage } from "./Error"

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
    t.nonNull.string("authUid")
    t.nonNull.field("type", { type: "AccountType" })
  },
})

export const AccountQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("getAccount", {
      type: nullable("Account"),
      args: { owner: nonNull(stringArg()) },
      async resolve(_parent, { owner }, { prisma }) {
        try {
          if (!owner) throwError(badInputErrMessage, "BAD_USER_INPUT")

          const account = await prisma.account.findUnique({
            where: {
              owner: owner.toLowerCase(),
            },
            include: {
              stations: true,
            },
          })

          if (!account) return null

          // Find the previous logged in station
          const station =
            account.stations.length > 0
              ? await getStationFromCache(owner, account.stations as Station[])
              : null

          return { ...account, station }
        } catch (error) {
          throw error
        }
      },
    })
  },
})
