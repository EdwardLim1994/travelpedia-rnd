import type { UseCaseReversibleOperation } from "@travelpedia/libs/interfaces";
import type { PostService } from "../services";
import { DependencyContainer } from "../utils";

export class TestUseCase implements UseCaseReversibleOperation {
  private postService: PostService;
  constructor() {
    this.postService = DependencyContainer.getInstance().resolve("PostService");
  }

  public async execute(): Promise<void> {
    console.log("Post service");
    console.log(this.postService);
  }

  public async rollback(): Promise<void> {}
}
