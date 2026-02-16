import type { CreatePostRequest } from "@travelpedia/post-service/generated/proto";
import type { UseCaseReversibleOperation } from "../interfaces";
import type { PostService } from "../services";
import { DependencyContainer } from "../utils";
import { UseCaseExecutionFailedException } from "../exceptions";

export class CreatePostUseCase implements UseCaseReversibleOperation {
  public constructor(
    private request: CreatePostRequest,
    private readonly postService: PostService,
  ) {}

  public static init(request: CreatePostRequest): UseCaseReversibleOperation {
    const container = DependencyContainer.getInstance();
    const postService = container.resolve<PostService>("PostService");
    return new CreatePostUseCase(request, postService);
  }

  public async execute(): Promise<void> {
    try {
      if (!this.request) {
        throw new UseCaseExecutionFailedException(
          "Request is not set for CreatePostUseCase",
        );
      }

      await this.postService.createPost(this.request);
    } catch (error) {
      console.error("Failed to execute CreatePostUseCase:", error);
      throw new UseCaseExecutionFailedException("Failed to create post", {
        cause: error,
      });
    }
  }

  public async rollback(): Promise<void> {
    try {
      if (!this.request) {
        throw new UseCaseExecutionFailedException(
          "Request is not set for CreatePostUseCase",
        );
      }
    } catch (error) {
      console.error("Failed to rollback CreatePostUseCase:", error);
      throw new UseCaseExecutionFailedException(
        "Failed to rollback create post",
        {
          cause: error,
        },
      );
    }
  }
}
