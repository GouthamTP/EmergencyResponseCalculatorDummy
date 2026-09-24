import {describe,expect,it} from 'vitest';
import {dfu2,dfu5,dfu7} from './planning';
import {Activity,Errv,Hospital,Sar} from '../types';

const activity:Activity={
  activity_id:'A1',
  name:'Activity',
  operator:'Op',
  region:'Region',
  latitude:60,
  longitude:2,
  installation_type:'Fixed',
  status:'Active',
  people_on_board:40,
  planned_start:'2026-01-01',
  planned_end:'2026-01-31',
  actual_start:'',
  actual_end:'',
  dfu2:true,
  dfu5:true,
  dfu7:true,
};

const sar:Sar={
  resource_id:'S1',
  name:'SAR Base',
  aircraft_type:'S-92',
  latitude:60,
  longitude:2,
  speed_knots:120,
  range_nm:150,
  capacity:20,
  mobilization_day_min:15,
  mobilization_night_min:20,
  pickup_min_per_person:3,
  installation_time_min:18,
};

const hospital:Hospital={
  hospital_id:'H1',
  name:'Hospital',
  latitude:60.5,
  longitude:2.3,
  region:'West',
  helicopter_accessible:true,
};

const errv:Errv={
  resource_id:'E1',
  name:'ERRV One',
  latitude:60.2,
  longitude:2.2,
  speed_knots:14,
  mobilization_min:15,
  region:'West',
  available:true,
};

describe('planning calculations',()=>{
  it('caps DFU2 passengers by threshold and capacity',()=>{
    const result=dfu2(activity,sar,false,50);
    expect(result.people).toBeLessThanOrEqual(sar.capacity);
    expect(result.total).toBeLessThanOrEqual(50);
    expect(result.withinRange).toBe(true);
  });

  it('includes installation handling in DFU7 total',()=>{
    const result=dfu7(activity,sar,hospital,false,240);
    expect(result.total).toBeCloseTo(
      result.mobilization+result.activityLeg+result.installationHandling+result.hospitalLeg,
      6,
    );
    expect(result.withinThreshold).toBe(true);
  });

  it('adds NOFO supplement in DFU5',()=>{
    const result=dfu5(activity,errv,60,500);
    expect(result.withSupplement).toBeCloseTo(result.total+60,6);
    expect(result.withinThreshold).toBe(true);
  });
});
