/**
 * A UseCase is a single application operation. It takes a request DTO and
 * returns a response (typically a Promise<Either<Error, Result<T>>>).
 * Dependencies (repositories, services) are injected via the constructor.
 */
export interface UseCase<IRequest, IResponse> {
  execute(request: IRequest): Promise<IResponse> | IResponse;
}
