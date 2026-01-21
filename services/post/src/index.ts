import { type BlogServiceServer, BlogServiceService } from "travelpedia_schema/generated/proto/post"
import { Server as GrpcServer, ServerCredentials } from "@grpc/grpc-js"


const blogServiceImpl: BlogServiceServer = {
    createPost: (call, callback) => {

    },
    getPost: (call, callback) => {

    },
    listPosts: (call, callback) => {
        callback(null,
            {
                posts: [{
                    id: "1",
                    title: "First Post",
                    content: "This is the content of the first post.",
                    authorId: "123",
                    tags: ["tag1", "tag2"],
                    createdAt: new Date(),
                    updatedAt: new Date()
                }],
                nextPageToken: ""
            },

        )
    },
    deletePost: (call, callback) => { },
    updatePost: (call, callback) => { }
}


const server = new GrpcServer();

server.addService(BlogServiceService, blogServiceImpl);

server.bindAsync("0.0.0.0:50051", ServerCredentials.createInsecure(), () => {
    console.log("Post service running on port 50051");
});
