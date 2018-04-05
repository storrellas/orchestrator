import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as uuid from 'uuid';

import { Models } from '../../../src/models/model';
import { LocalDataStore } from '../../../src/service/datastore';
import { CoreModuleManager, CoreModule, RTVModule, PairCoreRTV,VACenterList } from '../../../src/models/item_module_manager';
import { LoggerInstance, transports, LoggerOptions, WLogger } from '../../../src/utils/logger';
import * as Sequelize from 'sequelize';
import { ModelsStub } from './fixtures.spec'

var should = chai.should();
var assert = chai.assert;
var expect = chai.expect;
chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('item service DB module tests', () => {

  let model         : ModelsStub;
  let data_store    : LocalDataStore;
  let item_module_manager  : CoreModuleManager;
  const wrong_guid  : string = uuid();

  before(() => {
    model = new ModelsStub("configuration","","",
    {
      dialect: 'sqlite',
      // disable logging; default: console.log
      logging: false
    });
    item_module_manager = new CoreModuleManager(model, new WLogger());

    // Generate entities
    return model.sync();
  });


  describe('Testing get_db_item_by_id',  () => {

    /*
     * function to check item module list
     */
    function check_item_module( item_module_list : CoreModule[] ){
      item_module_list.length.should.greaterThan(1)
      for (let item_module of item_module_list) {
        item_module.description.should.equal('dummy items')
        item_module.ip.should.equal( model.ip )
        item_module.port_http.should.equal( model.webport )
        item_module.port_https.should.equal( model.secure_webport )
        item_module.port_item.should.equal( model.item_port )
        item_module.port_webcontrol.should.equal( model.webcontrol_port );
      }
    }



    it('Given Empty CORE ID When Requiring All Cores Then Core is returned', () => {
      return item_module_manager.get_db_item_by_id().then( (item_module_list : CoreModule[])  => {
        check_item_module(item_module_list)
      });
    });

    it('Given Core ID When Requiring Core Then Core is returned', () => {
      return item_module_manager.get_db_item_by_id(1).then( (item_module_list : CoreModule[]) => {
        check_item_module(item_module_list)
      });
    });

    it('Given Wrong Core ID When Requiring Core Then Core is not returned', () => {
      return item_module_manager.get_db_item_by_id(2).then( (item_module_list : CoreModule[]) => {
        assert(false, "Should reject promise")
      }).catch( (item_module_list : CoreModule[]) => {
        item_module_list.length.should.equal(0)
      });
    });

  });


  describe('Testing get_db_rtv_by_id',  () => {

    //
    // function to check item rtv
    //
    function check_rtv_module(item_module: CoreModule, expectedId: number, expectedName: string) {
      expect(item_module.id).to.equal(expectedId);
      item_module.description.should.equal(expectedName);
      item_module.ip.should.equal(model.ip);
      item_module.port_http.should.equal(model.webport);
      item_module.port_https.should.equal(model.secure_webport);
      item_module.port_item.should.equal(model.item_port);
      item_module.port_webcontrol.should.equal(model.webcontrol_port);
    }

    it('returns all RTVs if no ID is provided', () => {
      return item_module_manager.get_db_rtv_by_id().then( (rtv_module_list : RTVModule[]) => {
        rtv_module_list.length.should.equal(2);
        check_rtv_module(rtv_module_list[0], 4, 'dummy rtv 1');
        check_rtv_module(rtv_module_list[1], 5, 'dummy rtv 2');

      });
    });

    it('returns the correct RTV if ID is provided', () => {
      return item_module_manager.get_db_rtv_by_id(4).then( (rtv_module_list : RTVModule[]) => {
        rtv_module_list.length.should.equal(1);
        check_rtv_module(rtv_module_list[0], 4, 'dummy rtv 1');
      });
    });

    it('returns reject RTV if wrong ID is provided', () => {
      return item_module_manager.get_db_rtv_by_id(6).then( (rtv_module_list : RTVModule[]) => {
        assert(false, "Should reject promise")
      }).catch( (item_module_list : CoreModule[]) => {
        item_module_list.length.should.equal(0)
      });
    });

  });


  describe('Testing get_db_item_by_branch',  () => {

    it('returns item by branch provided', () => {
      return item_module_manager.get_db_item_by_branch( model.branch_guid ).then( (pair_item_rtv : PairCoreRTV)  => {
        pair_item_rtv.should.be.an('object')
        pair_item_rtv.item_locator.should.equal('branch')
        pair_item_rtv.item_locator_id.should.equal(model.branch_guid)
        pair_item_rtv.item_id.should.equal(model.item_id)
        pair_item_rtv.rtv_id.should.equal(model.rtv_id)
      });
    });

    it('returns null as wrong guid', () => {
      return item_module_manager.get_db_item_by_branch( wrong_guid ).then( (pair_item_rtv : PairCoreRTV)  => {
        assert(false, "Should reject promise")
      }).catch( (pair_item_rtv : PairCoreRTV) => {
        should.not.exist(pair_item_rtv);
      });

    });

  });


  describe('Testing get_db_item_by_campaign',  () => {

    it('returns item by campaign provided', () => {
      return item_module_manager.get_db_item_by_campaign( model.campaign_guid ).then( (pair_item_rtv : PairCoreRTV)  => {
        pair_item_rtv.should.be.an('object')
        pair_item_rtv.item_locator.should.equal('campaign')
        pair_item_rtv.item_locator_id.should.equal(model.campaign_guid)
        pair_item_rtv.item_id.should.equal(model.item_id)
        pair_item_rtv.rtv_id.should.equal(model.rtv_id)
      });
    });

    it('returns null as wrong guid', () => {
      return item_module_manager.get_db_item_by_campaign( wrong_guid ).then( (pair_item_rtv : PairCoreRTV)  => {
        assert(false, "Should reject promise")
      }).catch( (pair_item_rtv : PairCoreRTV) => {
        should.not.exist(pair_item_rtv);
      });

    });

  });


  describe('Testing get_db_item_by_vacenter',  () => {

    it('returns item by campaign provided', () => {
      return item_module_manager.get_db_vacenters_by_user( model.user_guid ).then((vacenter_list : VACenterList)  => {
        vacenter_list.user_guid.should.equal( model.user_guid )
        vacenter_list.vacenter_list.length.should.equal(1)
        vacenter_list.vacenter_list[0].guid.should.equal(model.vacenter_guid)
      });
    });

    it('returns null as wrong guid', () => {
      return item_module_manager.get_db_item_by_vacenter( wrong_guid ).then( (pair_item_rtv : PairCoreRTV)  => {
        assert(false, "Should reject promise")
      }).catch( (pair_item_rtv : PairCoreRTV) => {
        should.not.exist(pair_item_rtv);
      });

    });

  });



});
