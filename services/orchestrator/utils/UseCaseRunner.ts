import type { UseCaseReversibleOperation } from "../interfaces";

export class UseCaseRunner {
  private tasks: Map<string, UseCaseReversibleOperation> = new Map<
    string,
    UseCaseReversibleOperation
  >();

  private constructor() {}

  public static init(): UseCaseRunner {
    return new UseCaseRunner();
  }

  public prepare(name: string, useCase: UseCaseReversibleOperation): this {
    this.tasks.set(name, useCase);
    return this;
  }

  public async run(): Promise<void> {
    if (this.tasks.size === 0) {
      console.warn("No use cases to execute.");
      return;
    }

    const finishedUseCases: {
      name: string;
      useCase: UseCaseReversibleOperation;
    }[] = [];
    let isSuccessful = true;

    for (const [name, useCase] of this.tasks) {
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
