import { extendType, inputObjectType, list, nonNull, objectType } from "nexus"
import { WatchLater as WatchLaterModel } from "nexus-prisma"

import { validateAuthenticity } from "../lib"
import {
  throwError,
  badInputErrMessage,
  notFoundErrMessage,
  unauthorizedErrMessage,
} from "./Error"

/**
 * A Fee type that map to the prisma LikeFee model.
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

export const GetWatchLaterInput = inputObjectType({
  name: "GetWatchLaterInput",
  definition(t) {
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("stationId")
  },
})

export const WatchLaterQuery = extendType({
  type: "Query",
  definition(t) {
    /**
     * Get watch later list of a station
     * TODO: Add pagination
     */
    t.field("getWatchLater", {
      type: nonNull(list("WatchLater")),
      args: { input: nonNull("GetWatchLaterInput") },
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

          return prisma.watchLater.findMany({
            where: {
              stationId,
            },
            include: {
              publish: true,
            },
            take: 50,
          })
        } catch (error) {
          throw error
        }
      },
    })
  },
})

export const SavePublishToPlayListInput = inputObjectType({
  name: "SavePublishToPlayListInput",
  definition(t) {
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("stationId")
    t.nonNull.string("publishId")
  },
})

export const RemovePublishToPlayListInput = inputObjectType({
  name: "RemovePublishToPlayListInput",
  definition(t) {
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("stationId")
    t.nonNull.string("id") // the id of the item to be removed
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
      args: { input: nonNull("SavePublishToPlayListInput") },
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
      args: { input: nonNull("RemovePublishToPlayListInput") },
      resolve: async (
        _parent,
        { input },
        { dataSources, prisma, signature }
      ) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { owner, accountId, stationId, id } = input
          if (!owner || !accountId || !stationId || !id)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Validate authentication/authorization
          await validateAuthenticity({
            accountId,
            owner,
            dataSources,
            prisma,
            signature,
          })

          // Check if the given station id owns the item
          let item = await prisma.watchLater.findUnique({
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

          return { status: "Ok" }
        } catch (error) {
          throw error
        }
      },
    })
  },
})
