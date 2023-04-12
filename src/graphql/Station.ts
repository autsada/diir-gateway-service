import { objectType } from "nexus"

/**
 * A preview version of the Station.
 * @dev Use this type where we just need to know a station briefly and don't need to know the detail and relation of that station.
 */
export const PreviewStation = objectType({
  name: "PreviewStation",
  definition(t) {
    t.nonNull.string("id")
    t.nonNull.string("name")
    t.nonNull.string("originalName")
    t.string("image")
  },
})

/**
 * A Station type that map to the prisma Station model.
 */
export const Station = objectType({
  name: "Station",
  definition(t) {
    t.nonNull.string("id")
    t.nonNull.string("tokenId")
    t.nonNull.field("createdAt", { type: "DateTime" })
    t.field("updatedAt", { type: "DateTime" })
    t.nonNull.string("owner")
    t.nonNull.string("name")
    t.nonNull.string("originalName")
    t.string("image")
    t.string("bannerImage")
    t.nonNull.int("accountId")
  },
})
