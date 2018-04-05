import * as uuid from 'uuid';

import { IItemModuleManager,
          ItemModule,
          RTVModule,
          PairItemRTV,
          VACenterList } from '../../../src/models/item_module_manager';

export class ItemModuleManagerStub implements IItemModuleManager{

  constructor( private wrong_rtv_id : number ) {}


  private get_dummy_pair_item_rtv() : PairItemRTV {
    let pair_item_rtv : PairItemRTV = new PairItemRTV("test");
    pair_item_rtv.item_locator_id = uuid();
    pair_item_rtv.item_id = 2;
    pair_item_rtv.rtv_id = 3;
    return pair_item_rtv;
  }

  private get_dummy_item_module() : ItemModule[] {
    let item_module : ItemModule = new ItemModule();
    item_module.id               = 1;
    item_module.description      = "test";
    item_module.module_type_id   = 1;
    item_module.module_type_desc = "test";
    item_module.ip               = "ip";
    item_module.port_http        = 80;
    item_module.port_https       = 443;
    item_module.port_item        = 9889;
    item_module.port_webcontrol  = 9880;
    return [item_module];
  }

  public get_db_vacenters_by_user(guid : string) : Promise<VACenterList> {
    const item : any = { guid: uuid(), name: 'test'};
    return Promise.resolve({
      user_guid: uuid(),
      vacenter_list: [item]
    });
  }
  public get_db_item_by_vacenter(guid: string) : Promise<PairItemRTV> {
    return Promise.resolve( this.get_dummy_pair_item_rtv() )
  }
  public get_db_item_by_branch(guid : string) :  Promise<PairItemRTV> {
    return Promise.resolve( this.get_dummy_pair_item_rtv() )
  }
  public get_db_item_by_campaign(guid : string) :  Promise<PairItemRTV> {
    return Promise.resolve( this.get_dummy_pair_item_rtv() )
  }
  public get_db_rtv_by_id( id? : number ) : Promise<RTVModule[]> {
    if( id == this.wrong_rtv_id ){
      return Promise.reject( null )
    }else{
      return Promise.resolve( this.get_dummy_item_module() )
    }
  }
  public get_db_item_by_id( id? : number ) : Promise<ItemModule[]> {
    return Promise.resolve( this.get_dummy_item_module() )
  }
}
