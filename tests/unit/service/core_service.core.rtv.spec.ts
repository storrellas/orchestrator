import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as uuid from 'uuid';

import { Models } from '../../../src/models/model';
import { LocalDataStore } from '../../../src/service/datastore';
import { IItemModuleManager,
          ItemModule,
          RTVModule,
          PairItemRTV,
          VACenterList } from '../../../src/models/item_module_manager';
import { ItemService } from '../../../src/service/item_service';
import { LoggerInstance, transports, LoggerOptions, WLogger } from '../../../src/utils/logger';
import * as Sequelize from 'sequelize';
import { ModelsStub } from '../model/fixtures.spec'
import { ItemModuleManagerStub } from './item_service.stub'

var should = chai.should();
var assert = chai.assert;
var expect = chai.expect;
chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('item service module tests', () => {

  let model                : ModelsStub;
  let data_store           : LocalDataStore;
  let item_module_manager  : IItemModuleManager;
  let item_service         : ItemService;
  const wrong_guid         : string = uuid();
  const wrong_rtv_id       : number = 6;
  const item_id            : number = 1;
  const rtv_id             : number = 4;


  before(() => {
    data_store = new LocalDataStore(new WLogger());
    item_module_manager = new ItemModuleManagerStub(wrong_rtv_id);
    item_service = new ItemService(item_module_manager, data_store, new WLogger());
  });

  describe('Testing get_item_by_id',  () => {

    it('Given No CORE ID When Requiring All Items Then Item is returned and cached', () => {

      let key = {"get_item_by_id": 0};
      // Check register is not in cache beforehand
      data_store.get( JSON.stringify(key) )
      .then( (value : any) => {
        assert(false, "Register found in cached while it shouldnt be")
      }).catch( () => {
        assert(true, "OK!")

        // Retrieve item by id
        item_service.get_item_by_id()
        .then( (item_module_list : ItemModule[]) => {

          data_store.get( JSON.stringify(key) )
          .then( (value : any) => {
            value.should.equal( item_module_list )
          }).catch( () => {
            assert(false, "ERROR")
          });

        }).catch( () => {
          assert(false, "ERROR")
        })

      });

    });


    it('Given CORE ID When Requiring Item Then Item is returned and cached', () => {

      let key = {"get_item_by_id": item_id};
      // Check register is not in cache beforehand
      data_store.get( JSON.stringify(key) )
      .then( (value : any) => {
        assert(false, "Register found in cached while it shouldnt be")
      }).catch( () => {
        assert(true, "OK!")

        // Retrieve item by id
        item_service.get_item_by_id(item_id)
        .then( (item_module_list : ItemModule[]) => {

          // Check data_store is cached
          data_store.get( JSON.stringify(key) )
          .then( (value : any) => {
            value.should.equal( item_module_list )
            // Get from cache
            return item_service.get_item_by_id(item_id)
          }).catch( () => {
            assert(false, "ERROR ---->")
          })
          .then( (value:any) => {
            value.should.equal( item_module_list )
          });

        }).catch( () => {
          assert(false, "ERROR")
        })

      });

    });

    it('Given Wrong CORE ID When Requiring CORE Then No Results and no cached', () => {

      let key = {"get_item_by_id": 2};
      // Retrieve item by id
      item_service.get_rtv_by_id(2)
      .then( (rtv_list : ItemModule[]) => {
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

        // Retrieve item by id
        item_service.get_rtv_by_id()
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

        // Retrieve item by id
        item_service.get_rtv_by_id(4)
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

    it('Given Wrong RTV ID When Requiring All Items Then No Results and no cached', () => {

      let key = {"get_rtv_by_id": wrong_rtv_id};
      // Retrieve item by id
      item_service.get_rtv_by_id(wrong_rtv_id)
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
