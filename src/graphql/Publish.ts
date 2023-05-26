import {
  extendType,
  objectType,
  enumType,
  nonNull,
  inputObjectType,
  list,
} from "nexus"
import { Publish as PublishType } from "@prisma/client"
import {
  Category as CategoryEnum,
  PublishKind as PublishKindEnum,
  PlaybackLink as PlaybackLinkModel,
  ThumbnailSource as ThumbnailSourceEnum,
  Visibility as VisibilityEnum,
  Publish as PublishModel,
  Like as LikeModel,
  DisLike as DisLikeModel,
} from "nexus-prisma"

import { NexusGenInputs, NexusGenObjects } from "../typegen"
import {
  badInputErrMessage,
  notFoundErrMessage,
  throwError,
  unauthorizedErrMessage,
} from "./Error"
import { validateAuthenticity } from "../lib"
import { FETCH_QTY } from "../lib/constants"

export const Category = enumType(CategoryEnum)
export const PublishKind = enumType(PublishKindEnum)
export const ThumbSource = enumType({
  name: "ThumbSource",
  members: ["generated", "custom"],
})
export const ThumbnailSource = enumType(ThumbnailSourceEnum)
export const Visibility = enumType(VisibilityEnum)

export const PlaybackLink = objectType({
  name: PlaybackLinkModel.$name,
  definition(t) {
    t.field(PlaybackLinkModel.id)
    t.field(PlaybackLinkModel.createdAt)
    t.field(PlaybackLinkModel.updatedAt)
    t.field(PlaybackLinkModel.videoId)
    t.field(PlaybackLinkModel.thumbnail)
    t.field(PlaybackLinkModel.preview)
    t.field(PlaybackLinkModel.duration)
    t.field(PlaybackLinkModel.hls)
    t.field(PlaybackLinkModel.dash)
    t.field(PlaybackLinkModel.publishId)
    t.field(PlaybackLinkModel.publish)
  },
})

export const Like = objectType({
  name: LikeModel.$name,
  definition(t) {
    t.field(LikeModel.createdAt)
    t.field(LikeModel.stationId)
    t.field(LikeModel.publishId)
    t.field(LikeModel.station)
    t.field(LikeModel.publish)
  },
})

export const DisLike = objectType({
  name: DisLikeModel.$name,
  definition(t) {
    t.field(DisLikeModel.createdAt)
    t.field(DisLikeModel.stationId)
    t.field(DisLikeModel.publishId)
    t.field(DisLikeModel.station)
    t.field(DisLikeModel.publish)
  },
})

