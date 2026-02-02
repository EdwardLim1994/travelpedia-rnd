import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "./graphql/comment.graphql",
  generates: {
    "./generated/graphql/comment.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        useIndexSignature: true,
        contextType: "../types#CommentContextType",
      },
    },
  },
};

export default config;
