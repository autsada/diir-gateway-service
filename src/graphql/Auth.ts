import { extendType, nonNull, objectType, stringArg } from "nexus"
import { cacheTokenId } from "../client/redis"
import { throwError, badInputErrMessage } from "./Error"

export const AuthUser = objectType({
  name: "AuthUser",
  definition(t) {
    t.nonNull.string("uid")
  },
})

export const AuthMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createUser", {
      type: "AuthUser",
      args: { address: nonNull(stringArg()) },
      async resolve(_parent, { address }, { dataSources }) {
        try {
          const user = await dataSources.walletAPI.createAuthUser(address)

          return user
        } catch (error) {
          console.log("error: ", error)
          throw error
        }
      },
    })
  },
})
