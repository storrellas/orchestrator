import { controller, httpGet, httpPost, httpPut, httpDelete } from 'inversify-express-utils';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import * as Sequelize from 'sequelize';

import { IDataStore } from './datastore';

import TYPES from '../constant/types';
import { PairCoreRTV,
          CoreModule,
          RTVModule,
          VACenter,
          VACenterList,
          ICoreModuleManager } from '../models/core_module_manager';
import { LoggerInstance, transports, LoggerOptions, WLogger } from '../utils/logger';

export interface ICoreService {
  get_core_by_id( id? : number )  : Promise<CoreModule[]>
  get_rtv_by_id( id? : number )  : Promise<RTVModule[]>
  get_vacenters_by_user( guid : string )  : Promise<VACenterList>
  get_core_by_vacenter( guid : string )  : Promise<PairCoreRTV>
  get_core_by_branch( guid : string )  : Promise<PairCoreRTV>
  get_core_by_campaign( guid : string )  : Promise<PairCoreRTV>
}

@injectable()
export class CoreService implements ICoreService {
  constructor(
    @inject(TYPES.CoreModuleManager) private core_module_manager: ICoreModuleManager,
    @inject(TYPES.DataStore) private data_store: IDataStore,
    @inject(TYPES.Logger) private logger: LoggerInstance)
  {
  }

  /**
    * Checks whether item is in cache memory and if not retreive from DB and set to Cache
    */
  private get_item_by_id( cache_key : Object, id : string | number | undefined, db_handler : (id?: string | number) => Promise<any> ) : Promise<any> {

    return new Promise<any>((resolve, reject) => {

      // Check whether in cache
      this.data_store.get( JSON.stringify(cache_key) )
      .then( (value : any) => {

        if( value == '' || value == null){
          this.logger.debug( JSON.stringify(cache_key) + " not found in cache retrieving from DB")
          // Retrieve from DB
          db_handler(id)
          .then( (core_module_list : any)  => {
            this.data_store.set( JSON.stringify(cache_key), core_module_list)
            return resolve(core_module_list)
          })
          .catch( (err) => {
            console.log(err);
            let core_module : any = []
            return reject(core_module)
          });
        }else{
          return resolve(value)
        }
      }).catch( () => {
        return reject('')
      })

    });

  }

  /**
    * Get core by Id
    */
  public get_core_by_id( id? : number )  : Promise<CoreModule[]> {

    // Generate cache key
    let id_local = 0;
    if( id != undefined )
      id_local = id;
    let cache_key = {get_core_by_id: id_local};

    return this.get_item_by_id( cache_key,
                                id,
                                this.core_module_manager.get_db_core_by_id.bind(this.core_module_manager) );
  }


  /**
    * Get RTV by Id
    */
  public get_rtv_by_id( id? : number )  : Promise<RTVModule[]> {

    // Generate cache key
    let id_local = 0;
    if( id != undefined )
      id_local = id;
    let cache_key = {get_rtv_by_id: id_local};

    return this.get_item_by_id( cache_key,
                                id,
                                this.core_module_manager.get_db_rtv_by_id.bind(this.core_module_manager) );
  }


  /**
    * Get VACenters by User
    */
  public get_vacenters_by_user( guid : string )  : Promise<VACenterList> {

    // Generate cache key
    let cache_key = {get_vacenters_by_user: guid};

    return this.get_item_by_id( cache_key,
                                guid,
                                this.core_module_manager.get_db_vacenters_by_user.bind(this.core_module_manager) );
  }


  /**
    * Get CORE by Branch
    */
  public get_core_by_vacenter( guid : string )  : Promise<PairCoreRTV> {

    // Generate cache key
    let cache_key = {get_core_by_vacenter: guid};

    return this.get_item_by_id( cache_key,
                                guid,
                                this.core_module_manager.get_db_core_by_vacenter.bind(this.core_module_manager) );
  }


  /**
    * Get CORE by Branch
    */
  public get_core_by_branch( guid : string )  : Promise<PairCoreRTV> {

    // Generate cache key
    let cache_key = {get_core_by_branch: guid};

    return this.get_item_by_id( cache_key,
                                guid,
                                this.core_module_manager.get_db_core_by_branch.bind(this.core_module_manager) );
  }

  /**
    * Get CORE by Campaign
    */
  public get_core_by_campaign( guid : string )  : Promise<PairCoreRTV> {

    // Generate cache key
    let cache_key = {get_core_by_campaign: guid};

    return this.get_item_by_id( cache_key,
                                guid,
                                this.core_module_manager.get_db_core_by_campaign.bind(this.core_module_manager) );
  }

}
