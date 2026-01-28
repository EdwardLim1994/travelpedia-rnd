import { Elysia } from "elysia";
import { yoga } from "@elysiajs/graphql-yoga";

const app = new Elysia().get("/", () => ({ hello: "Bun👋" })).listen(8080);

const sidecar = new Elysia()
  .use(
    yoga({
      typeDefs: /*Graphql */ `
        type Query {
          hello: String!
        }
      `,
      resolvers: {
        Query: {
          hello: async () => {
            const res = await fetch("http://localhost:8080");

            const result = await res.json();

            return result.hello;
          },
        },
      },
    }),
  )
  .listen(4080);
