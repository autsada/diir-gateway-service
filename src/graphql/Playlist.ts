import { extendType, inputObjectType, nonNull, objectType } from "nexus"
import {
  Playlist as PlaylistModel,
  PlaylistItem as PlaylistItemModel,
} from "nexus-prisma"
import type { Playlist as PlaylistType } from "@prisma/client"

import { validateAuthenticity } from "../lib"
import { throwError, badInputErrMessage } from "./Error"

/**
 * The PlaylistItem type that map to the database model
 */
export const PlaylistItem = objectType({
  name: PlaylistItemModel.$name,
  definition(t) {
    t.field(PlaylistItemModel.id)
    t.field(PlaylistItemModel.createdAt)
    t.field(PlaylistItemModel.playlistId)
    t.field(PlaylistItemModel.playlist)
    t.field(PlaylistItemModel.publishId)
    t.field(PlaylistItemModel.publish)
  },
})

/**
 * The Playlist type that map to the database model
 */
export const Playlist = objectType({
  name: PlaylistModel.$name,
  definition(t) {
    t.field(PlaylistModel.id)
    t.field(PlaylistModel.createdAt)
    t.field(PlaylistModel.name)
    t.field(PlaylistModel.ownerId)
    t.field(PlaylistModel.owner)
    t.field(PlaylistModel.items)
  },
})

export const FetchMyPlaylistsInput = inputObjectType({
  name: "FetchMyPlaylistsInput",
  definition(t) {
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("stationId")
    t.string("cursor")
  },
})

export const CheckPublishPlaylistsInput = inputObjectType({
  name: "CheckPublishPlaylistsInput",
  definition(t) {
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("stationId")
    t.nonNull.string("publishId")
  },
})

export const PlaylistEdge = objectType({
  name: "PlaylistEdge",
  definition(t) {
    t.string("cursor")
    t.field("node", {
      type: "Playlist",
    })
  },
})

export const FetchPlaylistsResponse = objectType({
  name: "FetchPlaylistsResponse",
  definition(t) {
    t.nonNull.field("pageInfo", { type: "PageInfo" })
    t.nonNull.list.nonNull.field("edges", { type: "PlaylistEdge" })
  },
})

export const CheckPublishPlaylistsResponse = objectType({
  name: "CheckPublishPlaylistsResponse",
  definition(t) {
    // And array of playlists that the publish is in
    t.nonNull.list.nonNull.field("items", { type: "PlaylistItem" })
    // A boolean to indicate of the publish is in Watch later playlist
    t.nonNull.boolean("isInWatchLater")
    t.nonNull.string("publishId")
  },
})

