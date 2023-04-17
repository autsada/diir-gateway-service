import { objectType, extendType, nonNull, inputObjectType } from "nexus"

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
    t.nonNull.string("senderId")
    t.nonNull.string("from")
    t.nonNull.string("publishId")
    t.nonNull.string("receiverId")
    t.nonNull.string("to")
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

/**
 * An input type for `createTip` mutation
 */
export const CreateTipInput = inputObjectType({
  name: "CreateTipInput",
  definition(t) {
    t.nonNull.string("senderId")
    t.nonNull.string("from")
    t.nonNull.string("publishId")
    t.nonNull.string("receiverId")
    t.nonNull.string("to")
    t.nonNull.string("amount")
    t.nonNull.string("fee")
  },
})

export const TipMutation = extendType({
  type: "Mutation",
  definition(t) {
    // For `WALLET` accounts only
    // When a wallet account successfully sent tips on the frontend, call this mutation to create a tip in the database
    t.field("createTip", {
      type: "Tip",
      args: { input: nonNull("CreateTipInput") },
      resolve: async (_parent, { input }, { dataSources, prisma }) => {
        try {
          // Verify if user is authenticated
          await dataSources.walletAPI.verifyUser()

          // Validate input
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { senderId, from, publishId, receiverId, to, amount, fee } =
            input
          if (
            !senderId ||
            !from ||
            !publishId ||
            !receiverId ||
            !to ||
            !amount ||
            !fee
          )
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Create a tip in the database
          const tip = await prisma.tip.create({
            data: {
              senderId,
              from: from.toLowerCase(),
              publishId,
              receiverId,
              to: to.toLowerCase(),
              amount,
              fee,
            },
          })

          return tip
        } catch (error) {
          throw error
        }
      },
    })
  },
})
