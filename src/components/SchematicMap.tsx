import {useEffect,useRef} from 'react';
import ArcGISMap from '@arcgis/core/Map';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Polyline from '@arcgis/core/geometry/Polyline';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import MapView from '@arcgis/core/views/MapView';
import BasemapToggle from '@arcgis/core/widgets/BasemapToggle';
import Compass from '@arcgis/core/widgets/Compass';
import Expand from '@arcgis/core/widgets/Expand';
import Home from '@arcgis/core/widgets/Home';
import LayerList from '@arcgis/core/widgets/LayerList';
import ScaleBar from '@arcgis/core/widgets/ScaleBar';
import {Activity,Errv,Heliport,Hospital,Sar} from '../domain/types';

const northSeaView={center:[4.8,61.3] as [number,number],zoom:5};
const point=(longitude:number,latitude:number)=>new Point({longitude,latitude});

const marker=(style:'circle'|'diamond'|'square'|'triangle'|'cross'|'x',color:number[],size:number,outline:number[])=>
  new SimpleMarkerSymbol({style,color,size,outline:{color:outline,width:1.5}});

const activitySymbol=marker('circle',[230,246,252,0.96],9,[5,31,47,1]);
const selectedActivitySymbol=marker('circle',[255,102,56,1],16,[255,235,226,1]);
const sarSymbol=marker('triangle',[54,205,238,1],13,[218,249,255,1]);
const errvSymbol=marker('diamond',[66,202,166,1],13,[220,255,246,1]);
const hospitalSymbol=marker('cross',[255,112,73,1],15,[255,225,213,1]);
const heliportSymbol=marker('square',[115,145,236,1],11,[232,238,255,1]);

const activityGraphic=(activity:Activity)=>new Graphic({
  geometry:point(activity.longitude,activity.latitude),
  symbol:activitySymbol,
  attributes:{...activity,entityType:'activity'},
  popupTemplate:{
    title:'{name}',
    content:[{
      type:'fields',
      fieldInfos:[
        {fieldName:'operator',label:'Operator'},
        {fieldName:'region',label:'Region'},
        {fieldName:'installation_type',label:'Installation'},
        {fieldName:'status',label:'Status'},
        {fieldName:'people_on_board',label:'People on board',format:{digitSeparator:true,places:0}},
      ],
    }],
  },
});

type Props={
  activities:Activity[];
  sar:Sar[];
  errv:Errv[];
  hospitals:Hospital[];
  heliports:Heliport[];
  selected?:Activity;
  routeSarNames:string[];
  onSelect:(activity:Activity)=>void;
};

