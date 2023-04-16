import {
  objectType,
  inputObjectType,
  extendType,
  nonNull,
  nullable,
} from "nexus"

import { NexusGenInputs, NexusGenObjects } from "../typegen"
import { throwError, badInputErrMessage } from "./Error"

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
    t.string("bannerImage")
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
