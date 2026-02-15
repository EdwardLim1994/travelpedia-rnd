import {
  PostServiceClient,
  CreatePostRequest,
  DeletePostRequest,
} from "@travelpedia/post-service/generated/proto";
import { KafkaClient } from "@travelpedia/common/client";

export class PostService {
  constructor(
    private postClient: PostServiceClient,
    private kafkaClient: KafkaClient,
  ) {}

  public async createPost(request: CreatePostRequest): Promise<any> {
    try {
      const createPostCalling = async () =>
        new Promise((resolve, reject) => {
          this.postClient.createPost(request, (err, response) => {
            if (err) {
              console.error("Error calling PostService:", err);
              reject(err);
            } else {
              console.log("Received response from PostService:", response);
              resolve(response);
            }
          });
        });
      const res = await createPostCalling();
      return res;
    } catch (error) {}
  }

  public async deletePost(
    request: DeletePostRequest,
    isAsync?: boolean,
  ): Promise<void> {
    try {
      if (isAsync) {
        const binary = DeletePostRequest.encode(request).finish();
        await this.kafkaClient.produce(binary, "delete-post");
        return;
      }

      const deletePostCalling = async () =>
        new Promise((resolve, reject) => {
          this.postClient.deletePost(request, (err, response) => {
            if (err) {
              console.error("Error calling PostService:", err);
              reject(err);
            } else {
              console.log("Received response from PostService:", response);
              resolve(response);
            }
          });
        });

      await deletePostCalling();
      return;
    } catch (error) {}
  }
}
