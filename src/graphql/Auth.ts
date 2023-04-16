import { extendType, nonNull, objectType, stringArg } from "nexus"

import { throwError } from "./Error"
import { isAuthorizedRequestor } from "../lib"

export const AuthUser = objectType({
  name: "AuthUser",
  definition(t) {
    t.nonNull.string("uid")
  },
})

export const AuthMutation = extendType({
  type: "Mutation",
  definition(t) {
    /**
     * A function to create a Firebase Auth user for users who connect the app with their own wallet  ("WALLET" typed account).
     * @dev The user must connected to their wallet before calling this function to ensure they are authenticated.
     * @dev Must be only called from the `DiiR` UIs.
     */
    t.field("createUser", {
      type: "AuthUser",
      args: { address: nonNull(stringArg()) },
      async resolve(_parent, { address }, { dataSources, apiKey }) {
        try {
          if (!apiKey || !isAuthorizedRequestor(apiKey))
            throwError("Unauthorized", "UN_AUTHORIZED")

          const result = await dataSources.walletAPI.createAuthUser(address)

          return { uid: result?.user?.uid }
        } catch (error) {
          throw error
        }
      },
    })
  },
})
