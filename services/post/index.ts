import { Elysia } from "elysia";
import { yoga } from "@elysiajs/graphql-yoga";

import * as grpc from "@grpc/grpc-js";
import {
  PostServiceService,
  ListPostsResponse,
  ListPostRequest,
  PostServiceClient,
  type PostServiceServer,
} from "./proto/generated/post";

const server = new grpc.Server();

const postServer: PostServiceServer = {
  createPost: (call, callback) => {},
  deletePost: (call, callback) => {},
  getPost: (call, callback) => {},
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
  () => {
    console.log("gRPC server running in port 50080");
    const client = new PostServiceClient(
      "localhost:50080",
      grpc.credentials.createInsecure(),
    );
    new Elysia()
      .use(
        yoga({
          typeDefs: /*Graphql*/ `
            type Query{
              hello: String!
            }`,
          resolvers: {
            Query: {
              hello: () => {
                const call = new Promise((resolve, reject) => {
                  const listPostRequest: ListPostRequest = {};
                  client.listPosts(listPostRequest, (err, res) => {
                    if (err) {
                      reject(err);
                    } else {
                      resolve(res);
                    }
                  });
                });

                return call
                  .then((res: ListPostsResponse) => {
                    return res.posts[0]?.title;
                  })
                  .catch((err) => {
                    console.error(err);
                  });
              },
            },
          },
        }),
      )
      .listen(4080, () => {
        console.log("GraphQL server running in port 4080");
      });
  },
);
