import {
  extendType,
  objectType,
  enumType,
  nonNull,
  inputObjectType,
  stringArg,
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
  Blog as BlogModel,
} from "nexus-prisma"

import { NexusGenInputs, NexusGenObjects } from "../typegen"
import {
  badInputErrMessage,
  badRequestErrMessage,
  notFoundErrMessage,
  throwError,
  unauthorizedErrMessage,
} from "./Error"
import {
  calucateReadingTime,
  getPostExcerpt,
  validateAuthenticity,
} from "../lib"
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

export const Blog = objectType({
  name: BlogModel.$name,
  definition(t) {
    t.field(BlogModel.createdAt)
    t.field(BlogModel.updatedAt)
    t.field(BlogModel.publishId)
    t.field(BlogModel.publish)
    t.field(BlogModel.content)
    t.field(BlogModel.htmlContent)
    t.field(BlogModel.readingTime)
    t.field(BlogModel.excerpt)
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
    t.field(PublishModel.tags)
    t.field(PublishModel.uploadError)
    t.field(PublishModel.transcodeError)
    t.field(PublishModel.uploading)
    t.field(PublishModel.deleting)
    t.field(PublishModel.creator)
    t.field(PublishModel.playback)
    t.field(PublishModel.likes)
    t.field(PublishModel.dislikes)
    t.field(PublishModel.comments)
    t.field(PublishModel.tips)
    t.field(PublishModel.blog)

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
          orderBy: [
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
      },
    })

    /**
     * A boolean to check whether a profile (who sends the query) bookmarked the publish or not, if no `requestorId` provided resolve to null.
     */
    t.nullable.field("bookmarked", {
      type: "Boolean",
      resolve: async (parent, _, { prisma }, info) => {
        const { input } = info.variableValues as {
          input: NexusGenInputs["QueryByIdInput"]
        }

        if (!input || !input.requestorId) return null
        const { requestorId } = input

        const bookmark = await prisma.readBookmark.findUnique({
          where: {
            identifier: {
              publishId: parent.id,
              profileId: requestorId,
            },
          },
        })

        return !!bookmark
      },
    })
  },
})

