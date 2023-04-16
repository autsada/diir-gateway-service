import { GraphQLError } from "graphql"

export type BadInputErrorCode = "BAD_USER_INPUT"
export type AuthorizedErrorCode = "UN_AUTHORIZED"
export type AuthenticatedErrorCode = "UN_AUTHENTICATED"

export const badInputErrMessage = "*** Bad Input Error ***"

export function throwError(
  message: string,
  code: AuthenticatedErrorCode | AuthorizedErrorCode | BadInputErrorCode
) {
  throw new GraphQLError(message, {
    extensions: {
      code,
    },
  })
}
