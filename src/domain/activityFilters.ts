import {Activity} from './types';

export type DfuFilter='all'|'dfu2'|'dfu5'|'dfu7';
export type ActivitySort='name'|'operator'|'region'|'pob-desc';

export type ActivityFilters={
  query:string;
  year:string;
  status:string;
  operator:string;
  region:string;
  installationType:string;
  dfu:DfuFilter;
};

export const emptyActivityFilters:ActivityFilters={
  query:'',
  year:'all',
  status:'all',
  operator:'all',
  region:'all',
  installationType:'all',
  dfu:'all',
};

export function activityMatchesFilters(activity:Activity,filters:ActivityFilters){
  const query=filters.query.trim().toLowerCase();
  const searchable=[activity.name,activity.operator,activity.region,activity.installation_type]
    .join(' ')
    .toLowerCase();
  const startsInYear=activity.planned_start.startsWith(`${filters.year}-`);

  return (!query || searchable.includes(query))
    && (filters.year==='all' || startsInYear)
    && (filters.status==='all' || activity.status===filters.status)
    && (filters.operator==='all' || activity.operator===filters.operator)
    && (filters.region==='all' || activity.region===filters.region)
    && (filters.installationType==='all' || activity.installation_type===filters.installationType)
    && (filters.dfu==='all' || activity[filters.dfu]);
}

export function filterAndSortActivities(activities:Activity[],filters:ActivityFilters,sort:ActivitySort){
  return activities
    .filter(activity=>activityMatchesFilters(activity,filters))
    .sort((left,right)=>{
      if(sort==='pob-desc'){
        return right.people_on_board-left.people_on_board || left.name.localeCompare(right.name);
      }
      return left[sort].localeCompare(right[sort]) || left.name.localeCompare(right.name);
    });
}

export function activityFilterCount(filters:ActivityFilters){
  return Object.entries(filters).filter(([key,value])=>key!=='query' && value!=='all').length;
}