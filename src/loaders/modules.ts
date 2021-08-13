import fs from 'fs';
import logger from '../logger';
import pino from 'pino';
import ModuleNoPermission from '../errors/ModuleNoPermission';

import Ritta from '@ritta/sdk/dist/ritta';
import { RittaAuth, Strategy } from '@ritta/sdk/dist/auth';
import { Document, Model, RittaDatabase } from '@ritta/sdk/dist/database';
import { RittaRoles, Role, RolePermissions } from '@ritta/sdk/dist/roles';
import { RittaModules } from '@ritta/sdk/dist/modules';
import { Schema } from 'mongoose';
import { ModuleStore, StrategyStore } from '../store';

export default (): Promise<any> =>
  new Promise((resolve) => {
    try {
      fs.readFile('modules.json', async (err, data) => {
        if (err) throw err;
        const list = JSON.parse(data.toString());
        if (!Array.isArray(list)) {
          logger.error('Modules.json is not an array!');
          process.exit(-1);
        }
        const modulesSet = new Set(list); // Remove duplicates
        await Promise.all(
          Array.from(modulesSet).map(async (moduleName) => {
            const Module = (await import(moduleName)).default;
            if (!Module) {
              throw new Error(`${moduleName}: module not found!`);
            }
            fs.readFile(
              `node_modules/${moduleName}/package.json`,
              async (err, data) => {
                if (err) throw err;
                const meta = JSON.parse(data.toString());
                if (
                  !meta.ritta ||
                  !meta.ritta.permissions ||
                  !meta.ritta.userPermissions ||
                  !meta.ritta.dependencies ||
                  !meta.ritta.softDependencies
                ) {
                  throw new Error(
                    `${moduleName}: package.json is missing ritta !`
                  );
                }
                try {
                  new Module(
                    new RittaSdk(
                      meta.ritta.permissions,
                      meta.ritta.userPermissions,
                      meta.ritta.dependencies,
                      meta.ritta.softDependencies
                    )
                  );
                } catch (e) {
                  throw new Error(`${moduleName}: ${e.message}`);
                }
                const modules = ModuleStore.get();
                modules.add(Module);
                ModuleStore.set(modules);
                resolve(true);
              }
            );
          })
        );
        resolve(true);
      });
    } catch (error) {
      logger.error(error.message);
      process.exit(-1);
    }
  });

class RittaSdk extends Ritta {
  // TODO: Permission checks and methods need to be implemented
  private permissions: Set<string>;
  private userPermissions: Set<string>;
  private dependencies: Set<string>;
  private softDependencies: Set<string>;

  private _database: RittaDatabase;
  private _modules: RittaModules;
  private _roles: RittaRoles;
  private _auth: RittaAuth;
  constructor(
    permissions: string[],
    userPermissions: string[],
    dependencies: string[],
    softDependencies: string[]
  ) {
    super();
    this.permissions = new Set(permissions);
    this.userPermissions = new Set(userPermissions);
    this.dependencies = new Set(dependencies);
    this.softDependencies = new Set(softDependencies);

    this._modules = new RittaSdkModules(this.permissions);
    this._roles = new RittaSdkRoles(this.permissions);
    this._database = new RittaSdkDatabase(this.permissions);
    this._auth = new RittaSdkAuth(this.permissions);
  }

  database(): RittaDatabase {
    return this._database;
  }

  modules(): RittaModules {
    return this._modules;
  }

  roles(): RittaRoles {
    return this._roles;
  }

  auth(): RittaAuth {
    return null;
  }

  get logger(): pino.BaseLogger {
    return logger;
  }
}

class RittaSdkAuth extends RittaAuth {
  private permissions: Set<string>;
  constructor(permissions: Set<string>) {
    super();
    this.permissions = permissions;
  }

  async list(): Promise<Strategy[]> {
    return Array.from(StrategyStore.get());
  }

  async register(strategy: Strategy): Promise<Strategy | null> {
    if (!this.permissions.has('auth:register')) {
      throw new ModuleNoPermission('auth.register() requires auth:register');
    }
    const strategies = StrategyStore.get();
    if (strategy.name.toLowerCase() !== strategy.name) {
      throw new Error('Strategy name must be lowercase');
    }
    if (strategy.name in strategies) {
      throw new Error(`Strategy ${strategy.name} already exists`);
    }
    strategies.add(strategy);
    StrategyStore.set(strategies);
    return strategy;
  }
}

class RittaSdkDatabase extends RittaDatabase {
  private permissions: Set<string>;
  constructor(permissions: Set<string>) {
    super();
    this.permissions = permissions;
  }

  async model(name: string): Promise<RittaSdkModel> {
    if (!this.permissions.has('database:read')) {
      throw new ModuleNoPermission('database.model() requires database:read');
    }
    return null;
  }

  async registerModel(name: string, model: Schema): Promise<RittaSdkModel> {
    return null;
  }
}

class RittaSdkModel extends Model {
  private permissions: Set<string>;
  constructor(permissions: Set<string>) {
    super();
    this.permissions = permissions;
  }

  public schema: Schema = null;

  async find(): Promise<RittaSdkDocument[]> {
    return [];
  }

  async findOne(): Promise<RittaSdkDocument | null> {
    return null;
  }

  async document(id: string): Promise<RittaSdkDocument | null> {
    return null;
  }

  async newDocument(data: object): Promise<RittaSdkDocument> {
    return null;
  }
}

class RittaSdkDocument extends Document {
  get model(): Model {
    return null;
  }

  async data(): Promise<object> {
    return {};
  }

  async save(): Promise<RittaSdkDocument> {
    return null;
  }

  async delete(): Promise<void> {
    return;
  }
}

class RittaSdkRoles extends RittaRoles {
  private permissions: Set<string>;
  constructor(permissions: Set<string>) {
    super();
    this.permissions = permissions;
  }

  async create(name: string): Promise<RittaSdkRole> {
    if (!this.permissions.has('roles:create')) {
      throw new ModuleNoPermission('roles.create requires roles:create');
    }
    return new RittaSdkRole(this.permissions);
  }

  async role(name: string | number): Promise<RittaSdkRole | null> {
    if (!this.permissions.has('roles:list')) {
      throw new ModuleNoPermission('roles.getRole requires roles:list');
    }
    return new RittaSdkRole(this.permissions);
  }

  async listRoles(): Promise<RittaSdkRole[]> {
    if (!this.permissions.has('roles:list')) {
      throw new ModuleNoPermission('roles.listRoles requires roles:list');
    }
    return [];
  }
}

class RittaSdkRole extends Role {
  private _permissions: Set<string>;

  constructor(permissions: Set<string>) {
    super();
    this._permissions = permissions;
  }

  async name(): Promise<string> {
    return 'admin';
  }

  async id(): Promise<number> {
    return 0;
  }

  async permissions(): Promise<RolePermissions> {
    return null;
  }

  async setName(name: string): Promise<void> {
    if (!this._permissions.has('roles:create')) {
      throw new ModuleNoPermission('role.setName() requires roles:create');
    }
    return;
  }

  async delete(): Promise<void> {
    if (!this._permissions.has('roles:remove')) {
      throw new ModuleNoPermission('role.delete() requires roles:remove');
    }
    return;
  }
}

class RittaSdkModules extends RittaModules {
  private permissions: Set<string>;
  constructor(permissions: Set<string>) {
    super();
    this.permissions = permissions;
  }

  async listModules(): Promise<string[]> {
    // Permissions check
    if (!this.permissions.has('modules:list')) {
      throw new ModuleNoPermission(
        'modules.listModules() requires modules:list'
      );
    }
    return [];
  }
}
