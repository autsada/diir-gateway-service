import { objectType, extendType, nonNull, list, intArg } from "nexus"

import { throwError, badInputErrMessage } from "./Error"
import { NexusGenObjects } from "../typegen"

/**
 * A Fee type that map to the prisma LikeFee model.
 */
export const Tip = objectType({
  name: "Tip",
  definition(t) {
    t.nonNull.string("id")
    t.nonNull.field("createdAt", { type: "DateTime" })
    t.nonNull.string("publishId")
    t.nonNull.string("senderId")
    t.nonNull.string("receiverId")
    t.nonNull.string("amount")
    t.nonNull.string("fee")

    /**
     * A publish that the tip belongs to.
     */
    t.nullable.field("publish", {
      type: "Publish",
      resolve: (parent, _, { prisma }) => {
        return prisma.tip
          .findUnique({
            where: {
              id: parent.id,
            },
          })
          .publish()
      },
    })

    /**
     * Sender
     */
    t.field("sender", {
      type: "Station",
      resolve: (parent, _, { prisma }) => {
        return prisma.tip
          .findUnique({
            where: {
              id: parent.id,
            },
          })
          .sender() as unknown as NexusGenObjects["Station"]
      },
    })

    /**
     * Receiver
     */
    t.field("receiver", {
      type: "Station",
      resolve: (parent, _, { prisma }) => {
        return prisma.tip
          .findUnique({
            where: {
              id: parent.id,
            },
          })
          .receiver() as unknown as NexusGenObjects["Station"]
      },
    })
  },
})
