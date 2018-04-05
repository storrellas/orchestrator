import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as uuid from 'uuid';
import { mockReq, mockRes } from 'sinon-express-mock';
import * as Sequelize from 'sequelize';

import { PairItemRTV,
          ItemModule,
          RTVModule,
          VACenter,
          VACenterList,
          IItemModuleManager } from '../../../src/models/item_module_manager';
import { IItemService } from '../../../src/service/item_service';
import { LoggerInstance, transports, LoggerOptions, WLogger } from '../../../src/utils/logger';
import { ItemController, RequestType } from '../../../src/controller/item_controller';

var should = chai.should();
var assert = chai.assert;
var expect = chai.expect;
chai.use(chaiAsPromised);
chai.use(sinonChai);


class ItemServiceStub implements IItemService {

  public wrong_locator : string = "18d37ab9-acb7-498a-9fc1-c258e8c82418";


  private get_dummy_pair_item_rtv() : PairItemRTV {
    let pair_item_rtv : PairItemRTV = new PairItemRTV("test");
    pair_item_rtv.item_locator_id = "fb1f42c5-3e4c-4b9e-9dd4-bdb7ff8a6fa0";
    pair_item_rtv.item_id = 2;
    pair_item_rtv.rtv_id = 3;
    return pair_item_rtv;
  }

  private get_dummy_item_module(name : string) : ItemModule {
    let item_module : ItemModule = new ItemModule();
    item_module.id               = 1;
    item_module.description      = name;
    item_module.module_type_id   = 1;
    item_module.module_type_desc = "module description";
    item_module.ip               = "ip";
    item_module.port_http        = 80;
    item_module.port_https       = 443;
    item_module.port_item        = 9889;
    item_module.port_webcontrol  = 9880;
    return item_module;
  }

  private get_dummy_item_module_list() : ItemModule[] {
    return [this.get_dummy_item_module("module test")];
  }

  private get_dummy_rtv() : RTVModule[] {
    return [this.get_dummy_item_module("rtv test")];
  }

  public get_vacenters_by_user(guid : string) : Promise<VACenterList> {
    if( guid == this.wrong_locator ){
      return Promise.reject( null )
    }else{
      const item : any = { guid: "51a0f468-b179-403b-b8b9-338c8f332792", name: 'test'};
      return Promise.resolve({
        user_guid: "35c166d9-f30a-4dad-b5e4-27a4d205d392",
        vacenter_list: [item]
      });
    }
  }
  public get_item_by_vacenter(guid: string) : Promise<PairItemRTV> {
    return Promise.resolve( this.get_dummy_pair_item_rtv() )
  }
  public get_item_by_branch(guid : string) :  Promise<PairItemRTV> {
    if( guid == this.wrong_locator ){
      return Promise.reject( null )
    }else{
      return Promise.resolve( this.get_dummy_pair_item_rtv() )
    }
  }
  public get_item_by_campaign(guid : string) :  Promise<PairItemRTV> {
    return Promise.resolve( this.get_dummy_pair_item_rtv() )

  }
  public get_rtv_by_id( id? : number ) : Promise<RTVModule[]> {
    return Promise.resolve( this.get_dummy_rtv() )

  }
  public get_item_by_id( id? : number ) : Promise<ItemModule[]> {
    return Promise.resolve( this.get_dummy_item_module_list() )

  }


}

