import type {
  CreatePostRequest,
  DeletePostRequest,
  CreatePostResponse,
  Post,
} from "@travelpedia/post-service/generated/proto";
import type { UseCaseReversibleOperation } from "../interfaces";
import type { PostService } from "../services";
import { DependencyContainer } from "../utils";
import {
  UseCaseExecutionFailedException,
  UseCaseRollbackFailedException,
} from "../exceptions";

export class CreatePostUseCase implements UseCaseReversibleOperation {
  private createdPost: Post | undefined;
  public constructor(
    private readonly request: CreatePostRequest,
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

      const response: CreatePostResponse = await this.postService.createPost(
        this.request,
      );
      console.log("Post created successfully:", response);
      this.createdPost = response.post;
    } catch (error) {
      console.error("Failed to execute CreatePostUseCase:", error);
      throw new UseCaseExecutionFailedException("Failed to create post", {
        cause: error,
      });
    }
  }

  public async rollback(): Promise<void> {
    try {
      if (!this.createdPost) {
        throw new UseCaseRollbackFailedException(
          "Post was not created, cannot rollback CreatePostUseCase",
        );
      }

      const deletePostRequest: DeletePostRequest = {
        id: this.createdPost.id,
      };

      await this.postService.deletePost(deletePostRequest, true);
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