export const QueryPublishKind = enumType({
  name: "QueryPublishKind",
  members: ["all", "videos", "podcasts", "blogs", "ads"],
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
    t.field("orderBy", { type: "PublishOrderBy" })
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

export const PublishOrderBy = enumType({
  name: "PublishOrderBy",
  members: ["latest", "popular"],
})

export const FetchStationPublishesInput = inputObjectType({
  name: "FetchStationPublishesInput",
  definition(t) {
    t.nonNull.string("creatorId") // Station id of the creator
    t.string("requestorId") // Station id of the requestor
    t.string("cursor")
    t.field("kind", { type: "QueryPublishKind" })
    t.field("orderBy", { type: "PublishOrderBy" })
  },
})

export const FetchShortsInput = inputObjectType({
  name: "FetchShortsInput",
  definition(t) {
    t.string("requestorId") // Station id of the requestor
    t.string("cursor")
  },
})

export const GetShortInput = inputObjectType({
  name: "GetShortInput",
  definition(t) {
    t.string("requestorId") // Station id of the requestor
    t.nonNull.string("publishId") // An id of the short to be fetch
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

export const GetShortResponse = objectType({
  name: "GetShortResponse",
  definition(t) {
    t.nonNull.field("current", { type: "Publish" })
    t.field("prev", { type: "Publish" })
    t.field("next", { type: "Publish" })
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
          } else if (kind === "ads") {
            if (!cursor) {
              // A. First query
              publishes = await prisma.publish.findMany({
                where: {
                  creatorId,
                  kind: {
                    equals: "Ads",
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
                    equals: "Ads",
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

          // // Get requestor station
          // const requestor = !requestorId
          //   ? null
          //   : await prisma.station.findUnique({
          //       where: {
          //         id: requestorId,
          //       },
          //     })

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
                // OR:
                //   !requestor || requestor.preferences.length === 0
                //     ? undefined
                //     : [
                //         {
                //           primaryCategory: {
                //             in: requestor.preferences,
                //           },
                //         },
                //         {
                //           secondaryCategory: {
                //             in: requestor.preferences,
                //           },
                //         },
                //       ],
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
                // OR:
                //   !requestor || requestor.preferences.length === 0
                //     ? undefined
                //     : [
                //         {
                //           primaryCategory: {
                //             in: requestor.preferences,
                //           },
                //         },
                //         {
                //           secondaryCategory: {
                //             in: requestor.preferences,
                //           },
                //         },
                //       ],
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
                  !requestor || requestor.watchPreferences.length === 0
                    ? undefined
                    : [
                        {
                          primaryCategory: {
                            in: requestor.watchPreferences,
                          },
                        },
                        {
                          secondaryCategory: {
                            in: requestor.watchPreferences,
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
                  !requestor || requestor.watchPreferences.length === 0
                    ? undefined
                    : [
                        {
                          primaryCategory: {
                            in: requestor.watchPreferences,
                          },
                        },
                        {
                          secondaryCategory: {
                            in: requestor.watchPreferences,
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
                  !requestor || requestor.watchPreferences.length === 0
                    ? undefined
                    : [
                        {
                          primaryCategory: {
                            in: requestor.watchPreferences,
                          },
                        },
                        {
                          secondaryCategory: {
                            in: requestor.watchPreferences,
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

    /**
     * Fetch publishes uploaded by a station
     */
    t.field("fetchStationPublishes", {
      type: "FetchPublishesResponse",
      args: { input: nonNull("FetchStationPublishesInput") },
      resolve: async (_parent, { input }, { prisma }) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { cursor, kind, creatorId, orderBy } = input

          // Query publises by creator id
          let publishes: PublishType[] = []

          if (!kind || kind === "all") {
            if (!cursor) {
              // A. First query
              publishes = await prisma.publish.findMany({
                where: {
                  AND: [
                    {
                      creatorId,
                    },
                    {
                      visibility: {
                        equals: "public",
                      },
                    },
                  ],
                },
                take: FETCH_QTY,
                orderBy:
                  orderBy === "popular"
                    ? {
                        views: "desc",
                      }
                    : {
                        createdAt: "desc",
                      },
              })
            } else {
              // B. Consecutive queries
              publishes = await prisma.publish.findMany({
                where: {
                  AND: [
                    {
                      creatorId,
                    },
                    {
                      visibility: {
                        equals: "public",
                      },
                    },
                  ],
                },
                take: FETCH_QTY,
                cursor: {
                  id: cursor,
                },
                skip: 1, // Skip the cusor
                orderBy:
                  orderBy === "popular"
                    ? {
                        views: "desc",
                      }
                    : {
                        createdAt: "desc",
                      },
              })
            }
          } else if (kind === "videos") {
            if (!cursor) {
              // A. First query
              publishes = await prisma.publish.findMany({
                where: {
                  AND: [
                    {
                      creatorId,
                    },
                    {
                      kind: {
                        in: ["Video", "Short"],
                      },
                    },
                    {
                      visibility: {
                        equals: "public",
                      },
                    },
                  ],
                },
                take: FETCH_QTY,
                orderBy:
                  orderBy === "popular"
                    ? {
                        views: "desc",
                      }
                    : {
                        createdAt: "desc",
                      },
              })
            } else {
              // B. Consecutive queries
              publishes = await prisma.publish.findMany({
                where: {
                  AND: [
                    {
                      creatorId,
                    },
                    {
                      kind: {
                        in: ["Video", "Short"],
                      },
                    },
                    {
                      visibility: {
                        equals: "public",
                      },
                    },
                  ],
                },
                take: FETCH_QTY,
                cursor: {
                  id: cursor,
                },
                skip: 1, // Skip the cusor
                orderBy:
                  orderBy === "popular"
                    ? {
                        views: "desc",
                      }
                    : {
                        createdAt: "desc",
                      },
              })
            }
          } else if (kind === "blogs") {
            if (!cursor) {
              // A. First query
              publishes = await prisma.publish.findMany({
                where: {
                  AND: [
                    {
                      creatorId,
                    },
                    {
                      kind: {
                        equals: "Blog",
                      },
                    },
                    {
                      visibility: {
                        equals: "public",
                      },
                    },
                  ],
                },
                take: FETCH_QTY,
                orderBy:
                  orderBy === "popular"
                    ? {
                        views: "desc",
                      }
                    : {
                        createdAt: "desc",
                      },
              })
            } else {
              // B. Consecutive queries
              publishes = await prisma.publish.findMany({
                where: {
                  AND: [
                    {
                      creatorId,
                    },
                    {
                      kind: {
                        equals: "Blog",
                      },
                    },
                    {
                      visibility: {
                        equals: "public",
                      },
                    },
                  ],
                },
                take: FETCH_QTY,
                cursor: {
                  id: cursor,
                },
                skip: 1, // Skip the cusor
                orderBy:
                  orderBy === "popular"
                    ? {
                        views: "desc",
                      }
                    : {
                        createdAt: "desc",
                      },
              })
            }
          } else if (kind === "ads") {
            if (!cursor) {
              // A. First query
              publishes = await prisma.publish.findMany({
                where: {
                  AND: [
                    {
                      creatorId,
                    },
                    {
                      kind: {
                        equals: "Ads",
                      },
                    },
                    {
                      visibility: {
                        equals: "public",
                      },
                    },
                  ],
                },
                take: FETCH_QTY,
                orderBy:
                  orderBy === "popular"
                    ? {
                        views: "desc",
                      }
                    : {
                        createdAt: "desc",
                      },
              })
            } else {
              // B. Consecutive queries
              publishes = await prisma.publish.findMany({
                where: {
                  AND: [
                    {
                      creatorId,
                    },
                    {
                      kind: {
                        equals: "Ads",
                      },
                    },
                    {
                      visibility: {
                        equals: "public",
                      },
                    },
                  ],
                },
                take: FETCH_QTY,
                cursor: {
                  id: cursor,
                },
                skip: 1, // Skip the cusor
                orderBy:
                  orderBy === "popular"
                    ? {
                        views: "desc",
                      }
                    : {
                        createdAt: "desc",
                      },
              })
            }
          }

          // Get publishes count
          const count = await prisma.publish.count({
            where: {
              creatorId,
            },
          })

          if (publishes.length === FETCH_QTY) {
            // Fetch result is equal to take quantity, so it has posibility that there are more to be fetched.
            const lastFetchedCursor = publishes[publishes.length - 1].id

            // Check if there is next page
            const nextQuery = await prisma.publish.findMany({
              where: {
                AND: [
                  {
                    creatorId,
                  },
                  {
                    visibility: {
                      equals: "public",
                    },
                  },
                ],
              },
              take: FETCH_QTY,
              cursor: {
                id: lastFetchedCursor,
              },
              skip: 1, // Skip the cusor
              orderBy:
                orderBy === "popular"
                  ? {
                      views: "desc",
                    }
                  : {
                      createdAt: "desc",
                    },
            })

            return {
              pageInfo: {
                endCursor: lastFetchedCursor,
                hasNextPage: nextQuery.length > 0,
                count,
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
                count,
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

    /**
     * Fetch short videos
     */
    t.field("fetchShorts", {
      type: "FetchPublishesResponse",
      args: { input: nonNull("FetchShortsInput") },
      resolve: async (_parent, { input }, { prisma }) => {
        try {
          const { cursor, requestorId } = input

          let shorts: PublishType[] = []

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
            shorts = await prisma.publish.findMany({
              where: {
                AND: [
                  {
                    kind: {
                      equals: "Short",
                    },
                  },
                  {
                    visibility: {
                      equals: "public",
                    },
                  },
                  {
                    creatorId: {
                      notIn: dontRecommendsList,
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
            shorts = await prisma.publish.findMany({
              where: {
                AND: [
                  {
                    kind: {
                      equals: "Short",
                    },
                  },
                  {
                    visibility: {
                      equals: "public",
                    },
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
                id: cursor,
              },
              skip: 1,
              orderBy: {
                createdAt: "desc",
              },
            })
          }

          // Get publishes count
          const count = await prisma.publish.count({
            where: {
              kind: {
                equals: "Short",
              },
            },
          })

          if (shorts.length === FETCH_QTY) {
            // Fetch result is equal to take quantity, so it has posibility that there are more to be fetched.
            const lastFetchedCursor = shorts[shorts.length - 1].id

            // Check if there is next page
            const nextQuery = await prisma.publish.findMany({
              where: {
                AND: [
                  {
                    kind: {
                      equals: "Short",
                    },
                  },
                  {
                    visibility: {
                      equals: "public",
                    },
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
                count,
              },
              edges: shorts.map((short) => ({
                cursor: short.id,
                node: short,
              })),
            }
          } else {
            return {
              pageInfo: {
                endCursor: null,
                hasNextPage: false,
                count,
              },
              edges: shorts.map((short) => ({
                cursor: short.id,
                node: short,
              })),
            }
          }
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * Get a short
     * Also fetch some shorts for use to easily display on the short page
     */
    t.field("getShort", {
      type: "Publish",
      args: { input: nonNull("GetShortInput") },
      resolve: async (_parent, { input }, { prisma }) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")

          const { publishId } = input
          if (!publishId) throwError(badInputErrMessage, "BAD_USER_INPUT")

          const publish = await prisma.publish.findUnique({
            where: {
              id: publishId,
            },
          })

          if (!publish) return null

          return publish
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * Fetch blog posts
     */
    t.field("fetchBlogs", {
      type: "FetchPublishesResponse",
      args: { input: nonNull("FetchPublishesInput") },
      async resolve(_parent, { input }, { prisma }) {
        try {
          const { cursor, requestorId, orderBy } = input

          let blogs: PublishType[] = []

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

          const requestor = requestorId
            ? await prisma.station.findUnique({
                where: {
                  id: requestorId,
                },
              })
            : null

          if (!cursor) {
            blogs = await prisma.publish.findMany({
              where: {
                OR:
                  orderBy || !requestor
                    ? undefined
                    : [
                        {
                          primaryCategory: {
                            in: requestor.readPreferences,
                          },
                        },
                        {
                          secondaryCategory: {
                            in: requestor.readPreferences,
                          },
                        },
                      ],
                AND: [
                  {
                    visibility: {
                      equals: "public",
                    },
                  },
                  {
                    kind: {
                      equals: "Blog",
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
              orderBy:
                orderBy === "popular"
                  ? [
                      {
                        views: "desc",
                      },
                      {
                        createdAt: "desc",
                      },
                    ]
                  : {
                      createdAt: "desc",
                    },
            })
          } else {
            // Query preferred categories first
            blogs = await prisma.publish.findMany({
              where: {
                OR:
                  orderBy || !requestor
                    ? undefined
                    : [
                        {
                          primaryCategory: {
                            in: requestor.readPreferences,
                          },
                        },
                        {
                          secondaryCategory: {
                            in: requestor.readPreferences,
                          },
                        },
                      ],
                AND: [
                  {
                    visibility: {
                      equals: "public",
                    },
                  },
                  {
                    kind: {
                      equals: "Blog",
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
                id: cursor,
              },
              skip: 1, // Skip the cursor
              orderBy:
                orderBy === "popular"
                  ? [
                      {
                        views: "desc",
                      },
                      {
                        createdAt: "desc",
                      },
                    ]
                  : {
                      createdAt: "desc",
                    },
            })
          }

          if (blogs.length === FETCH_QTY) {
            // Fetch result is equal to take quantity, so it has posibility that there are more to be fetched.
            const lastFetchedCursor = blogs[blogs.length - 1].id

            // Check if there is next page
            // Query all
            let nextQuery = await prisma.publish.findMany({
              where: {
                OR:
                  orderBy || !requestor
                    ? undefined
                    : [
                        {
                          primaryCategory: {
                            in: requestor.readPreferences,
                          },
                        },
                        {
                          secondaryCategory: {
                            in: requestor.readPreferences,
                          },
                        },
                        {
                          kind: {
                            equals: "Blog",
                          },
                        },
                      ],
                AND: [
                  {
                    visibility: {
                      equals: "public",
                    },
                  },
                  {
                    kind: {
                      equals: "Blog",
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
              orderBy:
                orderBy === "popular"
                  ? [
                      {
                        views: "desc",
                      },
                      {
                        createdAt: "desc",
                      },
                    ]
                  : {
                      createdAt: "desc",
                    },
            })

            return {
              pageInfo: {
                endCursor: lastFetchedCursor,
                hasNextPage: nextQuery.length > 0,
              },
              edges: blogs.map((pub) => ({
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
              edges: blogs.map((blog) => ({
                cursor: blog.id,
                node: blog,
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

export const CreateDraftVideoInput = inputObjectType({
  name: "CreateDraftVideoInput",
  definition(t) {
    t.nonNull.string("creatorId") // Creator station id
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("filename")
  },
})

export const CreateDraftVideoResult = objectType({
  name: "CreateDraftVideoResult",
  definition(t) {
    t.nonNull.string("id") // Publish id
    t.string("filename") // Uploaded file name
  },
})

export const CreateDraftBlogInput = inputObjectType({
  name: "CreateDraftBlogInput",
  definition(t) {
    t.nonNull.string("creatorId") // Creator station id
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
  },
})

export const CreateDraftBlogResult = objectType({
  name: "CreateDraftBlogResult",
  definition(t) {
    t.nonNull.string("id") // Publish id
  },
})

export const UpdateVideoInput = inputObjectType({
  name: "UpdateVideoInput",
  definition(t) {
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("creatorId")
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
    t.string("tags")
    t.field("kind", { type: "PublishKind" })
    t.field("visibility", { type: "Visibility" })
  },
})

export const UpdateBlogInput = inputObjectType({
  name: "UpdateBlogInput",
  definition(t) {
    t.nonNull.string("creatorId") // Creator station id
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("publishId") // A publish id of the blog
    t.string("title")
    t.string("imageUrl") // A url of the cover image
    t.string("imageRef") // A ref to storage of the cover image
    t.string("filename") // A filename of the cover image
    t.field("primaryCategory", { type: "Category" })
    t.field("secondaryCategory", { type: "Category" })
    t.string("tags")
    t.field("content", { type: "Json" })
    t.string("htmlContent") // A string used to display the content
    t.string("preview") // Use this string to calculate estimated reading time
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

export const DeletePublishInput = inputObjectType({
  name: "DeletePublishInput",
  definition(t) {
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("creatorId")
    t.nonNull.string("publishId")
  },
})

export const PublishMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createDraftVideo", {
      type: "CreateDraftVideoResult",
      args: { input: nonNull("CreateDraftVideoInput") },
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

    t.field("createDraftBlog", {
      type: "CreateDraftBlogResult",
      args: { input: nonNull("CreateDraftBlogInput") },
      resolve: async (
        _parent,
        { input },
        { prisma, dataSources, signature }
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
            signature,
          })

          // Create a draft publish
          const draft = await prisma.publish.create({
            data: {
              creatorId,
              kind: "Blog",
              thumbSource: "custom",
            },
          })

          return { id: draft.id }
        } catch (error) {
          throw error
        }
      },
    })

    t.field("updateVideo", {
      type: "Publish",
      args: { input: nonNull("UpdateVideoInput") },
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
            creatorId,
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
            tags,
            kind,
            visibility,
          } = input
          if (!owner || !accountId || !creatorId || !publishId)
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
          if (publish?.creatorId !== creatorId)
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
              tags: tags || publish?.tags,
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

    t.field("updateBlog", {
      type: "WriteResult",
      args: { input: nonNull("UpdateBlogInput") },
      resolve: async (
        _parent,
        { input },
        { prisma, dataSources, signature }
      ) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const {
            creatorId,
            owner,
            accountId,
            imageUrl,
            imageRef,
            filename,
            primaryCategory,
            secondaryCategory,
            visibility,
            title,
            tags,
            content,
            htmlContent,
            preview,
            publishId,
          } = input

          if (!creatorId || !owner || !accountId || !publishId)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Validate authentication/authorization
          await validateAuthenticity({
            accountId,
            owner,
            dataSources,
            prisma,
            signature,
          })

          // Find the publish
          const publish = await prisma.publish.findUnique({
            where: {
              id: publishId,
            },
            include: {
              creator: true,
            },
          })
          if (!publish) throwError(notFoundErrMessage, "NOT_FOUND")

          // Check authorization
          if (publish?.creatorId !== creatorId)
            throwError(unauthorizedErrMessage, "UN_AUTHORIZED")

          // Find the blog
          const blog = await prisma.blog.findUnique({
            where: {
              publishId,
            },
          })

          const readingTime = preview
            ? `${calucateReadingTime(preview)} min read`
            : null
          const excerpt = preview ? getPostExcerpt(preview) : null

          if (!blog) {
            // If no blog found, create a new blog
            // If it's a published blog, all required data must be completed
            if (visibility === "public") {
              if ((!title && !publish?.title) || !content || !htmlContent)
                throwError(badRequestErrMessage, "BAD_REQUEST")
            }

            await prisma.blog.create({
              data: {
                publishId,
                content: content || {},
                readingTime,
                excerpt,
                htmlContent,
              },
            })
          } else {
            // Update the blog

            // If it's a published blog, all required data must be completed
            if (visibility === "public") {
              if (
                (!title && !publish?.title) ||
                (!htmlContent && !blog.htmlContent) ||
                (!content && !blog.content)
              )
                throwError(badRequestErrMessage, "BAD_REQUEST")
            }

            if (content || htmlContent || preview) {
              await prisma.blog.update({
                where: {
                  publishId,
                },
                data: {
                  content,
                  readingTime,
                  excerpt,
                  htmlContent,
                },
              })
            }
          }

          // Update the publish
          if (
            title ||
            imageUrl ||
            imageRef ||
            filename ||
            primaryCategory ||
            secondaryCategory ||
            tags ||
            visibility
          ) {
            await prisma.publish.update({
              where: {
                id: publishId,
              },
              data: {
                title: title || publish?.title,
                thumbnail: imageUrl ?? publish?.thumbnail,
                thumbnailRef: imageRef ?? publish?.thumbnailRef,
                filename: filename ?? publish?.filename,
                tags: tags || publish?.tags,
                visibility: visibility || publish?.visibility,
                primaryCategory: primaryCategory || publish?.primaryCategory,
                secondaryCategory:
                  secondaryCategory || publish?.secondaryCategory,
              },
            })
          }

          return { status: "Ok" }
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

    /**
     * Count view
     */
    t.field("countViews", {
      type: "WriteResult",
      args: { publishId: nonNull(stringArg()) },
      resolve: async (_parent, { publishId }, { prisma }) => {
        try {
          if (!publishId) throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Find the publish
          const publish = await prisma.publish.findUnique({
            where: {
              id: publishId,
            },
          })
          if (!publish) throwError(notFoundErrMessage, "NOT_FOUND")

          await prisma.publish.update({
            where: {
              id: publishId,
            },
            data: {
              views: (publish?.views || 0) + 1,
            },
          })

          return { status: "Ok" }
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * Delete a video
     */
    t.field("deletePublish", {
      type: "WriteResult",
      args: { input: nonNull("DeletePublishInput") },
      resolve: async (
        _parent,
        { input },
        { dataSources, prisma, signature }
      ) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { owner, accountId, creatorId, publishId } = input
          if (!owner || !accountId || !creatorId || !publishId)
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

          // Check authorization
          const creator = await prisma.station.findUnique({
            where: {
              id: creatorId,
            },
          })
          if (!creator) throwError(unauthorizedErrMessage, "UN_AUTHORIZED")
          if (publish?.creatorId !== creatorId)
            throwError(unauthorizedErrMessage, "UN_AUTHORIZED")

          // Call the Upload Service to delete the publish's files without waiting.
          dataSources.uploadAPI.deleteFiles(
            `publishes/${creator?.name}/${publishId}/`
          )

          // Update the publish in the database so frontends can update their UIs
          await prisma.publish.update({
            where: {
              id: publishId,
            },
            data: {
              deleting: true,
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
