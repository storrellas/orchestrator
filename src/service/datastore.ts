import { injectable, inject } from 'inversify';
import * as Redis from 'ioredis';

import TYPES from '../constant/types';
import { LoggerInstance, WLogger } from '../utils/logger';

export interface IDataStore {
  set(key: string, value: any, ...args: any[]): any
  getBuffer(key: string): Promise<Buffer>
  get(key: string): Promise<string>
}

export class DataStoreOptions{
  public host : string;
  public port : number;
  public expire :number;
}

@injectable()
export class DataStore implements IDataStore {
  private redis                : Redis.Redis;
  private redisExpirationTag   : string = 'EX';
  private redisExpirationValue : number;

  constructor(
    @inject(TYPES.Logger) private logger: LoggerInstance,
    private options : DataStoreOptions)
  {
    this.logger.info('Using Redis data store');
    this.redis = new Redis(options.port, options.host);
    this.redisExpirationValue = options.expire;
  }

  set(key: string, value: any, ...args: any[]): any {
    return this.redis.set(key, JSON.stringify(value),
                          this.redisExpirationTag, this.redisExpirationValue, args);
  }

  getBuffer(key: string): Promise<Buffer> {
    return this.redis.getBuffer(key);
  }

  get(key: string): Promise<string> {
    return new Promise<string>( (resolve,reject) => {
      this.redis.get(key).then( (value : string) => {
        return resolve(JSON.parse(value))
      });
    })

  }
}

@injectable()
export class LocalDataStore implements IDataStore {
  private keys: {[index: string]: any} = {};

  constructor(@inject(TYPES.Logger) private logger: LoggerInstance) {
    this.logger.info('Using in-memory data store');
  }

  set(key: string, value: any, ...args: any[]): any {
    return this.keys[key] = value;
  }

  getBuffer(key: string): Promise<Buffer> {
    const promise = new Promise<Buffer>((resolve, reject) => {
      const value = this.keys[key];
      if (value instanceof Buffer) {
        resolve(value);
      } else {
        resolve(Buffer.from(value || ''));
      }
    });
    return promise;
  }

  get(key: string): Promise<string> {
    const promise = new Promise<string>((resolve, reject) => {
      const value = this.keys[key];
      resolve(value || '');
    });
    return promise;
  }
}
