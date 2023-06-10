import { extendType, inputObjectType, nonNull, objectType } from "nexus"
import { WatchLater as WatchLaterModel } from "nexus-prisma"
import { WatchLater as WatchLaterType } from "@prisma/client"

import { validateAuthenticity } from "../lib"
import {
  throwError,
  badInputErrMessage,
  notFoundErrMessage,
  unauthorizedErrMessage,
} from "./Error"
import { FETCH_QTY } from "../lib/constants"

/**
 * The WathLater type that map to the database model
 */
export const WatchLater = objectType({
  name: WatchLaterModel.$name,
  definition(t) {
    t.field(WatchLaterModel.id)
    t.field(WatchLaterModel.createdAt)
    t.field(WatchLaterModel.stationId)
    t.field(WatchLaterModel.station)
    t.field(WatchLaterModel.publishId)
    t.field(WatchLaterModel.publish)
  },
})

export const FetchWatchLaterInput = inputObjectType({
  name: "FetchWatchLaterInput",
  definition(t) {
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("stationId")
    t.string("cursor")
  },
})

export const WatchLaterEdge = objectType({
  name: "WatchLaterEdge",
  definition(t) {
    t.string("cursor")
    t.field("node", {
      type: "WatchLater",
    })
  },
})

export const FetchWatchLaterResponse = objectType({
  name: "FetchWatchLaterResponse",
  definition(t) {
    t.nonNull.field("pageInfo", { type: "PageInfo" })
    t.nonNull.list.nonNull.field("edges", { type: "WatchLaterEdge" })
  },
})

export const WatchLaterQuery = extendType({
  type: "Query",
  definition(t) {
    /**
     * Fetch watch later for preview
     */
    t.field("fetchPreviewWatchLater", {
      type: "FetchWatchLaterResponse",
      args: { input: nonNull("FetchWatchLaterInput") },
      resolve: async (
        _parent,
        { input },
        { prisma, dataSources, signature }
      ) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { owner, accountId, stationId } = input
          if (!owner || !accountId || !stationId)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Validate authentication/authorization
          await validateAuthenticity({
            accountId,
            owner,
            dataSources,
            prisma,
            signature,
          })

          const watchLater = await prisma.watchLater.findMany({
            where: {
              stationId,
            },
            take: 10, // Take only 10 items
            orderBy: {
              createdAt: "desc",
            },
          })

          // Get total watch later
          const count = await prisma.watchLater.count({
            where: {
              stationId,
            },
          })

          if (watchLater.length < count) {
            return {
              pageInfo: {
                endCursor: null,
                hasNextPage: true,
                count,
              },
              edges: watchLater.map((wl) => ({
                cursor: wl.id,
                node: wl,
              })),
            }
          } else {
            return {
              pageInfo: {
                endCursor: null,
                hasNextPage: false,
                count,
              },
              edges: watchLater.map((wl) => ({
                cursor: wl.id,
                node: wl,
              })),
            }
          }
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * Fetch watch later list of a station
     */
    t.field("fetchWatchLater", {
      type: "FetchWatchLaterResponse",
      args: { input: nonNull("FetchWatchLaterInput") },
      resolve: async (
        _parent,
        { input },
        { prisma, dataSources, signature }
      ) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { owner, accountId, stationId, cursor } = input
          if (!owner || !accountId || !stationId)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Validate authentication/authorization
          await validateAuthenticity({
            accountId,
            owner,
            dataSources,
            prisma,
            signature,
          })

          let watchLater: WatchLaterType[] = []

          if (!cursor) {
            // A. First query
            watchLater = await prisma.watchLater.findMany({
              where: {
                stationId,
              },
              take: FETCH_QTY,
              orderBy: {
                createdAt: "desc",
              },
            })
          } else {
            // B. Consecutive queries
            watchLater = await prisma.watchLater.findMany({
              where: {
                stationId,
              },
              take: FETCH_QTY,
              cursor: {
                id: cursor,
              },
              skip: 1, // Skip the cursor
              orderBy: {
                createdAt: "desc",
              },
            })
          }

          // Get total watch later
          const count = await prisma.watchLater.count({
            where: {
              stationId,
            },
          })

          if (watchLater.length === FETCH_QTY) {
            // Fetch result is equal to take quantity, so it has posibility that there are more to be fetched.
            const lastFetchedCursor = watchLater[watchLater.length - 1].id

            // Check if there is next page
            const nextQuery = await prisma.watchLater.findMany({
              where: {
                stationId,
              },
              take: FETCH_QTY,
              cursor: {
                id: lastFetchedCursor,
              },
              skip: 1, // Skip the cusor
              orderBy: {
                createdAt: "desc",
              },
            })

            return {
              pageInfo: {
                endCursor: lastFetchedCursor,
                hasNextPage: nextQuery.length > 0,
                count,
              },
              edges: watchLater.map((wl) => ({
                cursor: wl.id,
                node: wl,
              })),
            }
          } else {
            return {
              pageInfo: {
                endCursor: null,
                hasNextPage: false,
                count,
              },
              edges: watchLater.map((wl) => ({
                cursor: wl.id,
                node: wl,
              })),
            }
          }
        } catch (error) {
          throw error
        }
      },
    })
  },
})

