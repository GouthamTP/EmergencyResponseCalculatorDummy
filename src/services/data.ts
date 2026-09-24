import Papa from 'papaparse';
import {
	Activity,
	Errv,
	Heliport,
	Hospital,
	Requirements,
	Sar,
} from '../domain/types';

const bool=(v:string)=>v==='true';
const num=(v:string)=>Number(v);

async function csv<T>(path:string,cast:(row:Record<string,string>)=>T):Promise<T[]>{
	const text=await fetch(path).then(response=>{
		if(!response.ok){
			throw new Error(`Could not load ${path}`);
		}
		return response.text();
	});

	const parsed=Papa.parse(text,{header:true,skipEmptyLines:true});
	if(parsed.errors.length){
		throw new Error(parsed.errors[0].message);
	}

	return (parsed.data as Record<string,string>[]).map(cast);
}

export type LoadedData={
	activities:Activity[];
	sar:Sar[];
	errv:Errv[];
	hospitals:Hospital[];
	heliports:Heliport[];
	requirements:Requirements;
};

export async function loadAll():Promise<LoadedData>{
	const [activities,sar,errv,hospitals,heliports,requirements]=await Promise.all([
		csv<Activity>('/data/activities.csv',row=>({
			activity_id:row.activity_id,
			name:row.name,
			operator:row.operator,
			region:row.region,
			latitude:num(row.latitude),
			longitude:num(row.longitude),
			installation_type:row.installation_type,
			status:row.status,
			people_on_board:num(row.people_on_board),
			planned_start:row.planned_start,
			planned_end:row.planned_end,
			actual_start:row.actual_start,
			actual_end:row.actual_end,
			dfu2:bool(row.dfu2),
			dfu5:bool(row.dfu5),
			dfu7:bool(row.dfu7),
		})),
		csv<Sar>('/data/sar_resources.csv',row=>({
			resource_id:row.resource_id,
			name:row.name,
			aircraft_type:row.aircraft_type,
			latitude:num(row.latitude),
			longitude:num(row.longitude),
			speed_knots:num(row.speed_knots),
			range_nm:num(row.range_nm),
			capacity:num(row.capacity),
			mobilization_day_min:num(row.mobilization_day_min),
			mobilization_night_min:num(row.mobilization_night_min),
			pickup_min_per_person:num(row.pickup_min_per_person),
			installation_time_min:num(row.installation_time_min),
		})),
		csv<Errv>('/data/errv_resources.csv',row=>({
			resource_id:row.resource_id,
			name:row.name,
			latitude:num(row.latitude),
			longitude:num(row.longitude),
			speed_knots:num(row.speed_knots),
			mobilization_min:num(row.mobilization_min),
			region:row.region,
			available:bool(row.available),
		})),
		csv<Hospital>('/data/hospitals.csv',row=>({
			hospital_id:row.hospital_id,
			name:row.name,
			latitude:num(row.latitude),
			longitude:num(row.longitude),
			region:row.region,
			helicopter_accessible:bool(row.helicopter_accessible),
		})),
		csv<Heliport>('/data/heliports.csv',row=>({
			heliport_id:row.heliport_id,
			name:row.name,
			latitude:num(row.latitude),
			longitude:num(row.longitude),
			region:row.region,
			active:bool(row.active),
		})),
		fetch('/data/requirements.json').then(response=>response.json() as Promise<Requirements>),
	]);

	return {activities,sar,errv,hospitals,heliports,requirements};
}