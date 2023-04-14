import {
  objectType,
  enumType,
  extendType,
  nonNull,
  list,
  inputObjectType,
} from "nexus"

import { NexusGenInputs, NexusGenObjects } from "../typegen"
import { throwError, badInputErrMessage } from "./Error"

export const CommentType = enumType({
  name: "CommentType",
  members: ["PUBLISH", "COMMENT"],
})

/**
 * A type for publish's comments.
 */
export const Comment = objectType({
  name: "Comment",
  definition(t) {
    t.nonNull.string("id")
    t.nonNull.field("createdAt", { type: "DateTime" })
    t.field("updatedAt", { type: "DateTime" })
    t.nonNull.string("creatorId")
    t.nonNull.string("publishId")
    t.string("commentId")
    t.nonNull.string("content")
    t.nonNull.field("commentType", { type: "CommentType" })

    /**
     * Comment's creator
     */
    t.field("creator", {
      type: "Station",
      resolve: (parent, _, { prisma }) => {
        return prisma.comment
          .findUnique({
            where: {
              id: parent.id,
            },
          })
          .creator() as unknown as NexusGenObjects["Station"]
      },
    })

    /**
     * A list of stations that liked the comment.
     */
    t.nonNull.list.field("likes", {
      type: "Station",
      resolve: async (parent, _, { prisma }) => {
        const data = await prisma.comment
          .findUnique({
            where: {
              id: parent.id,
            },
          })
          .likes({
            select: {
              station: true,
            },
          })

        return !data
          ? []
          : (data.map(
              (d) => d.station
            ) as unknown as NexusGenObjects["Station"][])
      },
    })
    t.nonNull.field("likesCount", {
      type: "Int",
      resolve: (parent, _, { prisma }) => {
        return prisma.commentLike.count({
          where: {
            commentId: parent.id,
          },
        })
      },
    })
    /**
     * A boolean to check whether a station (who sends the query) liked the comment or not, if no `requestorId` provided resolve to null.
     */
    t.nullable.field("liked", {
      type: "Boolean",
      resolve: async (parent, _, { prisma }, info) => {
        const { input } = info.variableValues as {
          input: NexusGenInputs["QueryByIdInput"]
        }

        if (!input || !input.requestorId) return null
        const { requestorId } = input

        const like = await prisma.commentLike.findUnique({
          where: {
            identifier: {
              commentId: parent.id,
              stationId: requestorId,
            },
          },
        })

        return !!like
      },
    })

    t.nonNull.field("disLikesCount", {
      type: "Int",
      resolve: (parent, _, { prisma }) => {
        return prisma.commentDisLike.count({
          where: {
            commentId: parent.id,
          },
        })
      },
    })
    /**
     * A boolean to check whether a station (who sends the query) disliked the comment or not, if no `requestorId` provided resolve to null.
     */
    t.nullable.field("disLiked", {
      type: "Boolean",
      resolve: async (parent, _, { prisma }, info) => {
        const { input } = info.variableValues as {
          input: NexusGenInputs["QueryByIdInput"]
        }

        if (!input || !input.requestorId) return null
        const { requestorId } = input

        const disLike = await prisma.commentDisLike.findUnique({
          where: {
            identifier: {
              commentId: parent.id,
              stationId: requestorId,
            },
          },
        })

        return !!disLike
      },
    })

    /**
     * Number of comments a comment has.
     */
    t.nonNull.field("commentsCount", {
      type: "Int",
      resolve: (parent, _, { prisma }) => {
        return prisma.comment.count({
          where: {
            commentId: parent.id,
          },
        })
      },
    })
  },
})

export const CommentQuery = extendType({
  type: "Query",
  definition(t) {
    /**
     * List comments by publish id.
     */
    // TODO: Implement pagination
    t.field("listCommentsByPublishId", {
      type: nonNull(list("Comment")),
      args: { input: nonNull("QueryByIdInput") },
      async resolve(_parent, { input }, { prisma }) {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { targetId } = input

          if (!targetId) throwError(badInputErrMessage, "BAD_USER_INPUT")

          return prisma.comment.findMany({
            where: {
              AND: [
                {
                  publishId: targetId,
                },
                {
                  commentType: "PUBLISH",
                },
              ],
            },
          })
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * List comments by a parent comment id.
     */
    // TODO: Implement pagination
    t.field("listCommentsByCommentId", {
      type: nonNull(list("Comment")),
      args: { input: nonNull("QueryByIdInput") },
      async resolve(_parent, { input }, { prisma }) {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { targetId } = input

          if (!targetId) throwError(badInputErrMessage, "BAD_USER_INPUT")

          return prisma.comment.findMany({
            where: {
              AND: [
                {
                  commentId: targetId,
                },
                {
                  commentType: "COMMENT",
                },
              ],
            },
          })
        } catch (error) {
          throw error
        }
      },
    })
  },
})
