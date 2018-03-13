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
  const core_id            : number = 1;
  const rtv_id             : number = 4;


  before(() => {
    data_store = new LocalDataStore(new WLogger());
    core_module_manager = new CoreModuleManagerStub(wrong_rtv_id);
    core_service = new CoreService(core_module_manager, data_store, new WLogger());
  });

  describe('Testing get_core_by_id',  () => {

    it('Given No CORE ID When Requiring All Cores Then Core is returned and cached', () => {

      let key = {"get_core_by_id": 0};
      // Check register is not in cache beforehand
      data_store.get( JSON.stringify(key) )
      .then( (value : any) => {
        assert(false, "Register found in cached while it shouldnt be")
      }).catch( () => {
        assert(true, "OK!")

        // Retrieve core by id
        core_service.get_core_by_id()
        .then( (core_module_list : CoreModule[]) => {

          data_store.get( JSON.stringify(key) )
          .then( (value : any) => {
            value.should.equal( core_module_list )
          }).catch( () => {
            assert(false, "ERROR")
          });

        }).catch( () => {
          assert(false, "ERROR")
        })

      });

    });


    it('Given CORE ID When Requiring Core Then Core is returned and cached', () => {

      let key = {"get_core_by_id": core_id};
      // Check register is not in cache beforehand
      data_store.get( JSON.stringify(key) )
      .then( (value : any) => {
        assert(false, "Register found in cached while it shouldnt be")
      }).catch( () => {
        assert(true, "OK!")

        // Retrieve core by id
        core_service.get_core_by_id(core_id)
        .then( (core_module_list : CoreModule[]) => {

          // Check data_store is cached
          data_store.get( JSON.stringify(key) )
          .then( (value : any) => {
            value.should.equal( core_module_list )
            // Get from cache
            return core_service.get_core_by_id(core_id)
          }).catch( () => {
            assert(false, "ERROR ---->")
          })
          .then( (value:any) => {
            value.should.equal( core_module_list )
          });

        }).catch( () => {
          assert(false, "ERROR")
        })

      });

    });

    it('Given Wrong CORE ID When Requiring CORE Then No Results and no cached', () => {

      let key = {"get_core_by_id": 2};
      // Retrieve core by id
      core_service.get_rtv_by_id(2)
      .then( (rtv_list : CoreModule[]) => {
        assert(false, "ERROR")
      })
      .catch( () => {
        assert(true, "OK")
        data_store.get( JSON.stringify(key) )
        .then( (value : any) => {
          value.should.equal('')
        }).catch( () => {
          assert(false, "ERROR")
        });

      })

    });

  });


  describe('Testing get_rtv_by_id',  () => {

    it('Given NO RTV ID When Requiring All RTV Then All RTV is returned and cached', () => {

      let key = {"get_rtv_by_id": 0};
      // Check register is not in cache beforehand
      data_store.get( JSON.stringify(key) )
      .then( (value : any) => {
        assert(false, "Register found in cached while it shouldnt be")
      }).catch( () => {

        // Retrieve core by id
        core_service.get_rtv_by_id()
        .then( (rtv_list : RTVModule[]) => {

          data_store.get( JSON.stringify(key) )
          .then( (value : any) => {
            value.should.equal( rtv_list )
          }).catch( () => {
            assert(false, "ERROR -- ")
          });

        }).catch( () => {
          assert(false, "ERROR")
        })

      });
    });


    it('Given RTV ID When Requiring All RTV Then RTV is returned and cached', () => {

      let key = {"get_rtv_by_id": rtv_id};
      // Check register is not in cache beforehand
      data_store.get( JSON.stringify(key) )
      .then( (value : any) => {
        assert(false, "Register found in cached while it shouldnt be")
      }).catch( () => {

        // Retrieve core by id
        core_service.get_rtv_by_id(4)
        .then( (rtv_list : RTVModule[]) => {

          data_store.get( JSON.stringify(key) )
          .then( (value : any) => {
            value.should.equal( rtv_list )
          }).catch( () => {
            assert(false, "ERROR -- ")
          });

        }).catch( () => {
          assert(false, "ERROR")
        })

      });
    });

    it('Given Wrong RTV ID When Requiring All Cores Then No Results and no cached', () => {

      let key = {"get_rtv_by_id": wrong_rtv_id};
      // Retrieve core by id
      core_service.get_rtv_by_id(wrong_rtv_id)
      .then( (rtv_list : RTVModule[]) => {
        assert(false, "ERROR")
      })
      .catch( () => {
        data_store.get( JSON.stringify(key) )
        .then( (value : any) => {
          value.should.equal('')
        }).catch( () => {
          assert(false, "ERROR --")
        });

      })

    });

  });

});
