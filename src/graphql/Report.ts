import {
  extendType,
  inputObjectType,
  nonNull,
  objectType,
  enumType,
} from "nexus"
import {
  Report as ReportModel,
  ReportReason as ReportReasonEnum,
} from "nexus-prisma"

import { throwError, badInputErrMessage } from "./Error"
import { validateAuthenticity } from "../lib"

/**
 * The Report type that map to the database model
 */
export const ReportReason = enumType(ReportReasonEnum)
export const Report = objectType({
  name: ReportModel.$name,
  definition(t) {
    t.field(ReportModel.id)
    t.field(ReportModel.createdAt)
    t.field(ReportModel.submittedById)
    t.field(ReportModel.submittedBy)
    t.field(ReportModel.publishId)
    t.field(ReportModel.publish)
    t.field(ReportModel.reason)
  },
})

export const ReportPublishInput = inputObjectType({
  name: "ReportPublishInput",
  definition(t) {
    t.nonNull.string("owner")
    t.nonNull.string("accountId")
    t.nonNull.string("stationId")
    t.nonNull.string("publishId") // A publish id to be reported
    t.nonNull.field("reason", { type: "ReportReason" }) // A publish id to be reported
  },
})

export const ReportPublishMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("reportPublish", {
      type: "WriteResult",
      args: { input: nonNull("ReportPublishInput") },
      resolve: async (
        parent,
        { input },
        { dataSources, signature, prisma }
      ) => {
        try {
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { owner, accountId, stationId, publishId, reason } = input
          if (!owner || !accountId || !stationId || !publishId || !reason)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Validate authentication/authorization
          await validateAuthenticity({
            accountId,
            owner,
            dataSources,
            prisma,
            signature,
          })

          // Create if not exist
          await prisma.report.upsert({
            where: {
              identifier: {
                submittedById: stationId,
                publishId,
                reason,
              },
            },
            create: {
              submittedById: stationId,
              publishId,
              reason,
            },
            update: {},
          })

          return { status: "Ok" }
        } catch (error) {
          throw error
        }
      },
    })
  },
})
