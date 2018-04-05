import { controller, httpGet, httpPost, httpPut, httpDelete } from 'inversify-express-utils';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import * as Sequelize from 'sequelize';

import TYPES from '../constant/types';
import { IModels } from '../models/model';
import { LoggerInstance, WLogger } from '../utils/logger';

export class PairItemRTV {
  constructor(public item_locator: string){}
  item_locator_id  : string;
  item_id          : number;
  rtv_id           : number;
}

export class ItemModule {

  id               : number;
  description      : string;
  module_type_id   : number;
  module_type_desc : string;
  ip               : string;
  port_http        : number;
  port_https       : number;
  port_item        : number;
  port_webcontrol  : number;

}

export class RTVModule extends ItemModule {
  constructor(){
    super()
  }
}

export class VACenter  {
  guid             : number;
  name             : string;
}

export class VACenterList  {
  vacenter_list    : VACenter[] = [];
  user_guid        : string;
}

export interface IItemModuleManager {
  get_db_vacenters_by_user(guid : string) : Promise<VACenterList>
  get_db_item_by_vacenter(guid: string) : Promise<PairItemRTV>
  get_db_item_by_branch(guid : string) :  Promise<PairItemRTV>
  get_db_item_by_campaign(guid : string) :  Promise<PairItemRTV>
  get_db_rtv_by_id( id? : number ) : Promise<RTVModule[]>
  get_db_item_by_id( id? : number ) : Promise<ItemModule[]>
}

@injectable()
export class ItemModuleManager implements IItemModuleManager{
  constructor(
    @inject(TYPES.Models) private models: IModels,
    @inject(TYPES.Logger) private logger: LoggerInstance)
  {
  }


  /**
    * Get VACenters by user
    */
  public get_db_vacenters_by_user(guid : string) : Promise<VACenterList> {

    const obj = this;
    return new Promise<VACenterList>(function (resolve, reject) {

      obj.models.getModel('WUserModel').findOne({
        include: [
          {
           model: obj.models.getModel('WVAGroupModel'),
           as: 'vagroups',
           required: true,
           include:[
             {
               model: obj.models.getModel('WVACenterModel'),
               required: true,
               where : {
                 enabled : 1
               }
             }
           ]
          }
        ],
        where: {
          Active : 1,
          IdUser: guid
        },

        group: [
          // NOTE: This should be the correct way to do it
          // [
          //   {model: this.models.getModel('WVAGroupModel'), as : 'vagroups'},
          //   this.models.getModel('WVACenterModel'),
          //   'name'
          // ],
          [ Sequelize.literal('`vagroups`.IdVAGroup') ],
          [ Sequelize.literal('`vagroups->WVACenterModel`.name') ],
          [ Sequelize.literal('`vagroups->WVACenterModel`.guid') ]
        ],

        order:[
          [
            {model: obj.models.getModel('WVAGroupModel'), as : 'vagroups'},
            obj.models.getModel('WVACenterModel'),
            'name'
          ]
        ]
      }).then((user: any) => {

        const vacenter_list : VACenterList = new VACenterList();
        if( user == null || user.vagroups == 0)
          return reject(vacenter_list)


        vacenter_list.user_guid = guid;
        for (let vagroup of user.vagroups) {
          const vacenter : VACenter = new VACenter();
          vacenter.guid = vagroup.WVACenterModel.guid;
          vacenter.name = vagroup.WVACenterModel.name;
          vacenter_list.vacenter_list.push(vacenter)
        }
        return resolve(vacenter_list)
      })

    });

  }

  /**
    * Get item by VACenter
    */
  public get_db_item_by_vacenter(guid: string) : Promise<PairItemRTV> {

    const obj = this;
    return new Promise<PairItemRTV>(function (resolve, reject) {

      obj.models.getModel('WVACenterModel').findOne({
          include: [
            {
             model: obj.models.getModel('WVAGroupModel'),
             required: true,
             include:[
                {
                  model: obj.models.getModel('WRWBranchGroupWVAGroupModel'),
                  required: true,
                  include:[
                     {
                       model: obj.models.getModel('WBranchGroupModel'),
                       required: true,
                       where: {
                         Type: [0, 2], // [0, 2] for OTO, 1 for OTM
                         enabled: 1
                       },
                       include:[
                          {
                            model: obj.models.getModel('WCampaignModel'),
                            required: true,
                            where:{
                              enabled:1
                            }
                          }
                       ],
                     },

                  ]
                }
             ]
           },
          ],

        where: {
          guid: guid,
          enabled: 1
        }
      }).then((result: any) => {
        if( result == null )
          return reject(result)
        const pair_item_rtv : PairItemRTV = new PairItemRTV("vacenter")
        pair_item_rtv.item_locator_id = guid;
        pair_item_rtv.item_id = result.WVAGroupModels[0].WRWBranchGroupWVAGroupModel.WBranchGroupModel.WCampaignModel.idWZone;
        pair_item_rtv.rtv_id = result.WVAGroupModels[0].WRWBranchGroupWVAGroupModel.idWRTV;
        return resolve(pair_item_rtv)
      }).catch( (result: any) => {
        console.log( result )
        return reject(null)
      })
    })

  }

