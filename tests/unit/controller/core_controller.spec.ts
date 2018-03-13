import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as uuid from 'uuid';
import { mockReq, mockRes } from 'sinon-express-mock';
import * as Sequelize from 'sequelize';

import { PairCoreRTV,
          CoreModule,
          RTVModule,
          VACenter,
          VACenterList,
          ICoreModuleManager } from '../../../src/models/core_module_manager';
import { ICoreService } from '../../../src/service/core_service';
import { LoggerInstance, transports, LoggerOptions, WLogger } from '../../../src/utils/logger';
import { CoreController, RequestType } from '../../../src/controller/core_controller';

var should = chai.should();
var assert = chai.assert;
var expect = chai.expect;
chai.use(chaiAsPromised);
chai.use(sinonChai);


class CoreServiceStub implements ICoreService {

  public wrong_locator : string = "18d37ab9-acb7-498a-9fc1-c258e8c82418";


  private get_dummy_pair_core_rtv() : PairCoreRTV {
    let pair_core_rtv : PairCoreRTV = new PairCoreRTV("test");
    pair_core_rtv.core_locator_id = "fb1f42c5-3e4c-4b9e-9dd4-bdb7ff8a6fa0";
    pair_core_rtv.core_id = 2;
    pair_core_rtv.rtv_id = 3;
    return pair_core_rtv;
  }

  private get_dummy_core_module(name : string) : CoreModule {
    let core_module : CoreModule = new CoreModule();
    core_module.id               = 1;
    core_module.description      = name;
    core_module.module_type_id   = 1;
    core_module.module_type_desc = "module description";
    core_module.ip               = "ip";
    core_module.port_http        = 80;
    core_module.port_https       = 443;
    core_module.port_core        = 9889;
    core_module.port_webcontrol  = 9880;
    return core_module;
  }

  private get_dummy_core_module_list() : CoreModule[] {
    return [this.get_dummy_core_module("module test")];
  }