export const Publish = objectType({
  name: PublishModel.$name,
  definition(t) {
    t.field(PublishModel.id)
    t.field(PublishModel.createdAt)
    t.field(PublishModel.updatedAt)
    t.field(PublishModel.creatorId)
    t.field(PublishModel.contentURI)
    t.field(PublishModel.contentRef)
    t.field(PublishModel.filename)
    t.field(PublishModel.thumbnail)
    t.field(PublishModel.thumbnailRef)
    t.field(PublishModel.thumbSource)
    t.field(PublishModel.title)
    t.field(PublishModel.description)
    t.field(PublishModel.views)
    t.field(PublishModel.primaryCategory)
    t.field(PublishModel.secondaryCategory)
    t.field(PublishModel.kind)
    t.field(PublishModel.visibility)
    t.field(PublishModel.uploadError)
    t.field(PublishModel.transcodeError)
    t.field(PublishModel.uploading)
    t.field(PublishModel.creator)
    t.field(PublishModel.playback)
    t.field(PublishModel.likes)
    t.field(PublishModel.dislikes)
    t.field(PublishModel.comments)
    t.field(PublishModel.tips)

    /**
     * Number of likes a publish has
     */
    t.nonNull.field("likesCount", {
      type: "Int",
      resolve: (parent, _, { prisma }) => {
        return prisma.like.count({
          where: {
            publishId: parent.id,
          },
        })
      },
    })

    /**
     * A boolean to check whether a station (who sends the query) liked the publish or not, if no `requestorId` provided resolve to null.
     */
    t.nullable.field("liked", {
      type: "Boolean",
      resolve: async (parent, _, { prisma }, info) => {
        const { input } = info.variableValues as {
          input: NexusGenInputs["QueryByIdInput"]
        }

        if (!input || !input.requestorId) return null
        const { requestorId } = input

        const like = await prisma.like.findUnique({
          where: {
            identifier: {
              publishId: parent.id,
              stationId: requestorId,
            },
          },
        })

        return !!like
      },
    })

    /**
     * Number of dislikes a publish has
     */
    t.nonNull.field("disLikesCount", {
      type: "Int",
      resolve: (parent, _, { prisma }) => {
        return prisma.disLike.count({
          where: {
            publishId: parent.id,
          },
        })
      },
    })

    /**
     * A boolean to check whether a station (who sends the query) disliked the publish or not, if no `requestorId` provided resolve to null.
     */
    t.nullable.field("disLiked", {
      type: "Boolean",
      resolve: async (parent, _, { prisma }, info) => {
        const { input } = info.variableValues as {
          input: NexusGenInputs["QueryByIdInput"]
        }

        if (!input || !input.requestorId) return null
        const { requestorId } = input

        const disLike = await prisma.disLike.findUnique({
          where: {
            identifier: {
              publishId: parent.id,
              stationId: requestorId,
            },
          },
        })

        return !!disLike
      },
    })

    /**
     * A list of tips that a publish received.
     */
    t.nonNull.list.field("tips", {
      type: "Tip",
      resolve: async (parent, _, { prisma }) => {
        return prisma.publish
          .findUnique({
            where: {
              id: parent.id,
            },
          })
          .tips() as unknown as NexusGenObjects["Tip"][]
      },
    })
    t.nonNull.field("tipsCount", {
      type: "Int",
      resolve: (parent, _, { prisma }) => {
        return prisma.tip.count({
          where: {
            publishId: parent.id,
          },
        })
      },
    })

    /**
     * Number of comments a publish has.
     */
    t.nonNull.field("commentsCount", {
      type: "Int",
      resolve: (parent, _, { prisma }) => {
        return prisma.comment.count({
          where: {
            publishId: parent.id,
          },
        })
      },
    })
    /**
     * A publish's last comment.
     */
    t.nullable.field("lastComment", {
      type: "Comment",
      resolve: async (parent, _, { prisma }) => {
        return prisma.comment.findFirst({
          where: {
            AND: [
              {
                publishId: parent.id,
              },
              {
                commentType: "PUBLISH",
              },
            ],
          },
          orderBy: {
            createdAt: "desc",
          },
        })
      },
    })

    /**
     * First 50 comments.
     */
    t.nullable.field("comments", {
      type: nonNull(list("Comment")),
      resolve: async (parent, _, { prisma }) => {
        return prisma.comment.findMany({
          where: {
            publishId: parent.id,
          },
          orderBy: {
            updatedAt: "desc",
          },
          take: 50,
        })
      },
    })
  },
})

export const QueryPublishKind = enumType({
  name: "QueryPublishKind",
  members: ["all", "videos", "podcasts", "blogs", "adds"],
})

export const FetchMyPublishesInput = inputObjectType({
  name: "FetchMyPublishesInput",
  definition(t) {
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("creatorId") // Creator station id
    t.string("cursor") // A point in the database to start query from --> uses `id` column
    t.nonNull.field("kind", { type: "QueryPublishKind" })
  },
})

export const FetchPublishesByCatInput = inputObjectType({
  name: "FetchPublishesByCatInput",
  definition(t) {
    t.nonNull.field("category", { type: "Category" })
  },
})

export const PublishEdge = objectType({
  name: "PublishEdge",
  definition(t) {
    t.string("cursor")
    t.field("node", {
      type: "Publish",
    })
  },
})

export const FetchPublishesResponse = objectType({
  name: "FetchPublishesResponse",
  definition(t) {
    t.nonNull.field("pageInfo", { type: "PageInfo" })
    t.nonNull.list.nonNull.field("edges", { type: "PublishEdge" })
  },
})

