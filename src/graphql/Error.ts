import { GraphQLError } from "graphql"

export type BadInputErrorCode = "BAD_USER_INPUT"
export type NotFoundErrorCode = "NOT_FOUND"
export type AuthorizedErrorCode = "UN_AUTHORIZED"
export type AuthenticatedErrorCode = "UN_AUTHENTICATED"

export const badInputErrMessage = "*** Bad Input Error ***"
export const notFoundErrMessage = "*** Not Found ***"
export const unauthenticatedErrMessage = "*** Unauthenticated ***"
export const unauthorizedErrMessage = "*** Unauthorized ***"

export function throwError(
  message: string,
  code:
    | AuthenticatedErrorCode
    | AuthorizedErrorCode
    | BadInputErrorCode
    | NotFoundErrorCode
) {
  throw new GraphQLError(message, {
    extensions: {
      code,
    },
  })
}
