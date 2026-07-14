/**
 * Shape of a domain/application-level error surfaced by a use case.
 * Concrete errors live per-use-case (e.g. CreatePollErrors) and carry a message.
 */
export interface UseCaseError {
  message: string;
}
