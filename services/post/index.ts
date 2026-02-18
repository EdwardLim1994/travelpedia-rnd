import * as grpc from "@grpc/grpc-js";
import {
  PostServiceService,
  PostServiceClient,
  type PostServiceServer,
  DeletePostRequest,
} from "./generated/proto/post";

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { gql } from "graphql-tag";
import type { Resolvers, Post } from "./generated/graphql/post.ts";
import { CommentServiceClient } from "@travelpedia/comment-service/generated/proto/comment";
import { KafkaClient } from "@travelpedia/common/client";
import { KafkaGroupId } from "../../packages/common/constant/KafkaGroupId.ts";
import { KafkaTopicName } from "../../packages/common/constant/KafkaTopicName.ts";

const graphqlSchema = await Bun.file("./graphql/post.graphql").text();

async function startGrpcServer() {
  const server = new grpc.Server();

  const postServer: PostServiceServer = {
    createPost: (call, callback) => {},
    deletePost: (call, callback) => {
      callback(null, { success: true });
    },
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

async function startKafkaConsumer() {
  const kafkaClient = KafkaClient.create("post-service");

  await kafkaClient.consume(
    KafkaGroupId.DeletePost,
    KafkaTopicName.DeletePost,
    async (message: Uint8Array) => {
      const deletePostRequest = DeletePostRequest.decode(message);
      console.log(
        `Received delete post message for post ID: ${deletePostRequest.id}`,
      );
      // Here you would add logic to delete the post from your database
      const grpcClient = new PostServiceClient(
        "localhost:50080",
        grpc.credentials.createInsecure(),
      );

      const calling = async () =>
        new Promise((resolve, reject) => {
          grpcClient.deletePost(
            { id: deletePostRequest.id },
            (error, response) => {
              if (error) {
                console.error("Error deleting post:", error);
                reject(error);
                return;
              } else {
                console.log("Post deleted successfully");
                resolve(response);
              }
            },
          );
        });

      const result = await calling();
      console.log("Delete post result:", result);
    },
  );
}

(async () => {
  try {
    await startGrpcServer();
    await startGraphQLServer();
    await startKafkaConsumer();
  } catch (error) {
    console.error("Error starting servers:", error);
  }
})();
