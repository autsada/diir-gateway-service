import {
  extendType,
  objectType,
  enumType,
  nullable,
  nonNull,
  list,
  inputObjectType,
  intArg,
  stringArg,
} from "nexus"

import { NexusGenInputs, NexusGenObjects } from "../typegen"
import { badInputErrMessage, throwError } from "./Error"

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
  members: ["Video", "Adds", "Blog"],
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

export const Publish = objectType({
  name: "Publish",
  definition(t) {
    t.nonNull.string("id")
    t.nonNull.field("createdAt", { type: "DateTime" })
    t.field("updatedAt", { type: "DateTime" })
    t.nonNull.string("creatorId")
    t.nonNull.string("rawContentURI")
    t.nonNull.string("filename")
    t.string("thumbnail")
    t.nonNull.field("thumbSource", { type: nonNull("ThumbSource") })
    t.nonNull.string("title")
    t.string("description")
    t.int("views")
    t.nonNull.field("primaryCategory", { type: "Category" })
    t.field("secondaryCategory", { type: "Category" })
    t.nonNull.field("kind", { type: "PublishKind" })
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
        return prisma.publish
          .findUnique({
            where: {
              id: parent.id,
            },
          })
          .creator() as unknown as NexusGenObjects["Station"]
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