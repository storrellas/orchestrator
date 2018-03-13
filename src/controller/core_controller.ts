import { controller, httpGet, httpPost, httpPut, httpDelete } from 'inversify-express-utils';
import { injectable, inject } from 'inversify';
import { Request, Response, Express } from 'express';
import * as Sequelize from 'sequelize';
import * as xml2js from 'xml2js';

import TYPES from '../constant/types';
import { IModels } from '../models/model';
import { CoreModule, RTVModule, PairCoreRTV,VACenterList } from '../models/core_module_manager';
import { ICoreService } from '../service/core_service';
import { LoggerInstance, transports, LoggerOptions, WLogger } from '../utils/logger';
import { isValidGuid } from '../utils/helper';

export enum RequestType {
    XML = 0,
    JSON = 1,
}

export interface ICoreController {
  get_core_by(request: Request, response: Response): void
}

declare global {
  namespace Express {
    interface Request {
      data: any;
      request_type : RequestType;
    }
  }
}

// export class WResponse extends Response{
//
//   /**
//     * Replies according to content in body
//     */
//   public wsend ( request_type : RequestType, response_json : { [id: string]: any; } ) : void  {
//     if( request_type == RequestType.JSON){
//       this.json( response_json )
//     }else{
//       var xmlValues = new xml2js.Builder();
//       const convertedObjects : string = xmlValues.buildObject(response_json);
//       this.set('Content-Type', 'application/xml');
//       this.send( convertedObjects )
//     }
//   }
//
// }

@controller('')
export class CoreController {

  constructor(@inject(TYPES.CoreService) private service: ICoreService,
              @inject(TYPES.Logger) private logger: LoggerInstance){
  }

  /**
    * Creates JSON response
    */
  private create_ok_response( pair_core_rtv : PairCoreRTV, core_module_list : CoreModule[], rtv : RTVModule) : { [id: string]: any; } {
    let response_json : { [id: string]: any; } = { "result" : "ok"}

    // Create CORE
    const core_json : { [id: string]: any; } = {
      id           : core_module_list[0].id,
      desc         : core_module_list[0].description
    }
    response_json["core"] = core_json
    // Create RTV
    const rtv_json : { [id: string]: any; } = {
      id           : rtv.id,
      desc         : rtv.description
    }
    response_json["rtv"] = rtv_json

    let elements_array_json = [];
    for (let core_module of core_module_list) {
      const type_json : { [id: string]: any; } ={
        id         : core_module.module_type_id,
        desc       : core_module.module_type_desc
      }
      const port_json : { [id: string]: any; } ={
        http       : core_module.port_http,
        https      : core_module.port_https
      }

      const core_module_json : { [id: string]: any; } ={
        core_id    : core_module.id,
        core       : core_module.port_core,
        webcontrol : core_module.port_webcontrol,
        desc       : core_module.description,
        type       : type_json,
        ip         : core_module.ip,
        port       : port_json
      }
      elements_array_json.push(core_module_json)
    }
    response_json["elements"] = elements_array_json
    return response_json;
  }

  /**
    * Creates JSON response
    */
  private create_ko_response( message : string, code: number ) : { [id: string]: any; } {
    return {
            result : "ko",
            message: message,
            resultcode: code
          };
  }

  /**
    * Get Core by Item
    */
  private get_core_by_item(guid: string, promise : Promise<{ [id: string]: any; }>) : Promise<{ [id: string]: any; }> {

    return new Promise<{ [id: string]: any; }>( (resolve, reject) => {

      // Get PairCoreRTV
      promise
      .then( (pair_core_rtv  : PairCoreRTV) => {

        let rtv_local : RTVModule;
        let core_module_list_local : CoreModule[];
        // Get Core
        this.service.get_core_by_id( pair_core_rtv.core_id )
        .then( (core_module_list : CoreModule[]) => {
          core_module_list_local = core_module_list
          // Get RTV
          return this.service.get_rtv_by_id(  pair_core_rtv.rtv_id );
        })
        .then((rtv : RTVModule[]) => {
          rtv_local = rtv[0];
          return resolve( this.create_ok_response(pair_core_rtv, core_module_list_local, rtv_local) )
        })

      })
      .catch( () => {
        let response_json : { [id: string]: any; } =
          this.create_ko_response( "Locator not found:" + guid, 402 )
        return reject( response_json );
      })

    })

  }

