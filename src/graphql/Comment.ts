import {
  objectType,
  enumType,
  extendType,
  nonNull,
  list,
  inputObjectType,
} from "nexus"
import {
  Comment as CommentModel,
  CommentType as CommentTypeEnum,
  CommentLike as CommentLikeModel,
  CommentDisLike as CommentDisLikeModel,
} from "nexus-prisma"

import { throwError, badInputErrMessage } from "./Error"
import { validateAuthenticity } from "../lib"
import type { NexusGenInputs } from "../typegen"

export const CommentType = enumType(CommentTypeEnum)

export const CommentLike = objectType({
  name: CommentLikeModel.$name,
  definition(t) {
    t.field(CommentLikeModel.commentId)
    t.field(CommentLikeModel.comment)
    t.field(CommentLikeModel.stationId)
    t.field(CommentLikeModel.station)
  },
})

export const CommentDisLike = objectType({
  name: CommentDisLikeModel.$name,
  definition(t) {
    t.field(CommentDisLikeModel.commentId)
    t.field(CommentDisLikeModel.comment)
    t.field(CommentDisLikeModel.stationId)
    t.field(CommentDisLikeModel.station)
  },
})

/**
 * A type for publish's comments.
 */
export const Comment = objectType({
  name: CommentModel.$name,
  definition(t) {
    t.field(CommentModel.id)
    t.field(CommentModel.createdAt)
    t.field(CommentModel.updatedAt)
    t.field(CommentModel.creator)
    t.field(CommentModel.creatorId)
    t.field(CommentModel.publishId)
    t.field(CommentModel.publish)
    t.field(CommentModel.commentId)
    t.field(CommentModel.comment)
    t.field(CommentModel.commentType)
    t.field(CommentModel.content)
    t.field(CommentModel.comments)
    t.field(CommentModel.likes)
    t.field(CommentModel.disLikes)

    /**
     * Number of likes a comment has
     */
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

    /**
     * Number of dislikes a comment has
     */
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

export const CommentPublishInput = inputObjectType({
  name: "CommentPublishInput",
  definition(t) {
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("stationId")
    t.nonNull.string("publishId")
    t.nonNull.string("content")
    t.nonNull.field("commentType", { type: "CommentType" })
    t.string("commentId")
  },
})

export const CommentMutation = extendType({
  type: "Mutation",
  definition(t) {
    /**
     * Comment on a publish
     */
    t.field("comment", {
      type: "WriteResult",
      args: { input: nonNull("CommentPublishInput") },
      resolve: async (
        parent,
        { input },
        { dataSources, prisma, signature }
      ) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const {
            owner,
            accountId,
            stationId,
            publishId,
            content,
            commentType,
            commentId,
          } = input
          if (
            !owner ||
            !accountId ||
            !stationId ||
            !publishId ||
            !content ||
            !commentType
          )
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Validate authentication/authorization
          await validateAuthenticity({
            accountId,
            owner,
            dataSources,
            prisma,
            signature,
          })

          // Create a comment
          await prisma.comment.create({
            data: {
              creatorId: stationId,
              publishId,
              content,
              commentType,
              commentId,
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
