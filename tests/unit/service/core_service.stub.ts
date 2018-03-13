import * as uuid from 'uuid';

import { ICoreModuleManager,
          CoreModule,
          RTVModule,
          PairCoreRTV,
          VACenterList } from '../../../src/models/core_module_manager';

export class CoreModuleManagerStub implements ICoreModuleManager{

  constructor( private wrong_rtv_id : number ) {}


  private get_dummy_pair_core_rtv() : PairCoreRTV {
    let pair_core_rtv : PairCoreRTV = new PairCoreRTV("test");
    pair_core_rtv.core_locator_id = uuid();
    pair_core_rtv.core_id = 2;
    pair_core_rtv.rtv_id = 3;
    return pair_core_rtv;
  }

  private get_dummy_core_module() : CoreModule[] {
    let core_module : CoreModule = new CoreModule();
    core_module.id               = 1;
    core_module.description      = "test";
    core_module.module_type_id   = 1;
    core_module.module_type_desc = "test";
    core_module.ip               = "ip";
    core_module.port_http        = 80;
    core_module.port_https       = 443;
    core_module.port_core        = 9889;
    core_module.port_webcontrol  = 9880;
    return [core_module];
  }

  public get_db_vacenters_by_user(guid : string) : Promise<VACenterList> {
    const item : any = { guid: uuid(), name: 'test'};
    return Promise.resolve({
      user_guid: uuid(),
      vacenter_list: [item]
    });
  }
  public get_db_core_by_vacenter(guid: string) : Promise<PairCoreRTV> {
    return Promise.resolve( this.get_dummy_pair_core_rtv() )
  }
  public get_db_core_by_branch(guid : string) :  Promise<PairCoreRTV> {
    return Promise.resolve( this.get_dummy_pair_core_rtv() )
  }
  public get_db_core_by_campaign(guid : string) :  Promise<PairCoreRTV> {
    return Promise.resolve( this.get_dummy_pair_core_rtv() )
  }
  public get_db_rtv_by_id( id? : number ) : Promise<RTVModule[]> {
    if( id == this.wrong_rtv_id ){
      return Promise.reject( null )
    }else{
      return Promise.resolve( this.get_dummy_core_module() )
    }
  }
  public get_db_core_by_id( id? : number ) : Promise<CoreModule[]> {
    return Promise.resolve( this.get_dummy_core_module() )
  }
}
