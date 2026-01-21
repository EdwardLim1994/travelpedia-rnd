import { loadGrpcSubgraph } from "@omnigraph/grpc"
import { defineConfig } from "@graphql-mesh/compose-cli"

export const composeConfig = defineConfig({
    subgraphs: [
        {
            sourceHandler: loadGrpcSubgraph("post", {
                endpoint: "127.0.0.1:50051",
                source: "./proto/post.proto",
                selectQueryOrMutationField: [
                    {
                        fieldName: "*Post",
                        type: "Mutation"
                    },
                    {
                        fieldName: "ListPosts",
                        type: "Query"
                    }
                ],
                schemaHeaders: {
                    "Content-Type": "application/json"
                }
            })
        }
    ]
})
