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

  before(() => {
    model = new ModelsStub("configuration","","",
    {
      dialect: 'sqlite',
      // disable logging; default: console.log
      logging: false
    });
    data_store = new LocalDataStore(new WLogger());
    item_module_manager = new ItemModuleManagerStub(wrong_rtv_id);
    item_service = new ItemService(item_module_manager, data_store, new WLogger());

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

        // Retrieve item by id
        item_service.get_vacenters_by_user(model.user_guid)
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


  describe('Testing get_item_by_vacenter',  () => {

    it('Given VACenter When Requiring Item Then PairItemRTV is returned and cached', () => {

      let key = {get_item_by_vacenter: model.vacenter_guid};
      // Check register is not in cache beforehand
      data_store.get( JSON.stringify(key) )
      .then( (value : any) => {
        assert(false, "Register found in cached while it shouldnt be")
      }).catch( () => {
        assert(true, "OK!")

        // Retrieve item by id
        item_service.get_item_by_vacenter(model.vacenter_guid)
        .then( (pair_item_rtv : PairItemRTV) => {
          data_store.get( JSON.stringify(key) )
          .then( (value : any) => {
            value.should.equal( pair_item_rtv )
          }).catch( () => {
            assert(false, "ERROR")
          });

        }).catch( () => {
          assert(false, "ERROR")
        })

      });

    });

    it('Given Branch When Requiring Item Then PairItemRTV is returned and cached', () => {

      let key = {get_item_by_branch: model.branch_guid};
      // Check register is not in cache beforehand
      data_store.get( JSON.stringify(key) )
      .then( (value : any) => {
        assert(false, "Register found in cached while it shouldnt be")
      }).catch( () => {
        assert(true, "OK!")

        // Retrieve item by id
        item_service.get_item_by_branch(model.branch_guid)
        .then( (pair_item_rtv : PairItemRTV) => {
          data_store.get( JSON.stringify(key) )
          .then( (value : any) => {
            value.should.equal( pair_item_rtv )
          }).catch( () => {
            assert(false, "ERROR")
          });

        }).catch( () => {
          assert(false, "ERROR")
        })

      });

    });

    it('Given Campaign When Requiring Item Then PairItemRTV is returned and cached', () => {

      let key = {get_item_by_campaign: model.campaign_guid};
      // Check register is not in cache beforehand
      data_store.get( JSON.stringify(key) )
      .then( (value : any) => {
        assert(false, "Register found in cached while it shouldnt be")
      }).catch( () => {
        assert(true, "OK!")

        // Retrieve item by id
        item_service.get_item_by_campaign(model.campaign_guid)
        .then( (pair_item_rtv : PairItemRTV) => {
          data_store.get( JSON.stringify(key) )
          .then( (value : any) => {
            value.should.equal( pair_item_rtv )
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