describe('item controller module tests', () => {

  let item_service         : ItemServiceStub;
  let item_controller      : ItemController;

  before(() => {
    item_service = new ItemServiceStub();
    item_controller = new ItemController(item_service, new WLogger())
  });

  function get_expeted_item() : { [id: string]: any; }{
    const json_response : any = {
      result: 'ok',
      item: {
        id: 1,
        desc: "module test"
      },
      rtv: {
        id: 1,
        desc: "rtv test"
      },
      elements: [
        {
          item_id: 1,
          item: 9889,
          webcontrol: 9880,
          desc: 'module test',
          type: { id: 1, desc: "module description"},
          ip: 'ip',
          port: {http:80, https:443}
        }
      ]
    }
    return json_response;
  }

  describe('Testing get_item_by_branch',  () => {

    it('Given Branch ID in event request When Requiring Item Then Item is properly returned in expected format', () => {
      let request = mockReq({
          data : {
              event:"get_item_by_branch",
              id:"23290b6d-693b-44c3-9dd1-f4fef0b5c9a3"
          }
      });
      request.request_type = RequestType.JSON;
      let response = mockRes();
      const promise : Promise<{ [id: string]: any; }> =
        item_controller.handle_event(request, response);
      return promise.then( () => {
        //console.log(response.jsonp.getCall(0).args[0]);
        //console.log(response.json.getCall(0).args[0].elements[0]);
        response.status.should.have.been.calledWith(200);
        response.jsonp.should.have.been.calledWith(get_expeted_item());
      })
    });

    it('Given Branch ID in API request When Requiring Item Then Item is properly returned in expected format', () => {
      let request = mockReq({
          data : {
              event:"api",
              e : "get_item_by_branch",
              id:"23290b6d-693b-44c3-9dd1-f4fef0b5c9a3"
          }
      });
      request.request_type = RequestType.JSON;
      let response = mockRes();
      const promise : Promise<{ [id: string]: any; }> =
        item_controller.handle_event(request, response);
      return promise.catch( () => {
        response.status.should.have.been.calledWith(400);
        response.jsonp.should.have.been.calledWith(get_expeted_item());
      })
    });

    it('Given Wrong Data in API request When Requiring Item Then Error is raised', () => {
      const wrong_data = {
          //event:"api",
          e : "get_item_by_branch",
          id:"23290b6d-693b-44c3-9dd1-f4fef0b5c9a3"
      }
      let request = mockReq({
          data : wrong_data
      });
      request.request_type = RequestType.JSON;
      let response = mockRes();
      const promise : Promise<{ [id: string]: any; }> =
        item_controller.handle_event(request, response);
      return promise.catch( () => {
        response.status.should.have.been.calledWith(400);
        response.jsonp.should.have.been.calledWith({
           result: 'ko',
           message: 'Missing parameters:'+JSON.stringify(wrong_data),
           resultcode:400
        });

      })
    });

    it('Given Wrong Data When Requiring Item Then Error is raised', () => {
      const wrong_data = {
          event:"api",
          e : "get_item_by_branch",
          //id:"23290b6d-693b-44c3-9dd1-f4fef0b5c9a3"
      }
      let request = mockReq({
          data : wrong_data
      });
      request.request_type = RequestType.JSON;
      let response = mockRes();
      const promise : Promise<{ [id: string]: any; }> =
        item_controller.handle_event(request, response);
      return promise.catch( () => {
        response.status.should.have.been.calledWith(400);
        response.jsonp.should.have.been.calledWith({
           result: 'ko',
           message: 'Missing parameters:'+JSON.stringify(wrong_data),
           resultcode:400
        });

      })
    });

    it('Given Wrong Branch ID in event request When Requiring Item Then Error is returned', () => {
      let request = mockReq({
          data : {
              event:"get_item_by_branch",
              id: item_service.wrong_locator
          }
      });
      request.request_type = RequestType.JSON;

      let response = mockRes();
      const promise : Promise<{ [id: string]: any; }> =
        item_controller.handle_event(request, response);
      return promise.then( () => {
      }).catch( () => {
        response.status.should.have.been.calledWith(400);
        response.jsonp.should.have.been.calledWith({
          result: "ko",
          message: 'Locator not found:'+item_service.wrong_locator,
          resultcode:402
        });

      })
    });

  })

  describe('Testing get_item_by_campaign',  () => {

    it('Given Campaign ID When Requiring Item Then Item is properly returned in expected format', () => {
      let request = mockReq({
          data : {
              event:"get_item_by_campaign",
              id:"23290b6d-693b-44c3-9dd1-f4fef0b5c9a3"
          }
      });
      request.request_type = RequestType.JSON;

      let response = mockRes();
      const promise : Promise<{ [id: string]: any; }> =
        item_controller.handle_event(request, response);
      return promise.then( () => {
        response.status.should.have.been.calledWith(200);
        response.jsonp.should.have.been.calledWith(get_expeted_item());
      })
    });

  })

  describe('Testing get_item_by_vacenter',  () => {

    it('Given VACenter ID When Requiring Item Then Item is properly returned in expected format', () => {
      let request = mockReq({
          data : {
              event:"get_item_by_vacenter",
              id:"23290b6d-693b-44c3-9dd1-f4fef0b5c9a3"
          }
      });
      request.request_type = RequestType.JSON;

      let response = mockRes();
      const promise : Promise<{ [id: string]: any; }> =
        item_controller.handle_event(request, response);
      return promise.then( () => {
        response.status.should.have.been.calledWith(200);
        response.jsonp.should.have.been.calledWith(get_expeted_item());
      })
    });

  });


  describe('Testing get_vacenters_by_user',  () => {

    it('Given User ID When Requiring VACenterList Then VACenterList is returned', () => {
      let request = mockReq({
          data : {
              event:"get_vacenters_by_user",
              id:"23290b6d-693b-44c3-9dd1-f4fef0b5c9a3"
          }
      });
      request.request_type = RequestType.JSON;

      let response = mockRes();
      const promise : Promise<{ [id: string]: any; }> =
        item_controller.handle_event(request, response);
      return promise.then( () => {
        response.status.should.have.been.calledWith(200);
        response.jsonp.should.have.been.calledWith({
          result: "ok",
          user_guid: "35c166d9-f30a-4dad-b5e4-27a4d205d392",
          elements: [
            { guid: "51a0f468-b179-403b-b8b9-338c8f332792", name: "test" }
          ]
        });
      })
    });

    it('Given Wrong User ID in event request When Requiring Item Then Error is returned', () => {
      let request = mockReq({
          data : {
              event:"get_vacenters_by_user",
              id: item_service.wrong_locator
          }
      });
      request.request_type = RequestType.JSON;

      let response = mockRes();
      const promise : Promise<{ [id: string]: any; }> =
        item_controller.handle_event(request, response);
      return promise.then( () => {
      }).catch( () => {
        response.status.should.have.been.calledWith(400);
        response.jsonp.should.have.been.calledWith({
          result: "ko",
          message: 'Locator not found:'+item_service.wrong_locator,
          resultcode:402
        });

      })
    });

  });




});
