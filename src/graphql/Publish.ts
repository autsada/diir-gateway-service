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
import { badInputErrMessage, throwError, unauthorizedErrMessage } from "./Error"
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

export const DraftPublish = objectType({
  name: "DraftPublish",
  definition(t) {
    t.nonNull.string("id")
    t.nonNull.field("createdAt", { type: "DateTime" })
    t.nonNull.string("creatorId")
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
    t.string("rawContentURI")
    t.string("filename")
    t.string("thumbnail")
    t.field("thumbSource", { type: nonNull("ThumbSource") })
    t.string("title")
    t.string("description")
    t.int("views")
    t.field("primaryCategory", { type: "Category" })
    t.field("secondaryCategory", { type: "Category" })
    t.field("kind", { type: "PublishKind" })
    t.nonNull.boolean("public")
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
  },
})

export const PublishQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("getPublishById", {
      type: "Publish",
      args: { id: nonNull(stringArg()) },
      resolve: async (_parent, { id }, { prisma }) => {
        try {
          return prisma.publish.findUnique({
            where: {
              id,
            },
          }) as unknown as NexusGenObjects["Publish"]
        } catch (error) {
          throw error
        }
      },
    })

    // TODO: Implement pagination
    t.field("fetchPublishes", {
      type: nonNull(list("Publish")),
      resolve(_parent, _, { prisma }) {
        try {
          return prisma.publish.findMany(
            {}
          ) as unknown as NexusGenObjects["Publish"][]
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
    t.nonNull.string("creatorId")
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
  },
})

export const UpdatePublishInput = inputObjectType({
  name: "UpdatePublishInput",
  definition(t) {
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("publishId")
    t.string("thumbnail")
    t.field("thumbSource", { type: "ThumbSource" })
    t.string("title")
    t.string("description")
    t.field("primaryCategory", { type: "Category" })
    t.field("secondaryCategory", { type: "Category" })
    t.field("kind", { type: "PublishKind" })
    t.boolean("isPublic")
  },
})

export const PublishMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createDraftPublish", {
      type: "DraftPublish",
      args: { input: nonNull("CreateDraftPublishInput") },
      resolve: async (
        _parent,
        { input },
        { prisma, dataSources, signedMessage }
      ) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { creatorId, owner, accountId } = input
          if (!creatorId || !owner || !accountId)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Validate authentication/authorization
          await validateAuthenticity({
            accountId,
            owner,
            dataSources,
            prisma,
            walletAddress: signedMessage,
          })

          // Create a draft publish
          const draft = await prisma.publish.create({
            data: {
              creatorId,
            },
          })

          return draft
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
        { dataSources, prisma, signedMessage }
      ) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const {
            owner,
            accountId,
            publishId,
            thumbnail,
            thumbSource,
            title,
            description,
            primaryCategory,
            secondaryCategory,
            kind,
            isPublic,
          } = input
          if (!owner || !accountId || !publishId)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Validate authentication/authorization
          await validateAuthenticity({
            accountId,
            owner,
            dataSources,
            prisma,
            walletAddress: signedMessage,
          })

          const publish = (await prisma.publish.update({
            where: {
              id: publishId,
            },
            data: {
              thumbnail,
              thumbSource,
              title,
              description,
              primaryCategory,
              secondaryCategory,
              kind,
              public: !!isPublic,
            },
          })) as unknown as NexusGenObjects["Publish"]

          return publish
        } catch (error) {
          console.log("error: ", error)
          throw error
        }
      },
    })
  },
})
