import { extendType, inputObjectType, nonNull, objectType, list } from "nexus"
import { ReadBookmark as ReadBookmarkModel } from "nexus-prisma"

import { validateAuthenticity } from "../lib"
import {
  throwError,
  badInputErrMessage,
  notFoundErrMessage,
  unauthorizedErrMessage,
} from "./Error"
import { NexusGenObjects } from "../typegen"
import { FETCH_QTY } from "../lib/constants"

/**
 * Bookmark type
 */
export const Bookmark = objectType({
  name: ReadBookmarkModel.$name,
  definition(t) {
    t.field(ReadBookmarkModel.createdAt)
    t.field(ReadBookmarkModel.publishId)
    t.field(ReadBookmarkModel.publish)
    t.field(ReadBookmarkModel.profileId)
    t.field(ReadBookmarkModel.station)
  },
})

/**
 * Book mark a post input
 */
export const BookmarkPostInput = inputObjectType({
  name: "BookmarkPostInput",
  definition(t) {
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("profileId") // A profile id of the requestor
    t.nonNull.string("publishId")
  },
})

export const BookmarkMutation = extendType({
  type: "Mutation",
  definition(t) {
    /**
     * Book mark a post
     */
    t.field("bookmarkPost", {
      type: "WriteResult",
      args: { input: nonNull("BookmarkPostInput") },
      resolve: async (_, { input }, { dataSources, prisma, signature }) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { owner, accountId, profileId, publishId } = input
          if (!owner || !accountId || !profileId || !publishId)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Validate authentication/authorization
          await validateAuthenticity({
            accountId,
            owner,
            dataSources,
            prisma,
            signature,
          })

          // Check if a bookmark exists
          const bookmark = await prisma.readBookmark.findUnique({
            where: {
              identifier: {
                profileId,
                publishId,
              },
            },
          })

          if (!bookmark) {
            // Create a new bookmark
            await prisma.readBookmark.create({
              data: {
                profileId,
                publishId,
              },
            })
          } else {
            // Remove the bookmark
            await prisma.readBookmark.delete({
              where: {
                identifier: {
                  profileId,
                  publishId,
                },
              },
            })
          }

          return { status: "Ok" }
        } catch (error) {
          throw error
        }
      },
    })
  },
})