  /**
    * Get Core by Campaign
    */
  private get_core_by_campaign(guid : string) : Promise<{ [id: string]: any; }> {
    return this.get_core_by_item ( guid, this.service.get_core_by_campaign(guid) );
  }

  /**
    * Get Core by Branch
    */
  private get_core_by_branch(guid : string) : Promise<{ [id: string]: any; }> {
    return this.get_core_by_item ( guid, this.service.get_core_by_branch(guid) );
  }

  /**
    * Get Core by Branch
    */
  private get_core_by_vacenter(guid : string) : Promise<{ [id: string]: any; }> {
    return this.get_core_by_item ( guid, this.service.get_core_by_vacenter(guid) );
  }

  /**
    * Get VACenters by user
    */
  private get_vacenters_by_user(guid : string) :  Promise<{ [id: string]: any; }> {

    return new Promise<{ [id: string]: any; }>( (resolve, reject) => {

      this.service.get_vacenters_by_user(guid).then( (result : VACenterList) => {
        let response_json : { [id: string]: any; } = { "result" : "ok"}
        response_json["user_guid"] = result.user_guid
        response_json["elements"] = result.vacenter_list
        return resolve( response_json )
      })
      .catch( () => {
        let response_json : { [id: string]: any; } =
          this.create_ko_response( "Locator not found:" + guid , 402 )
        return reject( response_json )
      })

    });

  }

  /**
    * Replies according to content in body
    */
  private send_response( request : Request, response : Response, response_json : { [id: string]: any; } ) : void {
    if( request.request_type == RequestType.JSON || request.query.callback){
      response.jsonp( response_json )
    }else{
      var xmlValues = new xml2js.Builder({headless: true});
      const response_xml : string = xmlValues.buildObject(response_json);
      response.set('Content-Type', 'application/xml');
      response.send( response_xml )
    }
  }

  /**
    * Handles event named by event/guid and replies using response
    */
  public handle_event(request: Request, response: Response): Promise<{ [id: string]: any; }> {

    // Get event / id
    let event : string = "";
    let guid : string = "";
    if(request.data.event == "api" )
      event = request.data.e;
    else if(request.data.event != undefined )
      event = request.data.event;

    if( request.data.id != undefined){
      guid = request.data.id
    }

    // Check arguments are properly passed
    if( event.length == 0 || guid.length == 0 ){
      const json_response =
        this.create_ko_response( "Missing parameters:" + JSON.stringify(request.data), 400 )
      //response.status(400).json( json_response )
      response.status(400)
      this.send_response(request, response, json_response)
      return Promise.reject(json_response);
    }

    // Check guid
    if( isValidGuid(guid) ){
      // Do nothing
    }else{
      const json_response =
        this.create_ko_response( "Wrong guid:" + request.data.id, 401 )
      //response.status(400).json( json_response )
      response.status(400)
      this.send_response(request, response, json_response)
      return Promise.reject(json_response);
    }

    // Handle event according to event received
    let event_promise : Promise<{ [id: string]: any; }>;
    switch(event){
      case "get_core_by_campaign":
        event_promise = this.get_core_by_campaign(guid);
        break;
      case "get_core_by_branch":
        event_promise = this.get_core_by_branch(guid);
        break;
      case "get_core_by_vacenter":
        event_promise = this.get_core_by_vacenter(guid);
        break;
      case "get_vacenters_by_user":
        event_promise = this.get_vacenters_by_user(guid)
        break;
      default:
        event_promise = Promise.reject({response:'invalid event'});
        break;
    }

    // Handle event
    event_promise.then( (response_json)=>{
      this.logger.info(`${event} guid=${guid}`)
      //response.status(200).json( response_json )
      response.status(200)
      this.send_response( request, response, response_json)
    }).catch( (response_json) => {
      this.logger.error(`${event} guid=${guid} not found`)
      response.status(400)
      this.send_response( request, response, response_json)
    })
    return event_promise;
  }

  /**
    * POST to get core by
    */
  @httpPost('')
  public POST_get_core_by(request: Request, response: Response): void {
    this.handle_event(request, response);
  }

  /**
    * GET to get core by
    */
  @httpGet('')
  public GET_get_core_by(request: any, response: Response): void {
    this.handle_event(request, response);
  }

}