export const PlaylistQuery = extendType({
  type: "Query",
  definition(t) {
    /**
     * Fetch user's playlists
     */
    t.field("fetchMyPlaylists", {
      type: "FetchPlaylistsResponse",
      args: { input: nonNull("FetchMyPlaylistsInput") },
      resolve: async (_, { input }, { dataSources, prisma, signature }) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { owner, accountId, stationId, cursor } = input
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

          // Query publises by creator id
          let playlists: PlaylistType[] = []

          if (!cursor) {
            // A. First query
            playlists = await prisma.playlist.findMany({
              where: {
                ownerId: stationId,
              },
              take: 100, // Take 100 rows for the first query
              orderBy: {
                createdAt: "desc",
              },
            })
          } else {
            // B. Consecutive queries
            playlists = await prisma.playlist.findMany({
              where: {
                ownerId: stationId,
              },
              take: 100,
              cursor: {
                id: cursor,
              },
              skip: 1, // Skip cursor
              orderBy: {
                createdAt: "desc",
              },
            })
          }

          if (playlists.length === 100) {
            // Fetch result is equal to take quantity, so it has posibility that there are more to be fetched.
            const lastFetchedCursor = playlists[playlists.length - 1].id

            // Check if there is next page
            const nextQuery = await prisma.playlist.findMany({
              where: {
                ownerId: stationId,
              },
              take: 100,
              cursor: {
                id: lastFetchedCursor,
              },
              skip: 1, // Skip cursor
              orderBy: {
                createdAt: "desc",
              },
            })

            return {
              pageInfo: {
                endCursor: lastFetchedCursor,
                hasNextPage: nextQuery.length > 0,
              },
              edges: playlists.map((playlist) => ({
                cursor: playlist.id,
                node: playlist,
              })),
            }
          } else {
            // No more items to be fetched
            return {
              pageInfo: {
                endCursor: null,
                hasNextPage: false,
              },
              edges: playlists.map((playlist) => ({
                cursor: playlist.id,
                node: playlist,
              })),
            }
          }
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * Check if a publish is in any playlists
     */
    t.field("checkPublishPlaylists", {
      type: "CheckPublishPlaylistsResponse",
      args: { input: nonNull("CheckPublishPlaylistsInput") },
      resolve: async (_, { input }, { dataSources, prisma, signature }) => {
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

          // Get playlist item(s)
          const items = await prisma.playlistItem.findMany({
            where: {
              AND: [
                {
                  ownerId: stationId,
                },
                {
                  publishId,
                },
              ],
            },
          })

          // Check if the item is in watch later
          const watchLaterItems = await prisma.watchLater.findMany({
            where: {
              AND: [
                {
                  stationId,
                },
                {
                  publishId,
                },
              ],
            },
          })

          return {
            items,
            isInWatchLater: watchLaterItems.length > 0,
            publishId,
          }
        } catch (error) {
          throw error
        }
      },
    })
  },
})

/**
 * A new playlist will be created when user wants to add a publish to a new playlist.
 */
export const CreatePlayListInput = inputObjectType({
  name: "CreatePlayListInput",
  definition(t) {
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("stationId")
    t.nonNull.string("name")
    t.nonNull.string("publishId")
  },
})

/**
 * Add to existing playlist input
 */
export const AddToPlaylistInput = inputObjectType({
  name: "AddToPlaylistInput",
  definition(t) {
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("stationId")
    t.nonNull.string("playlistId")
    t.nonNull.string("publishId")
  },
})

/**
 * Update playlists
 */
export const PlaylistItemStatus = inputObjectType({
  name: "PlaylistItemStatus",
  definition(t) {
    t.nonNull.boolean("isInPlaylist")
    t.nonNull.string("playlistId")
  },
})
export const UpdatePlaylistsInput = inputObjectType({
  name: "UpdatePlaylistsInput",
  definition(t) {
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("stationId")
    t.nonNull.string("publishId")
    t.nonNull.list.nonNull.field("playlists", { type: "PlaylistItemStatus" })
  },
})

export const PlaylistMutation = extendType({
  type: "Mutation",
  definition(t) {
    /**
     * Add a publish to new playlist
     */
    t.field("addToNewPlaylist", {
      type: "WriteResult",
      args: { input: nonNull("CreatePlayListInput") },
      resolve: async (_, { input }, { dataSources, prisma, signature }) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { owner, accountId, stationId, name, publishId } = input
          if (!owner || !accountId || !stationId || !name || !publishId)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Validate authentication/authorization
          await validateAuthenticity({
            accountId,
            owner,
            dataSources,
            prisma,
            signature,
          })

          // Create new playlist
          const playlist = await prisma.playlist.create({
            data: {
              name,
              ownerId: stationId,
            },
          })

          // 2. A add a publish to the created playlist
          await prisma.playlistItem.create({
            data: {
              ownerId: stationId,
              playlistId: playlist.id,
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
     * Add a publish to existing playlist
     */
    t.field("addToPlaylist", {
      type: "WriteResult",
      args: { input: nonNull("AddToPlaylistInput") },
      resolve: async (_, { input }, { dataSources, prisma, signature }) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { owner, accountId, stationId, playlistId, publishId } = input
          if (!owner || !accountId || !stationId || !playlistId || !publishId)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Validate authentication/authorization
          await validateAuthenticity({
            accountId,
            owner,
            dataSources,
            prisma,
            signature,
          })

          // Add a publish to the playlist if not exist
          await prisma.playlistItem.upsert({
            where: {
              identifier: {
                playlistId,
                publishId,
              },
            },
            create: {
              ownerId: stationId,
              playlistId: playlistId,
              publishId,
            },
            update: {},
          })

          return { status: "Ok" }
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * Update many playlists
     */
    t.field("updatePlaylists", {
      type: "WriteResult",
      args: { input: nonNull("UpdatePlaylistsInput") },
      resolve: async (_, { input }, { dataSources, prisma, signature }) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { owner, accountId, stationId, publishId, playlists } = input
          if (!owner || !accountId || !stationId || !publishId)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          if (playlists.length === 0)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Validate authentication/authorization
          await validateAuthenticity({
            accountId,
            owner,
            dataSources,
            prisma,
            signature,
          })

          // Separate add and remove
          const addItems = playlists.filter((pl) => pl.isInPlaylist)
          const removeItems = playlists.filter((pl) => !pl.isInPlaylist)

          // Add items
          await prisma.playlistItem.createMany({
            data: addItems.map((item) => ({
              ownerId: stationId,
              playlistId: item.playlistId,
              publishId,
            })),
          })

          await Promise.all(
            removeItems.map((item) =>
              prisma.playlistItem.delete({
                where: {
                  identifier: {
                    playlistId: item.playlistId,
                    publishId,
                  },
                },
              })
            )
          )

          return { status: "Ok" }
        } catch (error) {
          throw error
        }
      },
    })
  },
})
