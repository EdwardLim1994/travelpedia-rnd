import type { UseCaseReversibleOperation } from "../libs/interfaces";

export class UseCaseRunner {
  static async run(useCases: Map<string, UseCaseReversibleOperation>) {
    const finishedUseCases: {
      name: string;
      useCase: UseCaseReversibleOperation;
    }[] = [];
    let isSuccessful = true;

    for (const [name, useCase] of useCases) {
      try {
        console.log(`Executing use case: ${name}`);
        await useCase.execute();
        finishedUseCases.push({ name, useCase });
      } catch (error) {
        console.error(`Error executing use case '${name}': ${error}`);

        isSuccessful = false;
        break;
      }
    }

    if (!isSuccessful) {
      console.log("Starting rollback of executed use cases...");
      for (let i = finishedUseCases.length - 1; i >= 0; i--) {
        const c = finishedUseCases[i];
        if (c) {
          try {
            console.log(`Rolling back use case: ${c.name}`);
            await c.useCase.rollback();
          } catch (error) {
            console.error(`Error rolling back use case '${c.name}': ${error}`);
          }
        }
      }
    }
  }
}
