export type Activity={activity_id:string;name:string;operator:string;region:string;latitude:number;longitude:number;installation_type:string;status:string;people_on_board:number;planned_start:string;planned_end:string;actual_start:string;actual_end:string;dfu2:boolean;dfu5:boolean;dfu7:boolean};
export type Sar={resource_id:string;name:string;aircraft_type:string;latitude:number;longitude:number;speed_knots:number;range_nm:number;capacity:number;mobilization_day_min:number;mobilization_night_min:number;pickup_min_per_person:number;installation_time_min:number};
export type Errv={resource_id:string;name:string;latitude:number;longitude:number;speed_knots:number;mobilization_min:number;region:string;available:boolean};
export type Hospital={hospital_id:string;name:string;latitude:number;longitude:number;region:string;helicopter_accessible:boolean};
export type Heliport={heliport_id:string;name:string;latitude:number;longitude:number;region:string;active:boolean};

export type RequirementRule={
	max_response_minutes:number;
	description:string;
};

export type Requirements={
	dfu2:RequirementRule;
	dfu7:{
		max_medevac_minutes:number;
		description:string;
	};
	dfu5:{
		max_response_minutes:number;
		nofo_supplement_minutes:number;
		description:string;
	};
	disclaimer:string;
};