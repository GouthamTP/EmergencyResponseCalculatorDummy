import {describe,expect,it} from 'vitest';
import {
  activityFilterCount,
  emptyActivityFilters,
  filterAndSortActivities,
} from './activityFilters';
import {Activity} from './types';

const activity=(overrides:Partial<Activity>):Activity=>({
  activity_id:'A001',
  name:'Alpha Well',
  operator:'North Energy',
  region:'Tampen',
  latitude:60,
  longitude:3,
  installation_type:'Mobile',
  status:'Active',
  people_on_board:45,
  planned_start:'2026-02-01',
  planned_end:'2026-03-01',
  actual_start:'',
  actual_end:'',
  dfu2:true,
  dfu5:false,
  dfu7:true,
  ...overrides,
});

describe('activity filtering',()=>{
  const activities=[
    activity({activity_id:'A001'}),
    activity({activity_id:'A002',name:'Bravo Well',operator:'Coastal Energy',region:'Barents',status:'Planned',people_on_board:80,planned_start:'2027-01-01',dfu2:false,dfu5:true}),
  ];

  it('combines search, structured filters and DFU applicability',()=>{
    const results=filterAndSortActivities(activities,{
      ...emptyActivityFilters,
      query:'bravo',
      year:'2027',
      region:'Barents',
      dfu:'dfu5',
    },'name');

    expect(results.map(result=>result.activity_id)).toEqual(['A002']);
  });

  it('sorts deterministically and counts active structured filters',()=>{
    const filters={...emptyActivityFilters,status:'Active',dfu:'dfu7' as const};

    expect(filterAndSortActivities(activities,emptyActivityFilters,'pob-desc')[0].activity_id).toBe('A002');
    expect(activityFilterCount(filters)).toBe(2);
  });
});