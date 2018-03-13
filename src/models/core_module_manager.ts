import { controller, httpGet, httpPost, httpPut, httpDelete } from 'inversify-express-utils';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import * as Sequelize from 'sequelize';

import TYPES from '../constant/types';
import { IModels } from '../models/model';
import { LoggerInstance, WLogger } from '../utils/logger';

export class PairCoreRTV {
  constructor(public core_locator: string){}
  core_locator_id  : string;
  core_id          : number;
  rtv_id           : number;
}

export class CoreModule {

  id               : number;
  description      : string;
  module_type_id   : number;
  module_type_desc : string;
  ip               : string;
  port_http        : number;
  port_https       : number;
  port_core        : number;
  port_webcontrol  : number;

}

export class RTVModule extends CoreModule {
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

export interface ICoreModuleManager {
  get_db_vacenters_by_user(guid : string) : Promise<VACenterList>
  get_db_core_by_vacenter(guid: string) : Promise<PairCoreRTV>
  get_db_core_by_branch(guid : string) :  Promise<PairCoreRTV>
  get_db_core_by_campaign(guid : string) :  Promise<PairCoreRTV>
  get_db_rtv_by_id( id? : number ) : Promise<RTVModule[]>
  get_db_core_by_id( id? : number ) : Promise<CoreModule[]>
}

@injectable()
export class CoreModuleManager implements ICoreModuleManager{
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
    * Get core by VACenter
    */
  public get_db_core_by_vacenter(guid: string) : Promise<PairCoreRTV> {

    const obj = this;
    return new Promise<PairCoreRTV>(function (resolve, reject) {

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
        const pair_core_rtv : PairCoreRTV = new PairCoreRTV("vacenter")
        pair_core_rtv.core_locator_id = guid;
        pair_core_rtv.core_id = result.WVAGroupModels[0].WRWBranchGroupWVAGroupModel.WBranchGroupModel.WCampaignModel.idWZone;
        pair_core_rtv.rtv_id = result.WVAGroupModels[0].WRWBranchGroupWVAGroupModel.idWRTV;
        return resolve(pair_core_rtv)
      }).catch( (result: any) => {
        console.log( result )
        return reject(null)
      })
    })

  }

  /**
    * Get core by branch
    */
  public get_db_core_by_branch(guid : string) :  Promise<PairCoreRTV>  {

    const obj = this;
    return new Promise<PairCoreRTV>(function (resolve, reject) {

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
        const pair_core_rtv : PairCoreRTV = new PairCoreRTV("branch")
        pair_core_rtv.core_locator_id = guid;
        pair_core_rtv.core_id = result.WCampaignModel.idWZone;
        pair_core_rtv.rtv_id = result.WBranchGroupModel.WRWBranchGroupWVAGroupModel.idWRTV;
        return resolve(pair_core_rtv)
      }).catch( (result: any) => {
        return reject(null)
      })
    })

  }


  /**
    * Get core by campaign
    */
  public get_db_core_by_campaign(guid : string) : Promise<PairCoreRTV> {

    return new Promise<PairCoreRTV>((resolve, reject) => {

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
        const pair_core_rtv : PairCoreRTV = new PairCoreRTV("campaign")
        pair_core_rtv.core_locator_id = guid;
        pair_core_rtv.core_id = result.idWZone;
        pair_core_rtv.rtv_id = result.WBranchGroupModels[0].WRWBranchGroupWVAGroupModel.idWRTV;
        return resolve(pair_core_rtv)
      }).catch( (err) => {
        console.log('db error', err )
        return reject('db error')
      })
    })

  }

  /**
    * Get core by branch
    */
  public get_db_rtv_by_id( id? : number ) : Promise<RTVModule[]> {

    // Generate where clause if required
    const where_clause : any = {}
    if( id != undefined)
      where_clause.idWRTV = id


    const obj = this;
    return new Promise<CoreModule[]>(function (resolve, reject) {

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
          rtv_module.port_core = item.CorePort;
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
    * Get core by Id
    */
  public get_db_core_by_id( id? : number ) : Promise<CoreModule[]> {

      // Generate where clause if required
      const where_clause : any = {}
      if( id != undefined)
        where_clause.idWCore = id

      const obj = this;
      return new Promise<CoreModule[]>(function (resolve, reject) {

        // Get Core by Id
        obj.models.getModel('WCoreModulesModel').findAll({
          include: [
            {
              model: obj.models.getModel('WCoresModel'),
              required: true,
            },
            {
              model: obj.models.getModel('WCoreServerTypesModel'),
              required: true,
            }
          ],
          where : where_clause,
          order:[['idWCore']]
        }).then((result: any[]) => {

          let module_list : CoreModule[] = [];
          if( result == null || result.length == 0)
            return reject(module_list)

          for (let item of result) {
            const core_module : CoreModule = new CoreModule();
            core_module.id = item.idWCore;
            core_module.description = item.WCoresModel.Description;
            core_module.module_type_desc = item.WCoreServerTypesModel.Description;
            core_module.module_type_id = item.WCoreServerTypesModel.idWCoreServerType;
            core_module.ip = item.ip;
            core_module.port_http = item.WebPort;
            core_module.port_https = item.SecureWebPort;
            core_module.port_core = item.CorePort;
            core_module.port_webcontrol = item.WebControlPort

            module_list.push(core_module)
          }

          return resolve(module_list)
        }).catch( (result: any) => {
          console.log(result )
          return reject(null)
        })

      });



  }

}
