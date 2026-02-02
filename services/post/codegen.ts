import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "./graphql/post.graphql",
  generates: {
    "./generated/graphql/post.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        useIndexSignature: true,
        contextType: "../types#MyContextType",
      },
    },
  },
};

export default config;
