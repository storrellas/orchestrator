import { controller, httpGet, httpPost, httpPut, httpDelete } from 'inversify-express-utils';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import * as Sequelize from 'sequelize';

import { IDataStore } from './datastore';

import TYPES from '../constant/types';
import { PairItemRTV,
          ItemModule,
          RTVModule,
          VACenter,
          VACenterList,
          IItemModuleManager } from '../models/item_module_manager';
import { LoggerInstance, transports, LoggerOptions, WLogger } from '../utils/logger';

export interface IItemService {
  get_item_by_id( id? : number )  : Promise<ItemModule[]>
  get_rtv_by_id( id? : number )  : Promise<RTVModule[]>
  get_vacenters_by_user( guid : string )  : Promise<VACenterList>
  get_item_by_vacenter( guid : string )  : Promise<PairItemRTV>
  get_item_by_branch( guid : string )  : Promise<PairItemRTV>
  get_item_by_campaign( guid : string )  : Promise<PairItemRTV>
}

@injectable()
export class ItemService implements IItemService {
  constructor(
    @inject(TYPES.ItemModuleManager) private item_module_manager: IItemModuleManager,
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
          .then( (item_module_list : any)  => {
            this.data_store.set( JSON.stringify(cache_key), item_module_list)
            return resolve(item_module_list)
          })
          .catch( (err) => {
            console.log(err);
            let item_module : any = []
            return reject(item_module)
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
    * Get item by Id
    */
  public get_item_by_id( id? : number )  : Promise<ItemModule[]> {

    // Generate cache key
    let id_local = 0;
    if( id != undefined )
      id_local = id;
    let cache_key = {get_item_by_id: id_local};

    return this.get_item_by_id( cache_key,
                                id,
                                this.item_module_manager.get_db_item_by_id.bind(this.item_module_manager) );
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
                                this.item_module_manager.get_db_rtv_by_id.bind(this.item_module_manager) );
  }


  /**
    * Get VACenters by User
    */
  public get_vacenters_by_user( guid : string )  : Promise<VACenterList> {

    // Generate cache key
    let cache_key = {get_vacenters_by_user: guid};

    return this.get_item_by_id( cache_key,
                                guid,
                                this.item_module_manager.get_db_vacenters_by_user.bind(this.item_module_manager) );
  }


  /**
    * Get CORE by Branch
    */
  public get_item_by_vacenter( guid : string )  : Promise<PairItemRTV> {

    // Generate cache key
    let cache_key = {get_item_by_vacenter: guid};

    return this.get_item_by_id( cache_key,
                                guid,
                                this.item_module_manager.get_db_item_by_vacenter.bind(this.item_module_manager) );
  }


  /**
    * Get CORE by Branch
    */
  public get_item_by_branch( guid : string )  : Promise<PairItemRTV> {

    // Generate cache key
    let cache_key = {get_item_by_branch: guid};

    return this.get_item_by_id( cache_key,
                                guid,
                                this.item_module_manager.get_db_item_by_branch.bind(this.item_module_manager) );
  }

  /**
    * Get CORE by Campaign
    */
  public get_item_by_campaign( guid : string )  : Promise<PairItemRTV> {

    // Generate cache key
    let cache_key = {get_item_by_campaign: guid};

    return this.get_item_by_id( cache_key,
                                guid,
                                this.item_module_manager.get_db_item_by_campaign.bind(this.item_module_manager) );
  }

}
