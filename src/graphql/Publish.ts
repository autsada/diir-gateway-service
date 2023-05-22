import {
  extendType,
  objectType,
  enumType,
  nonNull,
  inputObjectType,
  stringArg,
  list,
} from "nexus"

import { NexusGenInputs, NexusGenObjects } from "../typegen"
import {
  badInputErrMessage,
  notFoundErrMessage,
  throwError,
  unauthorizedErrMessage,
} from "./Error"
import { validateAuthenticity } from "../lib"

/**
 * Publish's category.
 */
export const Category = enumType({
  name: "Category",
  members: [
    "Music",
    "Movies",
    "Entertainment",
    "Sports",
    "Food",
    "Travel",
    "Gaming",
    "News",
    "Animals",
    "Education",
    "Science",
    "Technology",
    "Programming",
    "LifeStyle",
    "Vehicles",
    "Children",
    "Women",
    "Men",
    "Other",
  ],
})

export const PublishKind = enumType({
  name: "PublishKind",
  members: ["Video", "Adds", "Blog", "Podcast", "Short"],
})

export const PlaybackLink = objectType({
  name: "PlaybackLink",
  definition(t) {
    t.nonNull.string("id")
    t.nonNull.field("createdAt", { type: "DateTime" })
    t.field("updatedAt", { type: "DateTime" })
    t.nonNull.string("videoId")
    t.nonNull.string("thumbnail")
    t.nonNull.string("preview")
    t.nonNull.float("duration")
    t.nonNull.string("hls")
    t.nonNull.string("dash")
    t.nonNull.string("publishId")
  },
})

export const ThumbSource = enumType({
  name: "ThumbSource",
  members: ["generated", "custom"],
})

export const Visibility = enumType({
  name: "Visibility",
  members: ["draft", "private", "public"],
})

export const DraftPublish = objectType({
  name: "DraftPublish",
  definition(t) {
    t.nonNull.string("id")
    t.nonNull.field("createdAt", { type: "DateTime" })
    t.nonNull.string("creatorId")
    t.nonNull.string("filename")
    t.nonNull.boolean("public")
    t.nonNull.boolean("uploadError")
    t.nonNull.boolean("transcodeError")
    t.nonNull.boolean("uploading")
  },
})

export const Publish = objectType({
  name: "Publish",
  definition(t) {
    t.nonNull.string("id")
    t.nonNull.field("createdAt", { type: "DateTime" })
    t.field("updatedAt", { type: "DateTime" })
    t.nonNull.string("creatorId")
    t.string("contentURI")
    t.string("contentRef")
    t.string("filename")
    t.string("thumbnail")
    t.string("thumbnailRef")
    t.nonNull.field("thumbSource", { type: "ThumbSource" })
    t.string("title")
    t.string("description")
    t.nonNull.int("views")
    t.field("primaryCategory", { type: "Category" })
    t.field("secondaryCategory", { type: "Category" })
    t.field("kind", { type: "PublishKind" })
    t.nonNull.field("visibility", { type: "Visibility" })
    t.nonNull.boolean("uploadError")
    t.nonNull.boolean("transcodeError")
    t.nonNull.boolean("uploading")

    /**
     * Publish's creator.
     */
    t.field("creator", {
      type: "Station",
      resolve: (parent, _, { prisma }) => {
        return prisma.station.findUnique({
          where: {
            id: parent.creatorId,
          },
        })
      },
    })

    /**
     * Publish's playback
     */
    t.field("playback", {
      type: "PlaybackLink",
      resolve: (parent, _, { prisma }) => {
        return prisma.publish
          .findUnique({
            where: {
              id: parent.id,
            },
          })
          .playback() as unknown as NexusGenObjects["PlaybackLink"]
      },
    })

    /**
     * A list of stations that liked the publish.
     */
    t.nonNull.list.field("likes", {
      type: "Station",
      resolve: async (parent, _, { prisma }) => {
        const data = await prisma.publish
          .findUnique({
            where: {
              id: parent.id,
            },
          })
          .likes({
            select: {
              station: true,
            },
            orderBy: {
              createdAt: "desc",
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
     * First 100 comments.
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

export const WatchLater = objectType({
  name: "WatchLater",
  definition(t) {
    t.nonNull.string("id")
    t.nonNull.field("createdAt", { type: "DateTime" })
    t.nonNull.string("stationId")
    t.nonNull.string("publishId")
    t.field("publish", {
      type: "Publish",
      resolve(parent, _, { prisma }) {
        return prisma.publish.findUnique({
          where: {
            id: parent.publishId,
          },
        })
      },
    })
  },
})

export const QueryPublishKind = enumType({
  name: "QueryPublishKind",
  members: ["all", "videos", "podcasts", "blogs", "adds"],
})

export const GetMyPublishesInput = inputObjectType({
  name: "GetMyPublishesInput",
  definition(t) {
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("creatorId") // Creator station id
    t.nonNull.field("kind", { type: "QueryPublishKind" })
  },
})

export const FetchPublishesByCatInput = inputObjectType({
  name: "FetchPublishesByCatInput",
  definition(t) {
    t.nonNull.field("category", { type: "Category" })
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

export const PublishQuery = extendType({
  type: "Query",
  definition(t) {
    /**
     * Get a publish for creator, used for upload action in the UI
     */
    t.field("getPublishForCreator", {
      type: "Publish",
      args: { id: nonNull(stringArg()) },
      resolve: async (_parent, { id }, { prisma }) => {
        try {
          return prisma.publish.findUnique({
            where: {
              id,
            },
            include: {
              playback: true,
            },
          }) as unknown as NexusGenObjects["Publish"]
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * Get all publishes created by the creator
     * TODO: Add pagination
     */
    t.field("getMyPublishes", {
      type: nonNull(list("Publish")),
      args: { input: nonNull("GetMyPublishesInput") },
      resolve: async (
        _parent,
        { input },
        { prisma, dataSources, signature }
      ) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { owner, accountId, creatorId, kind } = input
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
          let publishes: NexusGenObjects["Publish"][] = []

          if (kind === "all") {
            publishes = await prisma.publish.findMany({
              where: {
                creatorId,
              },
              include: {
                playback: true,
              },
              orderBy: {
                createdAt: "desc",
              },
            })
          } else if (kind === "videos") {
            publishes = await prisma.publish.findMany({
              where: {
                creatorId,
                kind: {
                  in: ["Video", "Short"],
                },
              },
              include: {
                playback: true,
              },
              orderBy: {
                createdAt: "desc",
              },
            })
          } else if (kind === "podcasts") {
            publishes = await prisma.publish.findMany({
              where: {
                creatorId,
                kind: {
                  equals: "Podcast",
                },
              },
              include: {
                playback: true,
              },
              orderBy: {
                createdAt: "desc",
              },
            })
          } else if (kind === "blogs") {
            publishes = await prisma.publish.findMany({
              where: {
                creatorId,
                kind: {
                  equals: "Blog",
                },
              },
              include: {
                playback: true,
              },
              orderBy: {
                createdAt: "desc",
              },
            })
          } else if (kind === "adds") {
            publishes = await prisma.publish.findMany({
              where: {
                creatorId,
                kind: {
                  equals: "Adds",
                },
              },
              include: {
                playback: true,
              },
              orderBy: {
                createdAt: "desc",
              },
            })
          }

          return publishes
        } catch (error) {
          throw error
        }
      },
    })

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
            include: {
              creator: true,
              playback: true,
              comments: true,
              likes: true,
            },
          }) as unknown as NexusGenObjects["Publish"]
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
