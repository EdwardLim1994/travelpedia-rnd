import { DependencyContainer as AbstractDependencyContainer } from "@travelpedia/common/util";

export class DependencyContainer extends AbstractDependencyContainer {
  private static instance: DependencyContainer;

  private constructor() {
    super();
  }

  public static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }
}