export const AddToWatchLaterInput = inputObjectType({
  name: "AddToWatchLaterInput",
  definition(t) {
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("stationId")
    t.nonNull.string("publishId")
  },
})

export const RemoveFromWatchLaterInput = inputObjectType({
  name: "RemoveFromWatchLaterInput",
  definition(t) {
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("stationId")
    t.nonNull.string("publishId")
    t.string("id") // the id of the item to be removed, if null, remove all items of this publish and this station from watch later
  },
})

export const WatchLaterMutation = extendType({
  type: "Mutation",
  definition(t) {
    /**
     * Add to watch later
     */
    t.field("addToWatchLater", {
      type: "WriteResult",
      args: { input: nonNull("AddToWatchLaterInput") },
      resolve: async (
        _parent,
        { input },
        { dataSources, prisma, signature }
      ) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { owner, accountId, stationId, publishId } = input
          if (!owner || !accountId || !publishId)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Validate authentication/authorization
          await validateAuthenticity({
            accountId,
            owner,
            dataSources,
            prisma,
            signature,
          })

          await prisma.watchLater.create({
            data: {
              stationId,
              publishId,
            },
          })

          return { status: "Ok" }
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * Remove from watch later
     */
    t.field("removeFromWatchLater", {
      type: "WriteResult",
      args: { input: nonNull("RemoveFromWatchLaterInput") },
      resolve: async (
        _parent,
        { input },
        { dataSources, prisma, signature }
      ) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { owner, accountId, stationId, publishId, id } = input
          if (!owner || !accountId || !stationId || !publishId)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Validate authentication/authorization
          await validateAuthenticity({
            accountId,
            owner,
            dataSources,
            prisma,
            signature,
          })

          // If the `id` is not null, remove that item
          if (id) {
            // Check if the given station id owns the item
            const item = await prisma.watchLater.findUnique({
              where: {
                id,
              },
            })
            if (!item) throwError(notFoundErrMessage, "NOT_FOUND")
            if (item?.stationId !== stationId)
              throwError(unauthorizedErrMessage, "UN_AUTHORIZED")

            await prisma.watchLater.delete({
              where: {
                id,
              },
            })
          } else {
            // Remove all items of this (publish + station) from watch later
            const items = await prisma.watchLater.findMany({
              where: {
                AND: [
                  {
                    publishId,
                  },
                  {
                    stationId,
                  },
                ],
              },
            })

            if (items.length > 0) {
              await prisma.watchLater.deleteMany({
                where: {
                  AND: [
                    {
                      publishId,
                    },
                    {
                      stationId,
                    },
                  ],
                },
              })
            }
          }

          return { status: "Ok" }
        } catch (error) {
          throw error
        }
      },
    })
  },
})
