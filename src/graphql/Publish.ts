import {
  extendType,
  objectType,
  enumType,
  nonNull,
  inputObjectType,
  list,
} from "nexus"
import {
  Publish as PublishType,
  DontRecommend as DontRecommendType,
} from "@prisma/client"
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
            AND: [
              {
                publishId: parent.id,
              },
              {
                commentType: "PUBLISH",
              },
            ],
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

export const FetchPublishesInput = inputObjectType({
  name: "FetchPublishesInput",
  definition(t) {
    t.string("requestorId") // Station id of the requestor
    t.string("cursor")
  },
})

// Fetch publishes to display on the watch page
export const FetchSuggestedPublishesInput = inputObjectType({
  name: "FetchSuggestedPublishesInput",
  definition(t) {
    t.string("requestorId") // Station id of the requestor
    t.nonNull.string("publishId")
    t.string("cursor")
  },
})

export const FetchPublishesByCatInput = inputObjectType({
  name: "FetchPublishesByCatInput",
  definition(t) {
    t.string("requestorId") // Station id of the requestor
    t.nonNull.field("category", { type: "Category" })
    t.string("cursor")
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

    t.field("fetchAllVideos", {
      type: "FetchPublishesResponse",
      args: { input: nonNull("FetchPublishesInput") },
      async resolve(_parent, { input }, { prisma }) {
        try {
          const { cursor, requestorId } = input

          let videos: PublishType[] = []

          let dontRecommends: DontRecommendType[] = []
          if (requestorId) {
            // Query dont recommends of the user
            dontRecommends = await prisma.dontRecommend.findMany({
              where: {
                requestorId,
              },
              take: 1000, // Take the last 1000 records
              orderBy: {
                createdAt: "desc",
              },
            })
          }

          // Get requestor station
          const requestor = !requestorId
            ? null
            : await prisma.station.findUnique({
                where: {
                  id: requestorId,
                },
              })

          // List of the station ids in user's don't recommend list
          const dontRecommendsList = dontRecommends.map((drc) => drc.targetId)

          if (!cursor) {
            // Query preferred categories first
            videos = await prisma.publish.findMany({
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
                  {
                    creatorId: {
                      notIn: dontRecommendsList,
                    },
                  },
                ],
                OR:
                  !requestor || requestor.preferences.length === 0
                    ? undefined
                    : [
                        {
                          primaryCategory: {
                            in: requestor.preferences,
                          },
                        },
                        {
                          secondaryCategory: {
                            in: requestor.preferences,
                          },
                        },
                      ],
              },
              take: FETCH_QTY,
              orderBy: {
                createdAt: "desc",
              },
            })
          } else {
            // Query preferred categories first
            videos = await prisma.publish.findMany({
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
                  {
                    creatorId: {
                      notIn: dontRecommendsList,
                    },
                  },
                ],
                OR:
                  !requestor || requestor.preferences.length === 0
                    ? undefined
                    : [
                        {
                          primaryCategory: {
                            in: requestor.preferences,
                          },
                        },
                        {
                          secondaryCategory: {
                            in: requestor.preferences,
                          },
                        },
                      ],
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

          if (videos.length === FETCH_QTY) {
            // Fetch result is equal to take quantity, so it has posibility that there are more to be fetched.
            const lastFetchedCursor = videos[videos.length - 1].id

            // Check if there is next page
            // Query all (not just preferred categories)
            let nextQuery = await prisma.publish.findMany({
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
                  {
                    creatorId: {
                      notIn: dontRecommendsList,
                    },
                  },
                ],
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
              edges: videos.map((pub) => ({
                cursor: pub.id,
                node: pub,
              })),
            }
          } else {
            return {
              pageInfo: {
                endCursor: null,
                hasNextPage: false,
              },
              edges: videos.map((video) => ({
                cursor: video.id,
                node: video,
              })),
            }
          }
        } catch (error) {
          throw error
        }
      },
    })

    t.field("fetchVideosByCategory", {
      type: "FetchPublishesResponse",
      args: { input: nonNull("FetchPublishesByCatInput") },
      async resolve(_parent, { input }, { prisma }) {
        try {
          const { category, cursor, requestorId } = input

          let videos: PublishType[] = []

          let dontRecommends: DontRecommendType[] = []
          if (requestorId) {
            // Query dont recommends of the user
            dontRecommends = await prisma.dontRecommend.findMany({
              where: {
                requestorId,
              },
              take: 1000, // Take the last 1000 records
              orderBy: {
                createdAt: "desc",
              },
            })
          }

          // List of the station ids in user's don't recommend list
          const dontRecommendsList = dontRecommends.map((drc) => drc.targetId)

          if (!cursor) {
            videos = await prisma.publish.findMany({
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
                  {
                    creatorId: {
                      notIn: dontRecommendsList,
                    },
                  },
                ],
                OR: [
                  {
                    primaryCategory: {
                      equals: category,
                    },
                  },
                  {
                    secondaryCategory: {
                      equals: category,
                    },
                  },
                ],
              },
              take: FETCH_QTY,
              orderBy: {
                createdAt: "desc",
              },
            })
          } else {
            videos = await prisma.publish.findMany({
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
                  {
                    creatorId: {
                      notIn: dontRecommendsList,
                    },
                  },
                ],
                OR: [
                  {
                    primaryCategory: {
                      equals: category,
                    },
                  },
                  {
                    secondaryCategory: {
                      equals: category,
                    },
                  },
                ],
              },
              cursor: {
                id: cursor,
              },
              skip: 1, // Skip cursor
              take: FETCH_QTY,
              orderBy: {
                createdAt: "desc",
              },
            })
          }

          if (videos.length === FETCH_QTY) {
            // Fetch result is equal to take quantity, so it has posibility that there are more to be fetched.
            const lastFetchedCursor = videos[videos.length - 1].id

            // Check if there is next page
            const nextQuery = await prisma.publish.findMany({
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
                  {
                    creatorId: {
                      notIn: dontRecommendsList,
                    },
                  },
                ],
                OR: [
                  {
                    primaryCategory: {
                      equals: category,
                    },
                  },
                  {
                    secondaryCategory: {
                      equals: category,
                    },
                  },
                ],
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
              edges: videos.map((video) => ({
                cursor: video.id,
                node: video,
              })),
            }
          } else {
            // No more items to be fetched
            return {
              pageInfo: {
                endCursor: null,
                hasNextPage: false,
              },
              edges: videos.map((video) => ({
                cursor: video.id,
                node: video,
              })),
            }
          }
        } catch (error) {
          throw error
        }
      },
    })

    t.field("fetchSuggestedVideos", {
      type: "FetchPublishesResponse",
      args: { input: nonNull("FetchSuggestedPublishesInput") },
      async resolve(_parent, { input }, { prisma }) {
        try {
          const { cursor, requestorId, publishId } = input

          let videos: PublishType[] = []

          // Get requestor station
          const requestor = !requestorId
            ? null
            : await prisma.station.findUnique({
                where: {
                  id: requestorId,
                },
              })

          let dontRecommends: DontRecommendType[] = []
          if (requestor) {
            // Query dont recommends of the user
            dontRecommends = await prisma.dontRecommend.findMany({
              where: {
                requestorId: requestor.id,
              },
              take: 1000, // Take the last 1000 records
              orderBy: {
                createdAt: "desc",
              },
            })
          }

          // List of the station ids in user's don't recommend list
          // Add the publish id in the list so user will not see the publish in the list as they are watching the given publish
          const dontRecommendsList = dontRecommends.map((drc) => drc.targetId)

          if (!cursor) {
            videos = await prisma.publish.findMany({
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
                  {
                    creatorId: {
                      notIn: dontRecommendsList,
                    },
                  },
                  {
                    id: {
                      not: publishId,
                    },
                  },
                ],
                OR:
                  !requestor || requestor.preferences.length === 0
                    ? undefined
                    : [
                        {
                          primaryCategory: {
                            in: requestor.preferences,
                          },
                        },
                        {
                          secondaryCategory: {
                            in: requestor.preferences,
                          },
                        },
                      ],
              },
              take: FETCH_QTY,
              orderBy: {
                createdAt: "desc",
              },
            })
          } else {
            videos = await prisma.publish.findMany({
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
                  {
                    creatorId: {
                      notIn: dontRecommendsList,
                    },
                  },
                  {
                    id: {
                      not: publishId,
                    },
                  },
                ],
                OR:
                  !requestor || requestor.preferences.length === 0
                    ? undefined
                    : [
                        {
                          primaryCategory: {
                            in: requestor.preferences,
                          },
                        },
                        {
                          secondaryCategory: {
                            in: requestor.preferences,
                          },
                        },
                      ],
              },
              cursor: {
                id: cursor,
              },
              skip: 1, // Skip cursor
              take: FETCH_QTY,
              orderBy: {
                createdAt: "desc",
              },
            })
          }

          if (videos.length === FETCH_QTY) {
            // Fetch result is equal to take quantity, so it has posibility that there are more to be fetched.
            const lastFetchedCursor = videos[videos.length - 1].id

            // Check if there is next page
            const nextQuery = await prisma.publish.findMany({
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
                  {
                    creatorId: {
                      notIn: dontRecommendsList,
                    },
                  },
                  {
                    id: {
                      not: publishId,
                    },
                  },
                ],
                OR:
                  !requestor || requestor.preferences.length === 0
                    ? undefined
                    : [
                        {
                          primaryCategory: {
                            in: requestor.preferences,
                          },
                        },
                        {
                          secondaryCategory: {
                            in: requestor.preferences,
                          },
                        },
                      ],
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
              edges: videos.map((video) => ({
                cursor: video.id,
                node: video,
              })),
            }
          } else {
            // No more items to be fetched
            return {
              pageInfo: {
                endCursor: null,
                hasNextPage: false,
              },
              edges: videos.map((video) => ({
                cursor: video.id,
                node: video,
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

export const LikePublishInput = inputObjectType({
  name: "LikePublishInput",
  definition(t) {
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("stationId")
    t.nonNull.string("publishId")
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

          return publish
        } catch (error) {
          throw error
        }
      },
    })

    t.field("likePublish", {
      type: "WriteResult",
      args: { input: nonNull("LikePublishInput") },
      resolve: async (
        _parent,
        { input },
        { dataSources, prisma, signature }
      ) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { owner, accountId, stationId, publishId } = input
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

          // Check if the given publish exists
          const publish = await prisma.publish.findUnique({
            where: {
              id: publishId,
            },
          })
          if (!publish) throwError(notFoundErrMessage, "NOT_FOUND")

          // Create or delete a like depending to the case
          const like = await prisma.like.findUnique({
            where: {
              identifier: {
                stationId,
                publishId,
              },
            },
          })
          if (!like) {
            // Like case
            await prisma.like.create({
              data: {
                stationId,
                publishId,
              },
            })

            // Check if user disliked the publish before, if yes, delete the dislike.
            const dislike = await prisma.disLike.findUnique({
              where: {
                identifier: {
                  stationId,
                  publishId,
                },
              },
            })
            if (dislike) {
              await prisma.disLike.delete({
                where: {
                  identifier: {
                    stationId,
                    publishId,
                  },
                },
              })
            }
          } else {
            // Undo Like case
            await prisma.like.delete({
              where: {
                identifier: {
                  stationId,
                  publishId,
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

    t.field("disLikePublish", {
      type: "WriteResult",
      args: { input: nonNull("LikePublishInput") },
      resolve: async (
        _parent,
        { input },
        { dataSources, prisma, signature }
      ) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { owner, accountId, stationId, publishId } = input
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

          // Check if the given publish exists
          const publish = await prisma.publish.findUnique({
            where: {
              id: publishId,
            },
          })
          if (!publish) throwError(notFoundErrMessage, "NOT_FOUND")

          // Create or delete a disLike depending to the case
          const disLike = await prisma.disLike.findUnique({
            where: {
              identifier: {
                stationId,
                publishId,
              },
            },
          })
          if (!disLike) {
            // disLike case
            await prisma.disLike.create({
              data: {
                stationId,
                publishId,
              },
            })

            // We also need to check if user liked the publish before, if yes, we need to delete that like before.
            const like = await prisma.like.findUnique({
              where: {
                identifier: {
                  stationId,
                  publishId,
                },
              },
            })
            if (like) {
              await prisma.like.delete({
                where: {
                  identifier: {
                    stationId,
                    publishId,
                  },
                },
              })
            }
          } else {
            // Undo disLike case
            await prisma.disLike.delete({
              where: {
                identifier: {
                  stationId,
                  publishId,
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
