import { objectType, extendType, nonNull, inputObjectType } from "nexus"
import { Tip as TipModel } from "nexus-prisma"

import { throwError, badInputErrMessage } from "./Error"

/**
 * A Fee type that map to the prisma LikeFee model.
 */
export const Tip = objectType({
  name: TipModel.$name,
  definition(t) {
    t.field(TipModel.id)
    t.field(TipModel.createdAt)
    t.field(TipModel.senderId)
    t.field(TipModel.sender)
    t.field(TipModel.from)
    t.field(TipModel.publishId)
    t.field(TipModel.publish)
    t.field(TipModel.receiverId)
    t.field(TipModel.receiver)
    t.field(TipModel.to)
    t.field(TipModel.amount)
    t.field(TipModel.fee)
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
