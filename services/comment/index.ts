import * as grpc from "@grpc/grpc-js";
import {
  CommentServiceService,
  ListCommentsRequest,
  ListCommentsResponse,
  CommentServiceClient,
  type CommentServiceServer,
} from "./generated/proto/comment";

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { gql } from "graphql-tag";
import type { Resolvers, Comment } from "./generated/graphql/comment";

const graphqlSchema = await Bun.file("./graphql/comment.graphql").text();

async function startGrpcServer() {
  const server = new grpc.Server();

  const commentServer: CommentServiceServer = {
    createComment: (call, callback) => {},
    deleteComment: (call, callback) => {},
    getComment: (call, callback) => {},
    updateComment: (call, callback) => {},
    listComments: (call, callback) => {
      return [
        {
          id: "123",
          content: "This is a sample comment",
        },
      ];
    },
  };

  server.addService(CommentServiceService, commentServer);

  server.bindAsync(
    "0.0.0.:50081",
    grpc.ServerCredentials.createInsecure(),
    async () => {
      console.log("Comment GRPC server running in post 50081");
    },
  );
}

async function startGraphqlServer() {
  const client = new CommentServiceClient(
    "localhost:50081",
    grpc.credentials.createInsecure(),
  );

  const typeDefs = gql`
    ${graphqlSchema}
  `;

  const resolvers: Resolvers = {
    Query: {
      comments: async () => {
        const calling = async () =>
          new Promise<Comment[] | null>((resolve, reject) => {
            console.log("Calling gRPC listComments...");

            client.listComments({}, (error, response) => {
              if (error) {
                console.error("gRPC listComments error:", error);
                reject(error);
                return;
              } else {
                console.log(response);
                resolve(response.comments);
              }
            });
          });
        const comments = await calling();
        return comments;
      },
    },
  };

  const graphqlServer = new ApolloServer({
    schema: buildSubgraphSchema({
      typeDefs,
      resolvers,
    }),
  });

  const { url } = await startStandaloneServer(graphqlServer, {
    listen: {
      port: 4081,
    },
  });

  console.log(`GraphQL server running at: ${url}`);
}

(async () => {
  try {
    await startGrpcServer();
    await startGraphqlServer();
  } catch (error) {
    console.error("Error starting servers:", error);
  }
})();
