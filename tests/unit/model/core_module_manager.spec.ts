import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as uuid from 'uuid';

import { Models } from '../../../src/models/model';
import { LocalDataStore } from '../../../src/service/datastore';
import { CoreModuleManager, CoreModule, RTVModule, PairCoreRTV,VACenterList } from '../../../src/models/core_module_manager';
import { LoggerInstance, transports, LoggerOptions, WLogger } from '../../../src/utils/logger';
import * as Sequelize from 'sequelize';
import { ModelsStub } from './fixtures.spec'

var should = chai.should();
var assert = chai.assert;
var expect = chai.expect;
chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('core service DB module tests', () => {

  let model         : ModelsStub;
  let data_store    : LocalDataStore;
  let core_module_manager  : CoreModuleManager;
  const wrong_guid  : string = uuid();

  before(() => {
    model = new ModelsStub("configuration","","",
    {
      dialect: 'sqlite',
      // disable logging; default: console.log
      logging: false
    });
    core_module_manager = new CoreModuleManager(model, new WLogger());

    // Generate entities
    return model.sync();
  });


  describe('Testing get_db_core_by_id',  () => {

    /*
     * function to check core module list
     */
    function check_core_module( core_module_list : CoreModule[] ){
      core_module_list.length.should.greaterThan(1)
      for (let core_module of core_module_list) {
        core_module.description.should.equal('dummy cores')
        core_module.ip.should.equal( model.ip )
        core_module.port_http.should.equal( model.webport )
        core_module.port_https.should.equal( model.secure_webport )
        core_module.port_core.should.equal( model.core_port )
        core_module.port_webcontrol.should.equal( model.webcontrol_port );
      }
    }



    it('Given Empty CORE ID When Requiring All Cores Then Core is returned', () => {
      return core_module_manager.get_db_core_by_id().then( (core_module_list : CoreModule[])  => {
        check_core_module(core_module_list)
      });
    });

    it('Given Core ID When Requiring Core Then Core is returned', () => {
      return core_module_manager.get_db_core_by_id(1).then( (core_module_list : CoreModule[]) => {
        check_core_module(core_module_list)
      });
    });

    it('Given Wrong Core ID When Requiring Core Then Core is not returned', () => {
      return core_module_manager.get_db_core_by_id(2).then( (core_module_list : CoreModule[]) => {
        assert(false, "Should reject promise")
      }).catch( (core_module_list : CoreModule[]) => {
        core_module_list.length.should.equal(0)
      });
    });

  });


  describe('Testing get_db_rtv_by_id',  () => {

    //
    // function to check core rtv
    //
    function check_rtv_module(core_module: CoreModule, expectedId: number, expectedName: string) {
      expect(core_module.id).to.equal(expectedId);
      core_module.description.should.equal(expectedName);
      core_module.ip.should.equal(model.ip);
      core_module.port_http.should.equal(model.webport);
      core_module.port_https.should.equal(model.secure_webport);
      core_module.port_core.should.equal(model.core_port);
      core_module.port_webcontrol.should.equal(model.webcontrol_port);
    }

    it('returns all RTVs if no ID is provided', () => {
      return core_module_manager.get_db_rtv_by_id().then( (rtv_module_list : RTVModule[]) => {
        rtv_module_list.length.should.equal(2);
        check_rtv_module(rtv_module_list[0], 4, 'dummy rtv 1');
        check_rtv_module(rtv_module_list[1], 5, 'dummy rtv 2');

      });
    });

    it('returns the correct RTV if ID is provided', () => {
      return core_module_manager.get_db_rtv_by_id(4).then( (rtv_module_list : RTVModule[]) => {
        rtv_module_list.length.should.equal(1);
        check_rtv_module(rtv_module_list[0], 4, 'dummy rtv 1');
      });
    });

    it('returns reject RTV if wrong ID is provided', () => {
      return core_module_manager.get_db_rtv_by_id(6).then( (rtv_module_list : RTVModule[]) => {
        assert(false, "Should reject promise")
      }).catch( (core_module_list : CoreModule[]) => {
        core_module_list.length.should.equal(0)
      });
    });

  });


  describe('Testing get_db_core_by_branch',  () => {

    it('returns core by branch provided', () => {
      return core_module_manager.get_db_core_by_branch( model.branch_guid ).then( (pair_core_rtv : PairCoreRTV)  => {
        pair_core_rtv.should.be.an('object')
        pair_core_rtv.core_locator.should.equal('branch')
        pair_core_rtv.core_locator_id.should.equal(model.branch_guid)
        pair_core_rtv.core_id.should.equal(model.core_id)
        pair_core_rtv.rtv_id.should.equal(model.rtv_id)
      });
    });

    it('returns null as wrong guid', () => {
      return core_module_manager.get_db_core_by_branch( wrong_guid ).then( (pair_core_rtv : PairCoreRTV)  => {
        assert(false, "Should reject promise")
      }).catch( (pair_core_rtv : PairCoreRTV) => {
        should.not.exist(pair_core_rtv);
      });

    });

  });


  describe('Testing get_db_core_by_campaign',  () => {

    it('returns core by campaign provided', () => {
      return core_module_manager.get_db_core_by_campaign( model.campaign_guid ).then( (pair_core_rtv : PairCoreRTV)  => {
        pair_core_rtv.should.be.an('object')
        pair_core_rtv.core_locator.should.equal('campaign')
        pair_core_rtv.core_locator_id.should.equal(model.campaign_guid)
        pair_core_rtv.core_id.should.equal(model.core_id)
        pair_core_rtv.rtv_id.should.equal(model.rtv_id)
      });
    });

    it('returns null as wrong guid', () => {
      return core_module_manager.get_db_core_by_campaign( wrong_guid ).then( (pair_core_rtv : PairCoreRTV)  => {
        assert(false, "Should reject promise")
      }).catch( (pair_core_rtv : PairCoreRTV) => {
        should.not.exist(pair_core_rtv);
      });

    });

  });


  describe('Testing get_db_core_by_vacenter',  () => {

    it('returns core by campaign provided', () => {
      return core_module_manager.get_db_vacenters_by_user( model.user_guid ).then((vacenter_list : VACenterList)  => {
        vacenter_list.user_guid.should.equal( model.user_guid )
        vacenter_list.vacenter_list.length.should.equal(1)
        vacenter_list.vacenter_list[0].guid.should.equal(model.vacenter_guid)
      });
    });

    it('returns null as wrong guid', () => {
      return core_module_manager.get_db_core_by_vacenter( wrong_guid ).then( (pair_core_rtv : PairCoreRTV)  => {
        assert(false, "Should reject promise")
      }).catch( (pair_core_rtv : PairCoreRTV) => {
        should.not.exist(pair_core_rtv);
      });

    });

  });



});
