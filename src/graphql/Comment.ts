import {
  objectType,
  enumType,
  extendType,
  nonNull,
  inputObjectType,
} from "nexus"
import {
  Comment as CommentModel,
  CommentType as CommentTypeEnum,
  CommentLike as CommentLikeModel,
  CommentDisLike as CommentDisLikeModel,
} from "nexus-prisma"
import { Comment as CommentDataType } from "@prisma/client"

import { throwError, badInputErrMessage, notFoundErrMessage } from "./Error"
import { validateAuthenticity } from "../lib"
import type { NexusGenInputs } from "../typegen"
import { FETCH_QTY } from "../lib/constants"

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

export const CommentsOrderBy = enumType({
  name: "CommentsOrderBy",
  members: ["counts", "newest"],
})
export const FetchCommentsByPublishIdInput = inputObjectType({
  name: "FetchCommentsByPublishIdInput",
  definition(t) {
    t.string("requestorId") // Station id of the requestor
    t.nonNull.string("publishId")
    t.string("cursor")
    t.field("orderBy", { type: "CommentsOrderBy" })
  },
})

export const CommentEdge = objectType({
  name: "CommentEdge",
  definition(t) {
    t.string("cursor")
    t.field("node", {
      type: "Comment",
    })
  },
})

export const FetchCommentsResponse = objectType({
  name: "FetchCommentsResponse",
  definition(t) {
    t.nonNull.field("pageInfo", { type: "PageInfo" })
    t.nonNull.list.nonNull.field("edges", { type: "CommentEdge" })
  },
})

