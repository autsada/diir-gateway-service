import { GraphQLError } from "graphql"

export type BadInputErrorCode = "BAD_USER_INPUT"

export const badInputErrMessage = "*** Bad Input Error ***"

export function throwError(message: string, code: BadInputErrorCode) {
  throw new GraphQLError(message, {
    extensions: {
      code,
    },
  })
}
