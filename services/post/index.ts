import * as grpc from "@grpc/grpc-js";
import {
  PostServiceService,
  PostServiceClient,
  type PostServiceServer,
} from "./generated/proto/post";

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { gql } from "graphql-tag";
import type { Resolvers, Post } from "./generated/graphql/post.ts";
import { CommentServiceClient } from "@travelpedia/comment-service/generated/proto/comment";
import type { Comment } from "@travelpedia/comment-service/generated/graphql/comment";

const graphqlSchema = await Bun.file("./graphql/post.graphql").text();

async function startGrpcServer() {
  const server = new grpc.Server();

  const postServer: PostServiceServer = {
    createPost: (call, callback) => {},
    deletePost: (call, callback) => {},
    getPost: (call, callback) => {
      callback(null, {
        id: "789",
        title: "First Post",
        content: "This is the content of the first post.",
        author: "tester",
        createdAt: new Date(),
      });
    },
    updatePost: (call, callback) => {},
    listPosts: (call, callback) => {
      callback(null, {
        posts: [
          {
            id: "1",
            title: "First Post",
            content: "This is the content of the first post.",
            author: "tester",
            createdAt: new Date(),
          },
        ],
      });
    },
  };

  server.addService(PostServiceService, postServer);

  server.bindAsync(
    "0.0.0.0:50080",
    grpc.ServerCredentials.createInsecure(),
    async () => {
      console.log("gRPC server running in port 50080");
    },
  );
}
async function startGraphQLServer() {
  const client = new PostServiceClient(
    "localhost:50080",
    grpc.credentials.createInsecure(),
  );
  const commentClient = new CommentServiceClient(
    "localhost:50081",
    grpc.credentials.createInsecure(),
  );

  const typeDefs = gql`
    ${graphqlSchema}
  `;

  const resolvers: Resolvers = {
    Post: {
      __resolveReference: async (reference) => {
        const calling = async () =>
          new Promise<Post | null>((resolve, reject) => {
            console.log("Calling gRPC getPost...");
            client.getPost({ id: reference.id }, (error, response) => {
              if (error) {
                console.error("Error fetching post:", error);
                reject(error);
                return;
              } else {
                console.log(response);

                resolve(response);
              }
            });
          });

        const post = await calling();
        return post;
      },
    },
    Query: {
      posts: async () => {
        const calling = async () =>
          new Promise<Post[] | null>((resolve, reject) => {
            console.log("Calling gRPC getPost...");
            client.listPosts({}, (error, response) => {
              if (error) {
                console.error("Error fetching posts:", error);
                reject(error);
                return;
              } else {
                console.log(response);

                resolve(response.posts);
              }
            });
          });

        const posts = await calling();
        return posts;
      },
    },
  };

  const graphqlServer = new ApolloServer({
    schema: buildSubgraphSchema({
      typeDefs,
      resolvers,
    }),
    introspection: true,
  });

  const { url } = await startStandaloneServer(graphqlServer, {
    listen: {
      port: 4080,
    },
  });

  console.log(`GraphQL server running at ${url}`);
}

(async () => {
  try {
    await startGrpcServer();
    await startGraphQLServer();
  } catch (error) {
    console.error("Error starting servers:", error);
  }
})();