  private get_dummy_rtv() : RTVModule[] {
    return [this.get_dummy_core_module("rtv test")];
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
  public get_core_by_vacenter(guid: string) : Promise<PairCoreRTV> {
    return Promise.resolve( this.get_dummy_pair_core_rtv() )
  }
  public get_core_by_branch(guid : string) :  Promise<PairCoreRTV> {
    if( guid == this.wrong_locator ){
      return Promise.reject( null )
    }else{
      return Promise.resolve( this.get_dummy_pair_core_rtv() )
    }
  }
  public get_core_by_campaign(guid : string) :  Promise<PairCoreRTV> {
    return Promise.resolve( this.get_dummy_pair_core_rtv() )

  }
  public get_rtv_by_id( id? : number ) : Promise<RTVModule[]> {
    return Promise.resolve( this.get_dummy_rtv() )

  }
  public get_core_by_id( id? : number ) : Promise<CoreModule[]> {
    return Promise.resolve( this.get_dummy_core_module_list() )

  }


}

describe('core controller module tests', () => {

  let core_service         : CoreServiceStub;
  let core_controller      : CoreController;

  before(() => {
    core_service = new CoreServiceStub();
    core_controller = new CoreController(core_service, new WLogger())
  });

  function get_expeted_core() : { [id: string]: any; }{
    const json_response : any = {
      result: 'ok',
      core: {
        id: 1,
        desc: "module test"
      },
      rtv: {
        id: 1,
        desc: "rtv test"
      },
      elements: [
        {
          core_id: 1,
          core: 9889,
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

  describe('Testing get_core_by_branch',  () => {

    it('Given Branch ID in event request When Requiring Core Then Core is properly returned in expected format', () => {
      let request = mockReq({
          data : {
              event:"get_core_by_branch",
              id:"23290b6d-693b-44c3-9dd1-f4fef0b5c9a3"
          }
      });
      request.request_type = RequestType.JSON;
      let response = mockRes();
      const promise : Promise<{ [id: string]: any; }> =
        core_controller.handle_event(request, response);
      return promise.then( () => {
        //console.log(response.jsonp.getCall(0).args[0]);
        //console.log(response.json.getCall(0).args[0].elements[0]);
        response.status.should.have.been.calledWith(200);
        response.jsonp.should.have.been.calledWith(get_expeted_core());
      })
    });

    it('Given Branch ID in API request When Requiring Core Then Core is properly returned in expected format', () => {
      let request = mockReq({
          data : {
              event:"api",
              e : "get_core_by_branch",
              id:"23290b6d-693b-44c3-9dd1-f4fef0b5c9a3"
          }
      });
      request.request_type = RequestType.JSON;
      let response = mockRes();
      const promise : Promise<{ [id: string]: any; }> =
        core_controller.handle_event(request, response);
      return promise.catch( () => {
        response.status.should.have.been.calledWith(400);
        response.jsonp.should.have.been.calledWith(get_expeted_core());
      })
    });

    it('Given Wrong Data in API request When Requiring Core Then Error is raised', () => {
      const wrong_data = {
          //event:"api",
          e : "get_core_by_branch",
          id:"23290b6d-693b-44c3-9dd1-f4fef0b5c9a3"
      }
      let request = mockReq({
          data : wrong_data
      });
      request.request_type = RequestType.JSON;
      let response = mockRes();
      const promise : Promise<{ [id: string]: any; }> =
        core_controller.handle_event(request, response);
      return promise.catch( () => {
        response.status.should.have.been.calledWith(400);
        response.jsonp.should.have.been.calledWith({
           result: 'ko',
           message: 'Missing parameters:'+JSON.stringify(wrong_data),
           resultcode:400
        });

      })
    });

    it('Given Wrong Data When Requiring Core Then Error is raised', () => {
      const wrong_data = {
          event:"api",
          e : "get_core_by_branch",
          //id:"23290b6d-693b-44c3-9dd1-f4fef0b5c9a3"
      }
      let request = mockReq({
          data : wrong_data
      });
      request.request_type = RequestType.JSON;
      let response = mockRes();
      const promise : Promise<{ [id: string]: any; }> =
        core_controller.handle_event(request, response);
      return promise.catch( () => {
        response.status.should.have.been.calledWith(400);
        response.jsonp.should.have.been.calledWith({
           result: 'ko',
           message: 'Missing parameters:'+JSON.stringify(wrong_data),
           resultcode:400
        });

      })
    });

    it('Given Wrong Branch ID in event request When Requiring Core Then Error is returned', () => {
      let request = mockReq({
          data : {
              event:"get_core_by_branch",
              id: core_service.wrong_locator
          }
      });
      request.request_type = RequestType.JSON;

      let response = mockRes();
      const promise : Promise<{ [id: string]: any; }> =
        core_controller.handle_event(request, response);
      return promise.then( () => {
      }).catch( () => {
        response.status.should.have.been.calledWith(400);
        response.jsonp.should.have.been.calledWith({
          result: "ko",
          message: 'Locator not found:'+core_service.wrong_locator,
          resultcode:402
        });

      })
    });

  })

  describe('Testing get_core_by_campaign',  () => {

    it('Given Campaign ID When Requiring Core Then Core is properly returned in expected format', () => {
      let request = mockReq({
          data : {
              event:"get_core_by_campaign",
              id:"23290b6d-693b-44c3-9dd1-f4fef0b5c9a3"
          }
      });
      request.request_type = RequestType.JSON;

      let response = mockRes();
      const promise : Promise<{ [id: string]: any; }> =
        core_controller.handle_event(request, response);
      return promise.then( () => {
        response.status.should.have.been.calledWith(200);
        response.jsonp.should.have.been.calledWith(get_expeted_core());
      })
    });

  })

  describe('Testing get_core_by_vacenter',  () => {

    it('Given VACenter ID When Requiring Core Then Core is properly returned in expected format', () => {
      let request = mockReq({
          data : {
              event:"get_core_by_vacenter",
              id:"23290b6d-693b-44c3-9dd1-f4fef0b5c9a3"
          }
      });
      request.request_type = RequestType.JSON;

      let response = mockRes();
      const promise : Promise<{ [id: string]: any; }> =
        core_controller.handle_event(request, response);
      return promise.then( () => {
        response.status.should.have.been.calledWith(200);
        response.jsonp.should.have.been.calledWith(get_expeted_core());
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
        core_controller.handle_event(request, response);
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

    it('Given Wrong User ID in event request When Requiring Core Then Error is returned', () => {
      let request = mockReq({
          data : {
              event:"get_vacenters_by_user",
              id: core_service.wrong_locator
          }
      });
      request.request_type = RequestType.JSON;

      let response = mockRes();
      const promise : Promise<{ [id: string]: any; }> =
        core_controller.handle_event(request, response);
      return promise.then( () => {
      }).catch( () => {
        response.status.should.have.been.calledWith(400);
        response.jsonp.should.have.been.calledWith({
          result: "ko",
          message: 'Locator not found:'+core_service.wrong_locator,
          resultcode:402
        });

      })
    });

  });




});
