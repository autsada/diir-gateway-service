declare module "http" {
  interface IncomingMessage {
    rawBody?: string
  }
}

export type Environment = "development" | "test" | "production"