export const CommentQuery = extendType({
  type: "Query",
  definition(t) {
    /**
     * Fetch comments by publish id.
     */
    t.field("fetchCommentsByPublishId", {
      type: "FetchCommentsResponse",
      args: { input: nonNull("FetchCommentsByPublishIdInput") },
      async resolve(_parent, { input }, { prisma }) {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { cursor, publishId, orderBy } = input
          if (!publishId) throwError(badInputErrMessage, "BAD_USER_INPUT")

          let comments: CommentDataType[] = []

          if (!cursor) {
            comments = await prisma.comment.findMany({
              where: {
                AND: [
                  {
                    publishId,
                  },
                  {
                    commentType: "PUBLISH",
                  },
                ],
              },
              take: FETCH_QTY,
              orderBy:
                orderBy === "newest"
                  ? {
                      createdAt: "desc",
                    }
                  : [
                      {
                        comments: {
                          _count: "desc",
                        },
                      },
                      {
                        createdAt: "desc",
                      },
                    ],
            })
          } else {
            comments = await prisma.comment.findMany({
              where: {
                AND: [
                  {
                    publishId,
                  },
                  {
                    commentType: "PUBLISH",
                  },
                ],
              },
              take: FETCH_QTY,
              cursor: {
                id: cursor,
              },
              skip: 1, // Skip the cursor
              orderBy:
                orderBy === "newest"
                  ? {
                      createdAt: "desc",
                    }
                  : [
                      {
                        comments: {
                          _count: "desc",
                        },
                      },
                      {
                        createdAt: "desc",
                      },
                    ],
            })
          }

          if (comments.length < FETCH_QTY) {
            return {
              pageInfo: {
                endCursor: null,
                hasNextPage: false,
              },
              edges: comments.map((comment) => ({
                cursor: comment.id,
                node: comment,
              })),
            }
          } else {
            // Fetch result is equal to take quantity, so it has posibility that there are more to be fetched.
            const lastFetchedCursor = comments[comments.length - 1].id

            // Check if there is next page
            const nextQuery = await prisma.comment.findMany({
              where: {
                AND: [
                  {
                    publishId,
                  },
                  {
                    commentType: "PUBLISH",
                  },
                ],
              },
              take: FETCH_QTY,
              cursor: {
                id: lastFetchedCursor,
              },
              skip: 1, // Skip the cursor
              orderBy:
                orderBy === "newest"
                  ? {
                      createdAt: "desc",
                    }
                  : [
                      {
                        comments: {
                          _count: "desc",
                        },
                      },
                      {
                        createdAt: "desc",
                      },
                    ],
            })

            return {
              pageInfo: {
                endCursor: lastFetchedCursor,
                hasNextPage: nextQuery.length > 0,
              },
              edges: comments.map((comment) => ({
                cursor: comment.id,
                node: comment,
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

export const LikeCommentInput = inputObjectType({
  name: "LikeCommentInput",
  definition(t) {
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("stationId")
    t.nonNull.string("publishId")
    t.nonNull.string("commentId")
  },
})

export const CommentMutation = extendType({
  type: "Mutation",
  definition(t) {
    /**
     * Comment on a comment
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

    t.field("likeComment", {
      type: "WriteResult",
      args: { input: nonNull("LikeCommentInput") },
      resolve: async (
        _parent,
        { input },
        { dataSources, prisma, signature }
      ) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { owner, accountId, stationId, publishId, commentId } = input
          if (!owner || !accountId || !stationId || !publishId || !commentId)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Validate authentication/authorization
          await validateAuthenticity({
            accountId,
            owner,
            dataSources,
            prisma,
            signature,
          })

          // Check if the given comment exists
          const comment = await prisma.comment.findUnique({
            where: {
              id: commentId,
            },
          })
          if (!comment) throwError(notFoundErrMessage, "NOT_FOUND")

          // Create or delete a like depending to the case
          const like = await prisma.commentLike.findUnique({
            where: {
              identifier: {
                stationId,
                commentId,
              },
            },
          })
          if (!like) {
            // Like case
            await prisma.commentLike.create({
              data: {
                stationId,
                commentId,
              },
            })

            // Check if user disliked the comment before, if yes, delete the dislike.
            const dislike = await prisma.commentDisLike.findUnique({
              where: {
                identifier: {
                  stationId,
                  commentId,
                },
              },
            })
            if (dislike) {
              await prisma.commentDisLike.delete({
                where: {
                  identifier: {
                    stationId,
                    commentId,
                  },
                },
              })
            }
          } else {
            // Undo Like case
            await prisma.commentLike.delete({
              where: {
                identifier: {
                  stationId,
                  commentId,
                },
              },
            })
          }

          // Call the wallet service to inform the update
          dataSources.walletAPI.publishUpdated(publishId)

          return { status: "Ok" }
        } catch (error) {
          throw error
        }
      },
    })

    t.field("disLikeComment", {
      type: "WriteResult",
      args: { input: nonNull("LikeCommentInput") },
      resolve: async (
        _parent,
        { input },
        { dataSources, prisma, signature }
      ) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { owner, accountId, stationId, publishId, commentId } = input
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

          // Check if the given comment exists
          const comment = await prisma.comment.findUnique({
            where: {
              id: commentId,
            },
          })
          if (!comment) throwError(notFoundErrMessage, "NOT_FOUND")

          // Create or delete a disLike depending to the case
          const disLike = await prisma.commentDisLike.findUnique({
            where: {
              identifier: {
                stationId,
                commentId,
              },
            },
          })
          if (!disLike) {
            // disLike case
            await prisma.commentDisLike.create({
              data: {
                stationId,
                commentId,
              },
            })

            // We also need to check if user liked the comment before, if yes, we need to delete that like before.
            const like = await prisma.commentLike.findUnique({
              where: {
                identifier: {
                  stationId,
                  commentId,
                },
              },
            })
            if (like) {
              await prisma.commentLike.delete({
                where: {
                  identifier: {
                    stationId,
                    commentId,
                  },
                },
              })
            }
          } else {
            // Undo disLike case
            await prisma.commentDisLike.delete({
              where: {
                identifier: {
                  stationId,
                  commentId,
                },
              },
            })
          }

          // Call the wallet service to inform the update
          dataSources.walletAPI.publishUpdated(publishId)

          return { status: "Ok" }
        } catch (error) {
          throw error
        }
      },
    })
  },
})
