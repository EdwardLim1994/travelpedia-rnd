import {
  PostServiceClient,
  CreatePostRequest,
} from "@travelpedia/post-service/generated/proto";
import {
  OrchestratorServiceService,
  type OrchestratorServiceServer,
} from "./generated/proto/orchestrator";
import { DependencyContainer, KafkaClient } from "./utils";
import { PostService } from "./services";
import * as grpc from "@grpc/grpc-js";
import { Test2UseCase, TestUseCase } from "./usecases";
import { UseCasesBuilder } from "./utils/UseCasesBuilder";
import { UseCaseRunner } from "./utils/UseCaseRunner";

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
    const tasks = UseCasesBuilder.init()
      .prepare("Test 1", new TestUseCase())
      .prepare("Test 2", new Test2UseCase())
      .build();

    await UseCaseRunner.run(tasks);
  } catch (error) {
    console.error("Error running use cases:", error);
  }

  // try {
  //   await startGrpcServer();
  // } catch (err) {
  //   console.error("Failed to start gRPC server:", err);
  // }
})();
