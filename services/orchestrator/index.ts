import {
  PostServiceClient,
  CreatePostRequest,
} from "@travelpedia/post-service/generated/proto";
import {
  OrchestratorServiceService,
  type OrchestratorServiceServer,
} from "./generated/proto/orchestrator";
import { DependencyContainer } from "./utils";
import { KafkaClient } from "@travelpedia/common/client";
import { PostService } from "./services";
import * as grpc from "@grpc/grpc-js";
import { UseCaseRunner } from "./utils/";
import { CreatePostUseCase } from "./usecases/";

const postClient = new PostServiceClient(
  "localhost:50080",
  grpc.credentials.createInsecure(),
);
async function startGrpcServer() {
  const server = new grpc.Server();

  const orchestratorServer: OrchestratorServiceServer = {
    createPost: async (call, callback) => {
      try {
        const useCase = CreatePostUseCase.init();
        const req: CreatePostRequest = {
          ...call.request,
          author: "",
        };

        const res = await useCase.execute(req);

        callback(null, res);
      } catch (err) {
        callback(err as Error, null);
      }
    },
  };

  server.addService(OrchestratorServiceService, orchestratorServer);

  server.bindAsync(
    "0.0.0.0:50100",
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("Error binding gRPC server:", err);
        return;
      }
      console.log("Orchestrator Service running on port:", port);
    },
  );
}

(async () => {
  DependencyContainer.getInstance()
    .register("PostServiceClient", postClient)
    .register(
      "PostService",
      new PostService(postClient, KafkaClient.create("tester")),
    );

  try {
    await UseCaseRunner.init()
      .prepare(
        "Create Post",
        CreatePostUseCase.init({
          title: "title",
          content: "content",
          author: "author",
        }),
      )
      .run();
  } catch (error) {
    console.error("Error running use cases:", error);
  }

  // try {
  //   await startGrpcServer();
  // } catch (err) {
  //   console.error("Failed to start gRPC server:", err);
  // }
})();