export default function SchematicMap({activities,sar,errv,hospitals,heliports,selected,routeSarNames,onSelect}:Props){
  const mapElementRef=useRef<HTMLDivElement>(null);
  const viewRef=useRef<MapView|null>(null);
  const activityLayerRef=useRef<GraphicsLayer|null>(null);
  const routeLayerRef=useRef<GraphicsLayer|null>(null);
  const onSelectRef=useRef(onSelect);
  const activitiesRef=useRef(activities);

  useEffect(()=>{
    onSelectRef.current=onSelect;
  },[onSelect]);

  useEffect(()=>{
    activitiesRef.current=activities;
    const activityLayer=activityLayerRef.current;
    if(!activityLayer){
      return;
    }
    activityLayer.removeAll();
    activityLayer.addMany(activities.map(activityGraphic));
  },[activities]);

  useEffect(()=>{
    if(!mapElementRef.current){
      return;
    }

    const activityLayer=new GraphicsLayer({title:'Offshore activities',listMode:'show'});
    const routeLayer=new GraphicsLayer({title:'Response routes',listMode:'show'});
    const sarLayer=new GraphicsLayer({title:'SAR helicopter bases',listMode:'show'});
    const errvLayer=new GraphicsLayer({title:'Available ERRVs',listMode:'show'});
    const hospitalLayer=new GraphicsLayer({title:'Helicopter hospitals',listMode:'show'});
    const heliportLayer=new GraphicsLayer({title:'Heliports',listMode:'show'});

    activityLayer.addMany(activitiesRef.current.map(activityGraphic));

    sarLayer.addMany(sar.map(resource=>new Graphic({
      geometry:point(resource.longitude,resource.latitude),
      symbol:sarSymbol,
      attributes:{...resource,entityType:'sar'},
      popupTemplate:{
        title:'{name}',
        content:[{
          type:'fields',
          fieldInfos:[
            {fieldName:'aircraft_type',label:'Aircraft'},
            {fieldName:'speed_knots',label:'Speed (knots)'},
            {fieldName:'range_nm',label:'Range (NM)'},
            {fieldName:'capacity',label:'Capacity'},
            {fieldName:'mobilization_day_min',label:'Day mobilization (min)'},
            {fieldName:'mobilization_night_min',label:'Night mobilization (min)'},
          ],
        }],
      },
    })));

    errvLayer.addMany(errv.filter(resource=>resource.available).map(resource=>new Graphic({
      geometry:point(resource.longitude,resource.latitude),
      symbol:errvSymbol,
      attributes:{...resource,entityType:'errv'},
      popupTemplate:{
        title:'{name}',
        content:[{
          type:'fields',
          fieldInfos:[
            {fieldName:'region',label:'Region'},
            {fieldName:'speed_knots',label:'Speed (knots)'},
            {fieldName:'mobilization_min',label:'Mobilization (min)'},
          ],
        }],
      },
    })));

    hospitalLayer.addMany(hospitals.filter(hospital=>hospital.helicopter_accessible).map(hospital=>new Graphic({
      geometry:point(hospital.longitude,hospital.latitude),
      symbol:hospitalSymbol,
      attributes:{...hospital,entityType:'hospital'},
      popupTemplate:{title:'{name}',content:'Helicopter-accessible hospital<br><strong>Region:</strong> {region}'},
    })));

    heliportLayer.addMany(heliports.filter(heliport=>heliport.active).map(heliport=>new Graphic({
      geometry:point(heliport.longitude,heliport.latitude),
      symbol:heliportSymbol,
      attributes:{...heliport,entityType:'heliport'},
      popupTemplate:{title:'{name}',content:'Active heliport<br><strong>Region:</strong> {region}'},
    })));

    const map=new ArcGISMap({basemap:'osm',layers:[routeLayer,activityLayer,errvLayer,sarLayer,heliportLayer,hospitalLayer]});
    const view=new MapView({
      container:mapElementRef.current,
      map,
      center:northSeaView.center,
      zoom:northSeaView.zoom,
      constraints:{minZoom:3,maxZoom:15,snapToZoom:false},
      popup:{dockEnabled:true,dockOptions:{buttonEnabled:false,position:'bottom-right'}},
    });

    view.ui.move('zoom','top-right');
    view.ui.add(new Home({view}),{position:'top-right',index:1});
    view.ui.add(new Compass({view}),{position:'top-right',index:2});
    view.ui.add(new ScaleBar({view,unit:'dual'}),'bottom-left');
    view.ui.add(new BasemapToggle({view,nextBasemap:'satellite'}),'bottom-right');
    view.ui.add(new Expand({
      view,
      content:new LayerList({view}),
      expanded:false,
      group:'top-right',
      expandTooltip:'Map layers',
    }),{position:'top-right',index:3});

    const clickHandle=view.on('click',async event=>{
      const response=await view.hitTest(event,{include:activityLayer});
      const graphic=response.results.find(result=>'graphic' in result)?.graphic;
      if(graphic?.attributes?.entityType==='activity'){
        const activity=activitiesRef.current.find(item=>item.activity_id===graphic.attributes.activity_id);
        if(activity){
          onSelectRef.current(activity);
        }
      }
    });

    viewRef.current=view;
    activityLayerRef.current=activityLayer;
    routeLayerRef.current=routeLayer;

    return ()=>{
      clickHandle.remove();
      view.destroy();
      viewRef.current=null;
      activityLayerRef.current=null;
      routeLayerRef.current=null;
    };
  },[sar,errv,hospitals,heliports]);

  useEffect(()=>{
    const view=viewRef.current;
    const activityLayer=activityLayerRef.current;
    const routeLayer=routeLayerRef.current;
    if(!view || !activityLayer || !routeLayer || !selected){
      return;
    }

    activityLayer.graphics.forEach(graphic=>{
      graphic.symbol=graphic.attributes.activity_id===selected.activity_id?selectedActivitySymbol:activitySymbol;
    });

    routeLayer.removeAll();
    const selectedSar=sar.filter(resource=>routeSarNames.includes(resource.name));
    routeLayer.addMany(selectedSar.map(resource=>new Graphic({
      geometry:new Polyline({
        paths:[[[selected.longitude,selected.latitude],[resource.longitude,resource.latitude]]],
        spatialReference:{wkid:4326},
      }),
      symbol:new SimpleLineSymbol({color:[255,111,60,0.92],width:2.5,style:'short-dash'}),
      attributes:{name:`${selected.name} to ${resource.name}`},
      popupTemplate:{title:'Indicative response route',content:'{name}'},
    })));
    routeLayer.add(new Graphic({
      geometry:point(selected.longitude,selected.latitude),
      symbol:new TextSymbol({
        text:selected.name,
        color:[255,255,255,1],
        haloColor:[5,25,38,0.96],
        haloSize:1.5,
        font:{family:'Avenir Next',size:11,weight:'bold'},
        yoffset:18,
      }),
    }));

    void view.goTo({center:[selected.longitude,selected.latitude],zoom:7.5},{duration:850,easing:'ease-in-out'});
  },[selected,sar,routeSarNames]);

  return (
    <section className="map-shell arcgis-map-shell" aria-label="Interactive emergency resource map">
      <div className="map-toolbar">
        <div>
          <span className="map-kicker">LIVE GEOGRAPHIC CONTEXT</span>
          <strong>North Sea emergency resource network</strong>
        </div>
        <span className="map-source">OpenStreetMap | ArcGIS Maps SDK</span>
      </div>
      <div ref={mapElementRef} className="map-viewport arcgis-map" />
      <div className="map-legend" aria-label="Map legend">
        <span><i className="legend-dot activity" />Activity</span>
        <span><i className="legend-dot sar" />SAR base</span>
        <span><i className="legend-dot errv" />ERRV</span>
        <span><i className="legend-dot hospital" />Hospital</span>
        <span><i className="legend-dot heliport" />Heliport</span>
        <small>Pan, scroll or pinch to explore</small>
      </div>
    </section>
  );
}
