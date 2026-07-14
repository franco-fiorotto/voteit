import { UniqueEntityID } from './UniqueEntityID';

/**
 * Base class for domain entities: identified by a UniqueEntityID and compared
 * by identity (not by attribute values).
 */
export abstract class Entity<T> {
  protected readonly _id: UniqueEntityID;
  protected readonly props: T;

  constructor(props: T, id?: UniqueEntityID) {
    this._id = id ?? new UniqueEntityID();
    this.props = props;
  }

  public get id(): UniqueEntityID {
    return this._id;
  }

  public equals(entity?: Entity<T>): boolean {
    if (entity === null || entity === undefined) return false;
    if (this === entity) return true;
    return this._id.equals(entity._id);
  }
}
