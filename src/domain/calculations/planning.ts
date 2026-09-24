import {Activity,Errv,Hospital,Sar} from '../types';
import {haversineNm,travelMinutes} from './distance';

export type Dfu2Result={
	name:string;
	distance:number;
	mobilization:number;
	roundTripTravel:number;
	pickupPerPerson:number;
	people:number;
	capacity:number;
	total:number;
	threshold:number;
	withinThreshold:boolean;
	withinRange:boolean;
};

export type Dfu7Result={
	sar:string;
	hospital:string;
	distance:number;
	mobilization:number;
	activityLeg:number;
	hospitalLeg:number;
	installationHandling:number;
	total:number;
	threshold:number;
	withinThreshold:boolean;
};

export type Dfu5Result={
	name:string;
	distance:number;
	mobilization:number;
	travel:number;
	total:number;
	supplement:number;
	withSupplement:number;
	threshold:number;
	withinThreshold:boolean;
};

export function dfu2(activity:Activity,sar:Sar,night=false,limit=120):Dfu2Result{
	const distance=haversineNm(activity,sar);
	const mobilization=night?sar.mobilization_night_min:sar.mobilization_day_min;
	const oneWayTravel=travelMinutes(distance,sar.speed_knots);
	const roundTripTravel=2*oneWayTravel;
	let people=0;
	let total=mobilization+roundTripTravel;

	for(let passengers=1;passengers<=sar.capacity;passengers+=1){
		const estimate=mobilization+roundTripTravel+passengers*sar.pickup_min_per_person;
		if(estimate<=limit){
			people=passengers;
			total=estimate;
		}else{
			break;
		}
	}

	return {
		name:sar.name,
		distance,
		mobilization,
		roundTripTravel,
		pickupPerPerson:sar.pickup_min_per_person,
		people,
		capacity:sar.capacity,
		total,
		threshold:limit,
		withinThreshold:total<=limit,
		withinRange:distance<=sar.range_nm,
	};
}

export function dfu7(activity:Activity,sar:Sar,hospital:Hospital,night=false,limit=180):Dfu7Result{
	const distanceToActivity=haversineNm(sar,activity);
	const distanceToHospital=haversineNm(activity,hospital);
	const activityLeg=travelMinutes(distanceToActivity,sar.speed_knots);
	const hospitalLeg=travelMinutes(distanceToHospital,sar.speed_knots);
	const mobilization=night?sar.mobilization_night_min:sar.mobilization_day_min;
	const installationHandling=sar.installation_time_min;
	const total=mobilization+activityLeg+installationHandling+hospitalLeg;

	return {
		sar:sar.name,
		hospital:hospital.name,
		distance:distanceToActivity+distanceToHospital,
		mobilization,
		activityLeg,
		hospitalLeg,
		installationHandling,
		total,
		threshold:limit,
		withinThreshold:total<=limit,
	};
}

export function dfu5(activity:Activity,errv:Errv,supplement=60,limit=360):Dfu5Result{
	const distance=haversineNm(activity,errv);
	const travel=travelMinutes(distance,errv.speed_knots);
	const mobilization=errv.mobilization_min;
	const total=mobilization+travel;
	const withSupplement=total+supplement;

	return {
		name:errv.name,
		distance,
		mobilization,
		travel,
		total,
		supplement,
		withSupplement,
		threshold:limit,
		withinThreshold:withSupplement<=limit,
	};
}