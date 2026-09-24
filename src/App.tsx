import {useEffect,useMemo,useState} from 'react';
import SchematicMap from './components/SchematicMap';
import {dfu2,dfu5,dfu7} from './domain/calculations/planning';
import {Activity} from './domain/types';
import {LoadedData,loadAll} from './services/data';

const fmtMinutes=(minutes:number)=>Number.isFinite(minutes)?`${Math.round(minutes)} min`:'--';
const fmtNm=(distance:number)=>Number.isFinite(distance)?`${distance.toFixed(1)} NM`:'--';

function byTotalThenDistance<T extends {total:number;distance:number}>(a:T,b:T){
  if(a.total===b.total){
    return a.distance-b.distance;
  }
  return a.total-b.total;
}

function rateLabel(value:number){
  if(value>=90){
    return 'Excellent';
  }
  if(value>=70){
    return 'Strong';
  }
  if(value>=50){
    return 'Moderate';
  }
  return 'At Risk';
}

export default function App(){
  const [data,setData]=useState<LoadedData>();
  const [query,setQuery]=useState('');
  const [nightMode,setNightMode]=useState(false);
  const [selectedId,setSelectedId]=useState<string>();

  useEffect(()=>{
    loadAll().then(loaded=>{
      setData(loaded);
      setSelectedId(loaded.activities[0]?.activity_id);
    });
  },[]);

  const filteredActivities=useMemo(()=>{
    if(!data){
      return [];
    }

    const term=query.toLowerCase().trim();
    if(!term){
      return data.activities;
    }

    return data.activities.filter(activity=>
      [activity.name,activity.operator,activity.region,activity.installation_type]
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  },[data,query]);

  const selectedActivity=useMemo(()=>{
    if(!data){
      return undefined;
    }
    return data.activities.find(activity=>activity.activity_id===selectedId) ?? filteredActivities[0];
  },[data,selectedId,filteredActivities]);

  const computed=useMemo(()=>{
    if(!data || !selectedActivity){
      return undefined;
    }

    const dfu2Results=data.sar
      .map(resource=>dfu2(selectedActivity,resource,nightMode,data.requirements.dfu2.max_response_minutes))
      .sort(byTotalThenDistance);

    const dfu7Results=data.sar
      .flatMap(resource=>
        data.hospitals
          .filter(hospital=>hospital.helicopter_accessible)
          .map(hospital=>
            dfu7(
              selectedActivity,
              resource,
              hospital,
              nightMode,
              data.requirements.dfu7.max_medevac_minutes,
            ),
          ),
      )
      .sort(byTotalThenDistance);

    const dfu5Results=data.errv
      .filter(resource=>resource.available)
      .map(resource=>
        dfu5(
          selectedActivity,
          resource,
          data.requirements.dfu5.nofo_supplement_minutes,
          data.requirements.dfu5.max_response_minutes,
        ),
      )
      .sort(byTotalThenDistance);

    const topDfu2=dfu2Results[0];
    const topDfu7=dfu7Results[0];
    const topDfu5=dfu5Results[0];

    const coverage={
      dfu2:
        dfu2Results.length===0
          ? 0
          : Math.round((dfu2Results.filter(result=>result.withinThreshold && result.withinRange).length/dfu2Results.length)*100),
      dfu7:
        dfu7Results.length===0
          ? 0
          : Math.round((dfu7Results.filter(result=>result.withinThreshold).length/dfu7Results.length)*100),
      dfu5:
        dfu5Results.length===0
          ? 0
          : Math.round((dfu5Results.filter(result=>result.withinThreshold).length/dfu5Results.length)*100),
    };

    return {
      dfu2Results,
      dfu7Results,
      dfu5Results,
      topDfu2,
      topDfu7,
      topDfu5,
      coverage,
      nearestSarNames:dfu2Results.slice(0,3).map(result=>result.name),
    };
  },[data,selectedActivity,nightMode]);

  if(!data || !selectedActivity || !computed){
    return <div className="loading-state">Loading static planning model...</div>;
  }

  return (
    <main className="command-app">
      <header className="topbar">
        <div>
          <p className="eyebrow">OFFSHORE PLANNING INDICATOR</p>
          <h1>Emergency Readiness Command Deck</h1>
          <p className="prototype-label">Prototype with Dummy Data</p>
        </div>
        <div className="mode-toggle" role="group" aria-label="Day and night scenario toggle">
          <button
            type="button"
            className={!nightMode?'active':''}
            aria-pressed={!nightMode}
            onClick={()=>setNightMode(false)}
          >
            Day Ops
          </button>
          <button
            type="button"
            className={nightMode?'active':''}
            aria-pressed={nightMode}
            onClick={()=>setNightMode(true)}
          >
            Night Ops
          </button>
        </div>
      </header>

      <section className="kpi-row" aria-label="Coverage indicators">
        <article>
          <span>DFU2 Coverage</span>
          <strong>{computed.coverage.dfu2}%</strong>
          <small>{rateLabel(computed.coverage.dfu2)}</small>
        </article>
        <article>
          <span>DFU7 Coverage</span>
          <strong>{computed.coverage.dfu7}%</strong>
          <small>{rateLabel(computed.coverage.dfu7)}</small>
        </article>
        <article>
          <span>DFU5 Coverage</span>
          <strong>{computed.coverage.dfu5}%</strong>
          <small>{rateLabel(computed.coverage.dfu5)}</small>
        </article>
        <article>
          <span>Top Medevac Time</span>
          <strong>{fmtMinutes(computed.topDfu7?.total ?? Infinity)}</strong>
          <small>{computed.topDfu7?.hospital ?? 'No route'}</small>
        </article>
      </section>

      <div className="workspace-grid">
        <aside className="activity-rail" aria-label="Activity selection panel">
          <div className="activity-header">
            <h2>Activities</h2>
            <input
              aria-label="Search activity"
              placeholder="Search by name, operator or region"
              value={query}
              onChange={event=>setQuery(event.target.value)}
            />
          </div>
          <div className="activity-list">
            {filteredActivities.map(activity=>(
              <ActivityCard
                key={activity.activity_id}
                activity={activity}
                selected={activity.activity_id===selectedActivity.activity_id}
                onSelect={()=>setSelectedId(activity.activity_id)}
              />
            ))}
          </div>
        </aside>

        <section className="center-column">
          <section className="focus-card" aria-label="Selected activity details">
            <div>
              <p className="eyebrow">Selected activity</p>
              <h2>{selectedActivity.name}</h2>
              <p>
                {selectedActivity.operator} | {selectedActivity.region} | {selectedActivity.installation_type}
              </p>
            </div>
            <div className="focus-tags">
              <span className="tag">POB {selectedActivity.people_on_board}</span>
              <span className="tag">Status {selectedActivity.status}</span>
              <span className={selectedActivity.dfu2?'tag ok':'tag muted'}>DFU2</span>
              <span className={selectedActivity.dfu7?'tag ok':'tag muted'}>DFU7</span>
              <span className={selectedActivity.dfu5?'tag ok':'tag muted'}>DFU5</span>
            </div>
          </section>

          <SchematicMap
            activities={filteredActivities}
            sar={data.sar}
            errv={data.errv}
            hospitals={data.hospitals}
            heliports={data.heliports}
            selected={selectedActivity}
            routeSarNames={computed.nearestSarNames}
            onSelect={activity=>setSelectedId(activity.activity_id)}
          />

          <section className="assumptions" aria-label="Formula assumptions and disclaimer">
            <h3>Assumptions and transparency</h3>
            <ul>
              <li>DFU2 uses mobilization + repeated round-trip flight + pickup time per person.</li>
              <li>DFU7 uses mobilization + SAR to activity + installation handling + activity to hospital.</li>
              <li>DFU5 uses mobilization + ERRV travel time with configurable NOFO supplement.</li>
            </ul>
            <p className="disclaimer">{data.requirements.disclaimer}</p>
          </section>
        </section>

        <section className="results-column" aria-label="Planning results">
          <PlanningPanel
            title="DFU2 Pickup Ranking"
            note={data.requirements.dfu2.description}
            empty={!selectedActivity.dfu2}
            emptyLabel="Activity not configured for DFU2 in static data."
            rows={computed.dfu2Results.slice(0,6).map(result=>({
              title:result.name,
              subtitle:`${fmtNm(result.distance)} | pickup ${result.people}/${result.capacity}`,
              value:fmtMinutes(result.total),
              status:result.withinThreshold && result.withinRange?'Within threshold':'Review',
              detail:`Mobilization ${fmtMinutes(result.mobilization)}, travel ${fmtMinutes(result.roundTripTravel)}, pickup ${result.pickupPerPerson} min/person`,
            }))}
          />

          <PlanningPanel
            title="DFU7 Medevac Routes"
            note={data.requirements.dfu7.description}
            empty={!selectedActivity.dfu7}
            emptyLabel="Activity not configured for DFU7 in static data."
            rows={computed.dfu7Results.slice(0,6).map(result=>({
              title:`${result.sar} to ${result.hospital}`,
              subtitle:`${fmtNm(result.distance)} total route`,
              value:fmtMinutes(result.total),
              status:result.withinThreshold?'Within threshold':'Review',
              detail:`Legs ${fmtMinutes(result.activityLeg)} + ${fmtMinutes(result.hospitalLeg)}, installation ${fmtMinutes(result.installationHandling)}`,
            }))}
          />

          <PlanningPanel
            title="DFU5 ERRV Response"
            note={data.requirements.dfu5.description}
            empty={!selectedActivity.dfu5}
            emptyLabel="Activity not configured for DFU5 in static data."
            rows={computed.dfu5Results.slice(0,6).map(result=>({
              title:result.name,
              subtitle:`${fmtNm(result.distance)} | base ${fmtMinutes(result.total)}`,
              value:fmtMinutes(result.withSupplement),
              status:result.withinThreshold?'Within threshold':'Review',
              detail:`Mobilization ${fmtMinutes(result.mobilization)}, travel ${fmtMinutes(result.travel)}, supplement ${fmtMinutes(result.supplement)}`,
            }))}
          />
        </section>
      </div>
    </main>
  );
}

function ActivityCard({activity,selected,onSelect}:{activity:Activity;selected:boolean;onSelect:()=>void}){
  return (
    <button
      type="button"
      className={selected?'activity-card selected':'activity-card'}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <strong>{activity.name}</strong>
      <small>{activity.operator}</small>
      <small>{activity.region}</small>
    </button>
  );
}

type PlanningRow={
  title:string;
  subtitle:string;
  value:string;
  status:string;
  detail:string;
};

function PlanningPanel({
  title,
  note,
  rows,
  empty,
  emptyLabel,
}:{
  title:string;
  note:string;
  rows:PlanningRow[];
  empty:boolean;
  emptyLabel:string;
}){
  return (
    <section className="planning-panel">
      <div className="panel-head">
        <h3>{title}</h3>
        <p>{note}</p>
      </div>
      {empty?(
        <p className="muted-callout">{emptyLabel}</p>
      ):(
        <div className="panel-rows">
          {rows.map(row=>(
            <article key={`${row.title}-${row.subtitle}`} className="planning-row">
              <div>
                <strong>{row.title}</strong>
                <small>{row.subtitle}</small>
                <small>{row.detail}</small>
              </div>
              <div className="row-value">
                <b>{row.value}</b>
                <span>{row.status}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