export const PublishQuery = extendType({
  type: "Query",
  definition(t) {
    /**
     * Get a publish by id
     */
    t.field("getPublishById", {
      type: "Publish",
      args: { input: nonNull("QueryByIdInput") },
      resolve: async (_parent, { input }, { prisma }) => {
        try {
          const { targetId } = input

          return prisma.publish.findUnique({
            where: {
              id: targetId,
            },
          })
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * Fetch all publishes created by the creator
     * $TODO: Add pagination
     */
    t.field("fetchMyPublishes", {
      type: "FetchPublishesResponse",
      args: { input: nonNull("FetchMyPublishesInput") },
      resolve: async (
        _parent,
        { input },
        { prisma, dataSources, signature }
      ) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { owner, accountId, creatorId, cursor, kind } = input
          if (!owner || !accountId || !creatorId || !kind)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Validate authentication/authorization
          await validateAuthenticity({
            accountId,
            owner,
            dataSources,
            prisma,
            signature,
          })

          // Check if the requestor owns the given creatorId.
          const creator = await prisma.station.findUnique({
            where: {
              id: creatorId,
            },
          })
          if (!creator || creator.accountId !== accountId)
            throwError(unauthorizedErrMessage, "UN_AUTHORIZED")

          // Query publises by creator id
          let publishes: PublishType[] = []

          if (kind === "all") {
            if (!cursor) {
              // A. First query
              publishes = await prisma.publish.findMany({
                where: {
                  creatorId,
                },
                take: FETCH_QTY,
                orderBy: {
                  createdAt: "desc",
                },
              })
            } else {
              // B. Consecutive queries
              publishes = await prisma.publish.findMany({
                where: {
                  creatorId,
                },
                take: FETCH_QTY,
                cursor: {
                  id: cursor,
                },
                skip: 1, // Skip the cusor
                orderBy: {
                  createdAt: "desc",
                },
              })
            }
          } else if (kind === "videos") {
            if (!cursor) {
              // A. First query
              publishes = await prisma.publish.findMany({
                where: {
                  creatorId,
                  kind: {
                    in: ["Video", "Short"],
                  },
                },
                take: FETCH_QTY,
                orderBy: {
                  createdAt: "desc",
                },
              })
            } else {
              // B. Consecutive queries
              publishes = await prisma.publish.findMany({
                where: {
                  creatorId,
                  kind: {
                    in: ["Video", "Short"],
                  },
                },
                take: FETCH_QTY,
                cursor: {
                  id: cursor,
                },
                skip: 1, // Skip the cusor
                orderBy: {
                  createdAt: "desc",
                },
              })
            }
          } else if (kind === "podcasts") {
            if (!cursor) {
              // A. First query
              publishes = await prisma.publish.findMany({
                where: {
                  creatorId,
                  kind: {
                    equals: "Podcast",
                  },
                },
                take: FETCH_QTY,
                orderBy: {
                  createdAt: "desc",
                },
              })
            } else {
              // B. Consecutive queries
              publishes = await prisma.publish.findMany({
                where: {
                  creatorId,
                  kind: {
                    equals: "Podcast",
                  },
                },
                take: FETCH_QTY,
                cursor: {
                  id: cursor,
                },
                skip: 1, // Skip the cusor
                orderBy: {
                  createdAt: "desc",
                },
              })
            }
          } else if (kind === "blogs") {
            if (!cursor) {
              // A. First query
              publishes = await prisma.publish.findMany({
                where: {
                  creatorId,
                  kind: {
                    equals: "Blog",
                  },
                },
                take: FETCH_QTY,
                orderBy: {
                  createdAt: "desc",
                },
              })
            } else {
              // B. Consecutive queries
              publishes = await prisma.publish.findMany({
                where: {
                  creatorId,
                  kind: {
                    equals: "Blog",
                  },
                },
                take: FETCH_QTY,
                cursor: {
                  id: cursor,
                },
                skip: 1, // Skip the cusor
                orderBy: {
                  createdAt: "desc",
                },
              })
            }
          } else if (kind === "adds") {
            if (!cursor) {
              // A. First query
              publishes = await prisma.publish.findMany({
                where: {
                  creatorId,
                  kind: {
                    equals: "Adds",
                  },
                },
                take: FETCH_QTY,
                orderBy: {
                  createdAt: "desc",
                },
              })
            } else {
              // B. Consecutive queries
              publishes = await prisma.publish.findMany({
                where: {
                  creatorId,
                  kind: {
                    equals: "Adds",
                  },
                },
                take: FETCH_QTY,
                cursor: {
                  id: cursor,
                },
                skip: 1, // Skip the cusor
                orderBy: {
                  createdAt: "desc",
                },
              })
            }
          }

          if (publishes.length === FETCH_QTY) {
            // Fetch result is equal to take quantity, so it has posibility that there are more to be fetched.
            const lastFetchedCursor = publishes[publishes.length - 1].id

            // Check if there is next page
            const nextQuery = await prisma.publish.findMany({
              where: {
                creatorId,
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
              },
              edges: publishes.map((pub) => ({
                cursor: pub.id,
                node: pub,
              })),
            }
          } else {
            // No more items to be fetched
            return {
              pageInfo: {
                endCursor: null,
                hasNextPage: false,
              },
              edges: publishes.map((pub) => ({
                cursor: pub.id,
                node: pub,
              })),
            }
          }
        } catch (error) {
          throw error
        }
      },
    })

    // TODO: Implement pagination
    t.field("fetchAllVideos", {
      type: nonNull(list("Publish")),
      resolve(_parent, _, { prisma }) {
        try {
          return prisma.publish.findMany({
            where: {
              AND: [
                {
                  visibility: {
                    equals: "public",
                  },
                },
                {
                  kind: {
                    in: ["Video", "Short"],
                  },
                },
                {
                  uploading: false,
                },
              ],
            },
            include: {
              creator: true,
              playback: true,
            },
            take: 50,
          }) as unknown as NexusGenObjects["Publish"][]
        } catch (error) {
          throw error
        }
      },
    })

    // TODO: Implement pagination
    t.field("fetchVideosByCategory", {
      type: nonNull(list("Publish")),
      args: { input: nonNull("FetchPublishesByCatInput") },
      resolve(_parent, { input }, { prisma }) {
        try {
          return prisma.publish.findMany({
            where: {
              AND: [
                {
                  visibility: {
                    equals: "public",
                  },
                },
                {
                  kind: {
                    equals: "Video",
                  },
                },
              ],
              OR: [
                {
                  primaryCategory: {
                    equals: input.category,
                  },
                },
                {
                  secondaryCategory: {
                    equals: input.category,
                  },
                },
              ],
            },
            include: {
              creator: true,
              playback: true,
            },
            take: 50,
          }) as unknown as NexusGenObjects["Publish"][]
        } catch (error) {
          throw error
        }
      },
    })
  },
})

export const CreateDraftPublishInput = inputObjectType({
  name: "CreateDraftPublishInput",
  definition(t) {
    t.nonNull.string("creatorId") // Creator station id
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("filename")
  },
})

export const CreateDraftPublishResult = objectType({
  name: "CreateDraftPublishResult",
  definition(t) {
    t.nonNull.string("id") // Publish id
    t.string("filename") // Uploaded file name
  },
})

export const UpdatePublishInput = inputObjectType({
  name: "UpdatePublishInput",
  definition(t) {
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("stationId")
    t.nonNull.string("publishId")
    t.string("contentURI")
    t.string("contentRef")
    t.string("thumbnail")
    t.string("thumbnailRef")
    t.nonNull.field("thumbSource", { type: "ThumbSource" })
    t.string("title")
    t.string("description")
    t.field("primaryCategory", { type: "Category" })
    t.field("secondaryCategory", { type: "Category" })
    t.field("kind", { type: "PublishKind" })
    t.field("visibility", { type: "Visibility" })
  },
})

export const PublishMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createDraftPublish", {
      type: "CreateDraftPublishResult",
      args: { input: nonNull("CreateDraftPublishInput") },
      resolve: async (
        _parent,
        { input },
        { prisma, dataSources, signature }
      ) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { creatorId, owner, accountId, filename } = input
          if (!creatorId || !owner || !accountId || !filename)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Validate authentication/authorization
          await validateAuthenticity({
            accountId,
            owner,
            dataSources,
            prisma,
            signature,
          })

          // Create a draft publish
          const draft = await prisma.publish.create({
            data: {
              creatorId,
              title: filename,
              filename,
              uploading: true, // Set uploading to true because file upload will be started right after the draft is created.
            },
          })

          return { id: draft.id, filename }
        } catch (error) {
          throw error
        }
      },
    })

    t.field("updatePublish", {
      type: "Publish",
      args: { input: nonNull("UpdatePublishInput") },
      resolve: async (
        _parent,
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
            contentURI,
            contentRef,
            thumbnail,
            thumbnailRef,
            thumbSource,
            title,
            description,
            primaryCategory,
            secondaryCategory,
            kind,
            visibility,
          } = input
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

          // Check if the given station id owns the publish
          let publish = await prisma.publish.findUnique({
            where: {
              id: publishId,
            },
            include: {
              playback: true,
            },
          })
          if (!publish) throwError(notFoundErrMessage, "NOT_FOUND")
          if (publish?.creatorId !== stationId)
            throwError(unauthorizedErrMessage, "UN_AUTHORIZED")

          // Update publish
          await prisma.publish.update({
            where: {
              id: publishId,
            },
            data: {
              contentURI,
              contentRef,
              thumbnail,
              thumbnailRef,
              thumbSource,
              title,
              description,
              primaryCategory,
              secondaryCategory,
              kind:
                publish?.playback?.duration && publish?.playback?.duration <= 60
                  ? "Short"
                  : kind,
              visibility: visibility || "private",
              updatedAt: new Date(),
            },
          })

          return publish as unknown as NexusGenObjects["Publish"]
        } catch (error) {
          throw error
        }
      },
    })
  },
})
