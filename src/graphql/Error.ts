import { GraphQLError } from "graphql"

export type ErrorCode = "BAD_USER_INPUT"

export const badInputErrMessage = "*** Bad Input Error ***"

export function throwError(message: string, code: ErrorCode) {
  throw new GraphQLError(message, {
    extensions: {
      code,
    },
  })
}
