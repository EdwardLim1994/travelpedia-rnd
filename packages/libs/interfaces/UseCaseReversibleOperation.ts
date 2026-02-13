export interface UseCaseReversibleOperation {
  execute(): Promise<void>;
  rollback(): Promise<void>;
}