  /**
    * Get item by branch
    */
  public get_db_item_by_branch(guid : string) :  Promise<PairItemRTV>  {

    const obj = this;
    return new Promise<PairItemRTV>(function (resolve, reject) {

      obj.models.getModel('WBranchModel').findOne({
        include: [
          {
           model: obj.models.getModel('WBranchGroupModel'),
           required: true,
           include:[
             {
               model: obj.models.getModel('WRWBranchGroupWVAGroupModel'),
               required: true
             }
           ]
         },
         {
          model: obj.models.getModel('WCampaignModel'),
          required: true,
          where: {
            enabled: 1
          }
         }
        ],

        where: {
          guid: guid,
          enabled: 1
        }
      }).then((result : any ) => {

        if( result == null )
          return reject(result)
        const pair_item_rtv : PairItemRTV = new PairItemRTV("branch")
        pair_item_rtv.item_locator_id = guid;
        pair_item_rtv.item_id = result.WCampaignModel.idWZone;
        pair_item_rtv.rtv_id = result.WBranchGroupModel.WRWBranchGroupWVAGroupModel.idWRTV;
        return resolve(pair_item_rtv)
      }).catch( (result: any) => {
        return reject(null)
      })
    })

  }


  /**
    * Get item by campaign
    */
  public get_db_item_by_campaign(guid : string) : Promise<PairItemRTV> {

    return new Promise<PairItemRTV>((resolve, reject) => {

      this.models.getModel('WCampaignModel').findOne({
          include: [
            {
             model: this.models.getModel('WBranchGroupModel'),
             required: true,
             include:[
               {
                 model: this.models.getModel('WRWBranchGroupWVAGroupModel'),
                 required: true
               }
             ]
           },
           {
            model: this.models.getModel('WZoneCountryModel'),
            required: true
           }
          ],

          where: {
            guid: guid
          }
      }).then((result: any) => {

        if( result == null )
          return reject(result)
        const pair_item_rtv : PairItemRTV = new PairItemRTV("campaign")
        pair_item_rtv.item_locator_id = guid;
        pair_item_rtv.item_id = result.idWZone;
        pair_item_rtv.rtv_id = result.WBranchGroupModels[0].WRWBranchGroupWVAGroupModel.idWRTV;
        return resolve(pair_item_rtv)
      }).catch( (err) => {
        console.log('db error', err )
        return reject('db error')
      })
    })

  }

  /**
    * Get item by branch
    */
  public get_db_rtv_by_id( id? : number ) : Promise<RTVModule[]> {

    // Generate where clause if required
    const where_clause : any = {}
    if( id != undefined)
      where_clause.idWRTV = id


    const obj = this;
    return new Promise<ItemModule[]>(function (resolve, reject) {

      obj.models.getModel('WRTVModel').findAll({
        where: where_clause,
        order:[['idWRTV', ]]
      }).then((result: any[]) => {
        let rtv_module_list : RTVModule[] = [];
        if( result == null || result.length == 0)
          return reject(rtv_module_list)

        for (let item of result) {
          const rtv_module : RTVModule = new RTVModule();
          rtv_module.id = item.idWRTV;
          rtv_module.description = item.Description;
          rtv_module.module_type_desc = "RTV";
          rtv_module.module_type_id = 2;  // Fixed for RTV
          rtv_module.ip = item.ip;
          rtv_module.port_http = item.WebPort;
          rtv_module.port_https = item.SecureWebPort;
          rtv_module.port_item = item.ItemPort;
          rtv_module.port_webcontrol = item.WebControlPort

          rtv_module_list.push(rtv_module)
        }
        return resolve(rtv_module_list)
      }).catch( (result: any) => {
        console.log(result )
        return reject(null)
      })

    });



  }


  /**
    * Get item by Id
    */
  public get_db_item_by_id( id? : number ) : Promise<ItemModule[]> {

      // Generate where clause if required
      const where_clause : any = {}
      if( id != undefined)
        where_clause.idWItem = id

      const obj = this;
      return new Promise<ItemModule[]>(function (resolve, reject) {

        // Get Item by Id
        obj.models.getModel('WItemModulesModel').findAll({
          include: [
            {
              model: obj.models.getModel('WItemsModel'),
              required: true,
            },
            {
              model: obj.models.getModel('WItemServerTypesModel'),
              required: true,
            }
          ],
          where : where_clause,
          order:[['idWItem']]
        }).then((result: any[]) => {

          let module_list : ItemModule[] = [];
          if( result == null || result.length == 0)
            return reject(module_list)

          for (let item of result) {
            const item_module : ItemModule = new ItemModule();
            item_module.id = item.idWItem;
            item_module.description = item.WItemsModel.Description;
            item_module.module_type_desc = item.WItemServerTypesModel.Description;
            item_module.module_type_id = item.WItemServerTypesModel.idWItemServerType;
            item_module.ip = item.ip;
            item_module.port_http = item.WebPort;
            item_module.port_https = item.SecureWebPort;
            item_module.port_item = item.ItemPort;
            item_module.port_webcontrol = item.WebControlPort

            module_list.push(item_module)
          }

          return resolve(module_list)
        }).catch( (result: any) => {
          console.log(result )
          return reject(null)
        })

      });



  }

}
