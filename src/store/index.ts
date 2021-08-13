import { RittaModule } from '@ritta/sdk/dist/module';
import { Strategy } from '@ritta/sdk/dist/auth';

class Store<T> {
  private _data: T;

  constructor(data) {
    this._data = data;
  }

  public get(): T {
    return this._data;
  }

  public set(data: T): void {
    this._data = data;
  }
}

export const StrategyStore = new Store<Set<Strategy>>(new Set());
export const ModuleStore = new Store<Set<RittaModule>>(new Set());
