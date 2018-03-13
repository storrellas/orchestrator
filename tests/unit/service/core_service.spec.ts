import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as uuid from 'uuid';

import { Models } from '../../../src/models/model';
import { LocalDataStore } from '../../../src/service/datastore';
import { ICoreModuleManager,
          CoreModule,
          RTVModule,
          PairCoreRTV,
          VACenterList } from '../../../src/models/core_module_manager';
import { CoreService } from '../../../src/service/core_service';
import { LoggerInstance, transports, LoggerOptions, WLogger } from '../../../src/utils/logger';
import * as Sequelize from 'sequelize';
import { ModelsStub } from '../model/fixtures.spec'
import { CoreModuleManagerStub } from './core_service.stub'

var should = chai.should();
var assert = chai.assert;
var expect = chai.expect;
chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('core service module tests', () => {

  let model                : ModelsStub;
  let data_store           : LocalDataStore;
  let core_module_manager  : ICoreModuleManager;
  let core_service         : CoreService;
  const wrong_guid         : string = uuid();
  const wrong_rtv_id       : number = 6;

  before(() => {
    model = new ModelsStub("configuration","","",
    {
      dialect: 'sqlite',
      // disable logging; default: console.log
      logging: false
    });
    data_store = new LocalDataStore(new WLogger());
    core_module_manager = new CoreModuleManagerStub(wrong_rtv_id);
    core_service = new CoreService(core_module_manager, data_store, new WLogger());

    // Generate entities
    return model.sync();
  });

  describe('Testing get_vacenters_by_user',  () => {

    it('Given User When Requiring VACenters Then VACenterList is returned and cached', () => {

      let key = {"get_vacenters_by_user": model.user_guid};
      // Check register is not in cache beforehand
      data_store.get( JSON.stringify(key) )
      .then( (value : any) => {
        assert(false, "Register found in cached while it shouldnt be")
      }).catch( () => {
        assert(true, "OK!")

        // Retrieve core by id
        core_service.get_vacenters_by_user(model.user_guid)
        .then( (vacenter_list : VACenterList) => {
          data_store.get( JSON.stringify(key) )
          .then( (value : any) => {
            value.should.equal( vacenter_list )
          }).catch( () => {
            assert(false, "ERROR")
          });

        }).catch( () => {
          assert(false, "ERROR")
        })

      });

    });

  });


  describe('Testing get_core_by_vacenter',  () => {

    it('Given VACenter When Requiring Core Then PairCoreRTV is returned and cached', () => {

      let key = {get_core_by_vacenter: model.vacenter_guid};
      // Check register is not in cache beforehand
      data_store.get( JSON.stringify(key) )
      .then( (value : any) => {
        assert(false, "Register found in cached while it shouldnt be")
      }).catch( () => {
        assert(true, "OK!")

        // Retrieve core by id
        core_service.get_core_by_vacenter(model.vacenter_guid)
        .then( (pair_core_rtv : PairCoreRTV) => {
          data_store.get( JSON.stringify(key) )
          .then( (value : any) => {
            value.should.equal( pair_core_rtv )
          }).catch( () => {
            assert(false, "ERROR")
          });

        }).catch( () => {
          assert(false, "ERROR")
        })

      });

    });

    it('Given Branch When Requiring Core Then PairCoreRTV is returned and cached', () => {

      let key = {get_core_by_branch: model.branch_guid};
      // Check register is not in cache beforehand
      data_store.get( JSON.stringify(key) )
      .then( (value : any) => {
        assert(false, "Register found in cached while it shouldnt be")
      }).catch( () => {
        assert(true, "OK!")

        // Retrieve core by id
        core_service.get_core_by_branch(model.branch_guid)
        .then( (pair_core_rtv : PairCoreRTV) => {
          data_store.get( JSON.stringify(key) )
          .then( (value : any) => {
            value.should.equal( pair_core_rtv )
          }).catch( () => {
            assert(false, "ERROR")
          });

        }).catch( () => {
          assert(false, "ERROR")
        })

      });

    });

    it('Given Campaign When Requiring Core Then PairCoreRTV is returned and cached', () => {

      let key = {get_core_by_campaign: model.campaign_guid};
      // Check register is not in cache beforehand
      data_store.get( JSON.stringify(key) )
      .then( (value : any) => {
        assert(false, "Register found in cached while it shouldnt be")
      }).catch( () => {
        assert(true, "OK!")

        // Retrieve core by id
        core_service.get_core_by_campaign(model.campaign_guid)
        .then( (pair_core_rtv : PairCoreRTV) => {
          data_store.get( JSON.stringify(key) )
          .then( (value : any) => {
            value.should.equal( pair_core_rtv )
          }).catch( () => {
            assert(false, "ERROR")
          });

        }).catch( () => {
          assert(false, "ERROR")
        })

      });

    });

  });


});
