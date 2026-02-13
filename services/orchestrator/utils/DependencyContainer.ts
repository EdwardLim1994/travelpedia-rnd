export class DependencyContainer {
  private dependencies: Map<string, any> = new Map<string, any>();
  private static instance: DependencyContainer | null = null;

  private constructor() {}

  public static getInstance(): DependencyContainer {
    if (DependencyContainer.instance === null) {
      DependencyContainer.instance = new DependencyContainer();
    }

    return DependencyContainer.instance;
  }

  public register<T>(key: string, instance: T): this {
    this.dependencies.set(key, instance);
    return this;
  }

  public resolve<T>(key: string): T {
    const instance = this.dependencies.get(key);

    if (!instance) {
      throw new Error(`Dependency with key "${key}" not found.`);
    }

    return instance;
  }
}
