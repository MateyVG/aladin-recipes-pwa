import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Plus, Trash2, CheckCircle, AlertCircle, ChevronLeft, BookOpen, AlertTriangle, Search, Bell, BellOff, X } from 'lucide-react';

const DS = {
  color: {
    bg:'#ECEEED',surface:'#FFFFFF',surfaceAlt:'#F7F9F8',
    primary:'#1B5E37',primaryLight:'#2D7A4F',primaryGlow:'rgba(27,94,55,0.08)',
    graphite:'#1E2A26',graphiteMed:'#3D4F48',graphiteLight:'#6B7D76',graphiteMuted:'#95A39D',
    sage:'#A8BFB2',ok:'#1B8A50',okBg:'#E8F5EE',
    warning:'#C47F17',warningBg:'#FFF8EC',danger:'#C53030',dangerBg:'#FEF2F2',
    pendingBg:'#F0F2F1',borderLight:'#E4EBE7',
  },
  font:"'DM Sans', system-ui, sans-serif",
  radius:'0px',
  shadow:{
    sm:'0 1px 3px rgba(30,42,38,0.06)',
    md:'0 4px 12px rgba(30,42,38,0.06)',
    glow:'0 0 20px rgba(27,94,55,0.15)',
  },
};

const LOGO_URL='https://aladinfoods.bg/assets/images/aladinfoods_logo.png';

const GLOBAL_CSS=`
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;}
  @keyframes ctrlBreathe{0%,100%{box-shadow:${DS.shadow.glow}}50%{box-shadow:0 0 24px rgba(27,94,55,0.25)}}
  @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
  @media(max-width:767px){input,button,select,textarea{font-size:16px!important;}}
  ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:${DS.color.sage};}
`;

const useResponsive=()=>{
  const[w,setW]=useState(window.innerWidth);
  useEffect(()=>{
    const h=()=>setW(window.innerWidth);
    window.addEventListener('resize',h);
    return()=>window.removeEventListener('resize',h);
  },[]);
  return{isMobile:w<768};
};

const inputBase=(focused)=>({
  width:'100%',padding:'10px 12px',
  backgroundColor:focused?DS.color.surface:DS.color.surfaceAlt,
  border:`1.5px solid ${focused?DS.color.primary:DS.color.borderLight}`,
  borderRadius:DS.radius,fontSize:'14px',fontFamily:DS.font,
  color:DS.color.graphite,outline:'none',transition:'all 150ms ease',
  boxShadow:focused?`0 0 0 3px ${DS.color.primaryGlow}`:'none',
  boxSizing:'border-box',WebkitAppearance:'none',
});

const generateId=()=>'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==='x'?r:(r&0x3|0x8)).toString(16);});

// Поправен daysUntil — парсира датата като локална, без timezone офсет
const daysUntil=(d)=>{
  if(!d)return null;
  const[y,m,day]=d.split('-').map(Number);
  const expiry=new Date(y,m-1,day);
  const today=new Date(); today.setHours(0,0,0,0);
  return Math.ceil((expiry-today)/(1000*60*60*24));
};

const ValidityBadge=({dateStr})=>{
  const days=daysUntil(dateStr);if(days===null)return null;
  const cfg=days<0?{bg:DS.color.dangerBg,color:DS.color.danger,label:'ИЗТЕКЛА'}:
             days<=30?{bg:DS.color.warningBg,color:DS.color.warning,label:`${days}д.`}:
             {bg:DS.color.okBg,color:DS.color.ok,label:'ВАЛИДНА'};
  return(<span style={{display:'inline-block',fontFamily:DS.font,fontWeight:700,fontSize:'10px',padding:'2px 7px',backgroundColor:cfg.bg,color:cfg.color,whiteSpace:'nowrap',borderRadius:DS.radius,marginTop:'2px'}}>{cfg.label}</span>);
};

const CellInput=({value,onChange,onBlur,type='text',placeholder=''})=>{
  const[focused,setFocused]=useState(false);
  return(<input type={type} value={value||''} placeholder={placeholder}
    onChange={e=>onChange(e.target.value)}
    onFocus={()=>setFocused(true)} onBlur={()=>{setFocused(false);onBlur&&onBlur();}}
    style={{width:'100%',padding:'7px 8px',border:`1.5px solid ${focused?DS.color.primary:'transparent'}`,borderRadius:DS.radius,fontFamily:DS.font,fontSize:'13px',color:DS.color.graphite,outline:'none',backgroundColor:'transparent',transition:'all 150ms',boxSizing:'border-box',boxShadow:focused?`0 0 0 3px ${DS.color.primaryGlow}`:'none',WebkitAppearance:'none',...(type==='date'?{minWidth:'130px'}:{})}}/>);
};

const AlertRow=({alert,onDismiss})=>(
  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'10px',padding:'8px 12px',marginBottom:'4px',backgroundColor:alert.alert_type==='expired'?'rgba(197,48,48,0.06)':DS.color.warningBg,border:`1px solid ${alert.alert_type==='expired'?'rgba(197,48,48,0.2)':'rgba(196,127,23,0.2)'}`}}>
    <div style={{flex:1,minWidth:0}}>
      <span style={{fontFamily:DS.font,fontSize:'13px',fontWeight:600,color:DS.color.graphite}}>{alert.employee_name}</span>
      <span style={{fontFamily:DS.font,fontSize:'12px',color:DS.color.graphiteLight,marginLeft:'8px'}}>
        {alert.alert_type==='expired'?`Изтекла на ${new Date(alert.expiry_date).toLocaleDateString('bg-BG')}`:`Изтича на ${new Date(alert.expiry_date).toLocaleDateString('bg-BG')} (${alert.days_remaining} дни)`}
      </span>
    </div>
    <button onClick={()=>onDismiss(alert.id)} style={{background:'none',border:'none',cursor:'pointer',padding:'4px',color:DS.color.graphiteLight,display:'flex'}}><X style={{width:14,height:14}}/></button>
  </div>
);

const AlertsPanel=({alerts,onDismiss,onDismissAll,isMobile})=>{
  if(!alerts.length)return null;
  const expired=alerts.filter(a=>a.alert_type==='expired');
  const expiring=alerts.filter(a=>a.alert_type==='expiring_soon');
  return(
    <div style={{backgroundColor:DS.color.dangerBg,border:`1.5px solid ${DS.color.danger}`,marginBottom:'16px',animation:'slideDown 300ms ease',boxShadow:'0 0 0 4px rgba(197,48,48,0.08)'}}>
      <div style={{backgroundColor:DS.color.danger,padding:isMobile?'10px 14px':'12px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'10px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <Bell style={{width:16,height:16,color:'white'}}/>
          <span style={{fontFamily:DS.font,fontSize:'13px',fontWeight:700,color:'white',textTransform:'uppercase'}}>Известия — Здравни книжки</span>
          <span style={{backgroundColor:'rgba(255,255,255,0.25)',color:'white',fontFamily:DS.font,fontSize:'11px',fontWeight:700,padding:'1px 7px',borderRadius:'10px'}}>{alerts.length}</span>
        </div>
        <button onClick={onDismissAll} style={{display:'flex',alignItems:'center',gap:'4px',background:'rgba(255,255,255,0.15)',border:'none',color:'white',cursor:'pointer',padding:'5px 10px',fontFamily:DS.font,fontSize:'11px',fontWeight:600}}>
          <BellOff style={{width:12,height:12}}/>{!isMobile&&' Маркирай всички'}
        </button>
      </div>
      <div style={{padding:isMobile?'10px 14px':'12px 20px'}}>
        {expired.length>0&&(<div><p style={{fontFamily:DS.font,fontSize:'11px',fontWeight:700,color:DS.color.danger,textTransform:'uppercase',marginBottom:'6px'}}>Изтекли ({expired.length})</p>{expired.map(a=><AlertRow key={a.id} alert={a} onDismiss={onDismiss}/>)}</div>)}
        {expiring.length>0&&(<div style={{marginTop:expired.length?'10px':0}}><p style={{fontFamily:DS.font,fontSize:'11px',fontWeight:700,color:DS.color.warning,textTransform:'uppercase',marginBottom:'6px'}}>Изтичат скоро ({expiring.length})</p>{expiring.map(a=><AlertRow key={a.id} alert={a} onDismiss={onDismiss}/>)}</div>)}
      </div>
    </div>
  );
};

const HealthBookRegistry=({template,department,restaurantId,onBack})=>{
  const{isMobile}=useResponsive();
  const[loading,setLoading]=useState(false);
  const[fetching,setFetching]=useState(true);
  const[savingId,setSavingId]=useState(null);
  const[autoMsg,setAutoMsg]=useState('');
  const[isOnline,setIsOnline]=useState(navigator.onLine);
  const[pendingOps,setPendingOps]=useState([]);
  const[now,setNow]=useState(new Date());
  const[rows,setRows]=useState([]);
  const[alerts,setAlerts]=useState([]);
  const[searchTerm,setSearch]=useState('');
  const[filterSoon,setFilterSoon]=useState(false);
  const[showExit,setShowExit]=useState(false);
  const[hasDirty,setHasDirty]=useState(false);

  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(t);},[]);
  
  const showMsg=(msg)=>{setAutoMsg(msg);setTimeout(()=>setAutoMsg(''),3000);};

  useEffect(()=>{
    const goOn=()=>{setIsOnline(true);syncPending();};
    const goOff=()=>setIsOnline(false);
    window.addEventListener('online',goOn);window.addEventListener('offline',goOff);
    return()=>{window.removeEventListener('online',goOn);window.removeEventListener('offline',goOff);};
  },[]);

  useEffect(()=>{fetchData();},[restaurantId]);

  const fetchData=async()=>{
    setFetching(true);
    try{
      const[{data:books,error:bErr},{data:alertData,error:aErr}]=await Promise.all([
        supabase.from('health_books').select('*').eq('restaurant_id',restaurantId).order('employee_name'),
        supabase.from('health_book_alerts').select('*').eq('restaurant_id',restaurantId).eq('is_read',false).order('days_remaining'),
      ]);
      if(bErr)throw bErr;if(aErr)throw aErr;
      setRows(books||[]);setAlerts(alertData||[]);
    }catch(err){console.error('fetchData:',err);showMsg('⚠ Грешка при зареждане');}
    finally{setFetching(false);}
  };

  const PENDING_KEY=`hbr_pending_${restaurantId}`;
  const getPending=()=>{try{return JSON.parse(localStorage.getItem(PENDING_KEY)||'[]');}catch{return[];}};

  const syncPending=useCallback(async()=>{
    const queue=getPending();if(!queue.length)return;
    const failed=[];
    for(const op of queue){
      try{
        if(op.type==='upsert'){
          const{_isNew,_dirty,...data}=op.row;
          if(_isNew)await supabase.from('health_books').insert(data);
          else{const{updated_at,created_at,created_by,...upd}=data;await supabase.from('health_books').update(upd).eq('id',data.id);}
        }else if(op.type==='delete'){await supabase.from('health_books').delete().eq('id',op.id);}
      }catch{failed.push(op);}
    }
    localStorage.setItem(PENDING_KEY,JSON.stringify(failed));setPendingOps(failed);
    if(!failed.length)showMsg('✓ Офлайн данни синхронизирани');
  },[restaurantId]);

  const newRow=()=>({id:generateId(),restaurant_id:restaurantId,employee_name:'',position:'',egn:'',cert_date_1:null,expiry_date_1:null,cert_date_2:null,expiry_date_2:null,notes:'',_isNew:true,_dirty:true});
  const addRow=()=>{setRows(prev=>[...prev,newRow()]);setHasDirty(true);};

  const updateRowField=(id,field,value)=>{
    setRows(prev=>prev.map(r=>r.id===id?{...r,[field]:value||null,_dirty:true}:r));
    setHasDirty(true);
  };

  const deleteRow=async(id)=>{
    if(!window.confirm('Изтриване на записа?'))return;
    setRows(prev=>prev.filter(r=>r.id!==id));
    if(!navigator.onLine){const q=getPending();q.push({type:'delete',id});localStorage.setItem(PENDING_KEY,JSON.stringify(q));setPendingOps(q);return;}
    const{error}=await supabase.from('health_books').delete().eq('id',id);
    if(error)showMsg('⚠ Грешка при изтриване');
  };

  const saveRow=async(rowId)=>{
    const row=rows.find(r=>r.id===rowId);
    if(!row||!row._dirty||!row.employee_name?.trim())return;
    setSavingId(rowId);
    const{_isNew,_dirty,...data}=row;
    if(!navigator.onLine){
      const q=getPending();q.push({type:'upsert',row:{...data,_isNew}});
      localStorage.setItem(PENDING_KEY,JSON.stringify(q));setPendingOps(q);
      setRows(prev=>prev.map(r=>r.id===rowId?{...r,_dirty:false}:r));setSavingId(null);return;
    }
    try{
      if(_isNew){const{error}=await supabase.from('health_books').insert(data);if(error)throw error;}
      else{const{updated_at,created_at,created_by,...upd}=data;const{error}=await supabase.from('health_books').update(upd).eq('id',rowId);if(error)throw error;}
      setRows(prev=>prev.map(r=>r.id===rowId?{...r,_isNew:false,_dirty:false}:r));showMsg('✓ Запазено');
    }catch(err){console.error('saveRow:',err);showMsg('⚠ Грешка при запазване');}
    finally{setSavingId(null);}
  };

  const saveAll=async()=>{
    setLoading(true);
    for(const row of rows.filter(r=>r._dirty&&r.employee_name?.trim()))await saveRow(row.id);
    setHasDirty(false);setLoading(false);showMsg('✓ Всички промени запазени');
  };

  const dismissAlert=async(id)=>{setAlerts(prev=>prev.filter(a=>a.id!==id));await supabase.from('health_book_alerts').update({is_read:true}).eq('id',id);};
  const dismissAllAlerts=async()=>{const ids=alerts.map(a=>a.id);setAlerts([]);await supabase.from('health_book_alerts').update({is_read:true}).in('id',ids);};

  const filteredRows=rows.filter(r=>{
    const s=searchTerm.toLowerCase();
    if(s&&!r.employee_name?.toLowerCase().includes(s)&&!r.position?.toLowerCase().includes(s))return false;
    if(filterSoon){const d1=daysUntil(r.expiry_date_1),d2=daysUntil(r.expiry_date_2);return(d1!==null&&d1<=30)||(d2!==null&&d2<=30);}
    return true;
  });

  const totalFilled=rows.filter(r=>r.employee_name?.trim()).length;
  const expiredCount=rows.filter(r=>{const d1=daysUntil(r.expiry_date_1),d2=daysUntil(r.expiry_date_2);return(d1!==null&&d1<0)||(d2!==null&&d2<0);}).length;
  const expiringCount=rows.filter(r=>{const d1=daysUntil(r.expiry_date_1),d2=daysUntil(r.expiry_date_2);return(d1!==null&&d1>=0&&d1<=30)||(d2!==null&&d2>=0&&d2<=30);}).length;

  const pad=isMobile?'12px':'24px';
  const thStyle={padding:'12px 10px',color:'white',fontWeight:700,fontFamily:DS.font,fontSize:'11px',textTransform:'uppercase',letterSpacing:'0.02em',borderRight:'1px solid rgba(255,255,255,0.15)',whiteSpace:'nowrap',textAlign:'center'};
  const tdStyle={padding:isMobile?'8px 6px':'10px 8px',borderRight:`1px solid ${DS.color.borderLight}`,borderBottom:`1px solid ${DS.color.borderLight}`,fontFamily:DS.font,fontSize:'13px',verticalAlign:'middle'};

  return(
    <>{<style>{GLOBAL_CSS}</style>}
    <div style={{minHeight:'100vh',backgroundColor:DS.color.bg,fontFamily:DS.font,color:DS.color.graphite,display:'flex',flexDirection:'column'}}>

      {showExit&&(
        <div style={{position:'fixed',inset:0,backgroundColor:'rgba(30,42,38,0.5)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'16px'}}>
          <div style={{backgroundColor:DS.color.surface,padding:isMobile?'24px 20px':'32px',maxWidth:'480px',width:'100%',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
            <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px'}}><AlertCircle style={{color:DS.color.warning,width:20,height:20}}/><h3 style={{margin:0,fontSize:'16px',fontWeight:700}}>Незапазени промени</h3></div>
            <p style={{marginBottom:'20px',color:DS.color.graphiteMed,lineHeight:1.6,fontSize:'14px'}}>Имате незапазени промени. Какво искате да направите?</p>
            <div style={{display:'flex',gap:'8px',flexDirection:isMobile?'column':'row',justifyContent:'flex-end'}}>
              {[{label:'Отказ',bg:DS.color.pendingBg,color:DS.color.graphiteMed,action:()=>setShowExit(false)},{label:'Изход без запазване',bg:DS.color.danger,color:'white',action:()=>onBack()},{label:'Запази и излез',bg:DS.color.primary,color:'white',action:async()=>{await saveAll();onBack();}}].map((b,i)=>(
                <button key={i} onClick={b.action} style={{padding:'12px 16px',backgroundColor:b.bg,color:b.color,border:'none',cursor:'pointer',fontSize:'13px',fontWeight:600,fontFamily:DS.font,width:isMobile?'100%':'auto'}}>{b.label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{backgroundColor:DS.color.graphite,padding:isMobile?'8px 12px':'10px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100,boxShadow:'0 2px 12px rgba(0,0,0,0.15)',gap:'8px'}}>
        <button onClick={()=>hasDirty?setShowExit(true):onBack()} style={{display:'flex',alignItems:'center',gap:'4px',padding:isMobile?'8px 10px':'6px 14px',backgroundColor:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.7)',cursor:'pointer',fontFamily:DS.font,fontSize:'12px',fontWeight:600,minHeight:'36px'}}>
          <ChevronLeft style={{width:14,height:14}}/>{!isMobile&&'Назад'}
        </button>
        <div style={{display:'flex',alignItems:'center',gap:isMobile?'6px':'16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'6px',backgroundColor:isOnline?'rgba(27,138,80,0.15)':'rgba(197,48,48,0.2)',padding:'4px 10px'}}>
            <span style={{width:8,height:8,borderRadius:'50%',backgroundColor:isOnline?'#1B8A50':DS.color.danger,display:'inline-block'}}/>
            {!isMobile&&<span style={{fontFamily:DS.font,fontSize:'10px',fontWeight:600,color:'rgba(255,255,255,0.6)',textTransform:'uppercase'}}>{isOnline?'Онлайн':'Офлайн'}</span>}
            {pendingOps.length>0&&<span style={{backgroundColor:DS.color.warning,color:'white',fontFamily:DS.font,fontSize:'9px',fontWeight:700,padding:'1px 5px',borderRadius:'10px'}}>{pendingOps.length}</span>}
          </div>
          {alerts.length>0&&(<div style={{display:'flex',alignItems:'center',gap:'6px',backgroundColor:'rgba(197,48,48,0.2)',padding:'4px 10px'}}><Bell style={{width:13,height:13,color:'#FCA5A5'}}/><span style={{fontFamily:DS.font,fontSize:'10px',fontWeight:700,color:'#FCA5A5'}}>{alerts.length}</span></div>)}
          {autoMsg&&<span style={{fontFamily:DS.font,fontSize:'11px',color:autoMsg.startsWith('⚠')?'rgba(255,200,200,0.9)':DS.color.ok,display:'flex',alignItems:'center',gap:'4px',fontWeight:500}}><CheckCircle style={{width:12,height:12}}/>{isMobile?'✓':autoMsg}</span>}
          <span style={{fontFamily:DS.font,fontSize:isMobile?'11px':'12px',fontWeight:500,color:'rgba(255,255,255,0.4)'}}>{now.toLocaleString('bg-BG',{hour:'2-digit',minute:'2-digit',...(isMobile?{}:{second:'2-digit'}),day:'2-digit',month:'2-digit',...(isMobile?{}:{year:'numeric'}),hour12:false})}</span>
        </div>
      </div>

      <div style={{maxWidth:'1600px',margin:'0 auto',padding:pad,flex:1,width:'100%'}}>

        <div style={{display:'flex',flexDirection:isMobile?'column':'row',justifyContent:'space-between',alignItems:isMobile?'stretch':'center',marginBottom:isMobile?'16px':'24px',gap:'16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:isMobile?'10px':'14px'}}>
            <img src={LOGO_URL} alt="Aladin Foods" style={{height:isMobile?'36px':'48px',width:'auto',objectFit:'contain',flexShrink:0}}/>
            <div>
              <h1 style={{fontSize:isMobile?'14px':'20px',fontWeight:700,color:DS.color.primary,margin:0,textTransform:'uppercase',lineHeight:1.3}}>Регистър на здравните книжки</h1>
              <p style={{fontFamily:DS.font,fontSize:isMobile?'10px':'12px',color:DS.color.graphiteLight,fontWeight:500,margin:'2px 0 0'}}>Контрол на работното облекло и хигиена на персонала</p>
            </div>
          </div>
          <div style={{backgroundColor:DS.color.surface,border:`1px solid ${DS.color.borderLight}`,padding:isMobile?'8px 12px':'10px 16px',display:'flex',gap:isMobile?'12px':'16px',boxShadow:DS.shadow.sm,alignSelf:isMobile?'flex-start':'center'}}>
            {[{label:'КОД',value:'ПРП 4.0.1'},{label:'РЕД.',value:'00'},{label:'СТР.',value:'1/1'}].map((item,i)=>(
              <div key={i} style={{textAlign:'center'}}>
                <div style={{fontFamily:DS.font,fontSize:'9px',fontWeight:600,color:DS.color.graphiteMuted,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'2px'}}>{item.label}</div>
                <div style={{fontFamily:DS.font,fontSize:'12px',fontWeight:700,color:DS.color.graphite}}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <AlertsPanel alerts={alerts} onDismiss={dismissAlert} onDismissAll={dismissAllAlerts} isMobile={isMobile}/>

        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':'repeat(3,1fr)',gap:'12px',marginBottom:'16px'}}>
          {[
            {icon:<BookOpen style={{width:18,height:18}}/>,label:'Служители',value:totalFilled,bg:DS.color.okBg,color:DS.color.primary},
            {icon:<AlertCircle style={{width:18,height:18}}/>,label:'Изтекли',value:expiredCount,bg:expiredCount>0?DS.color.dangerBg:DS.color.surfaceAlt,color:expiredCount>0?DS.color.danger:DS.color.graphiteLight},
            {icon:<AlertTriangle style={{width:18,height:18}}/>,label:'Изтичат (30 дни)',value:expiringCount,bg:expiringCount>0?DS.color.warningBg:DS.color.surfaceAlt,color:expiringCount>0?DS.color.warning:DS.color.graphiteLight},
          ].map((s,i)=>(
            <div key={i} style={{backgroundColor:s.bg,border:`1px solid ${DS.color.borderLight}`,padding:'14px 16px',display:'flex',alignItems:'center',gap:'12px',boxShadow:DS.shadow.sm}}>
              <div style={{color:s.color}}>{s.icon}</div>
              <div><div style={{fontFamily:DS.font,fontSize:'22px',fontWeight:700,color:s.color,lineHeight:1}}>{s.value}</div><div style={{fontFamily:DS.font,fontSize:'11px',fontWeight:600,color:DS.color.graphiteLight,textTransform:'uppercase',marginTop:'2px'}}>{s.label}</div></div>
            </div>
          ))}
        </div>

        <div style={{backgroundColor:DS.color.surface,border:`1px solid ${DS.color.borderLight}`,padding:pad,marginBottom:'16px',display:'flex',gap:'10px',alignItems:'center',flexWrap:'wrap',boxShadow:DS.shadow.sm}}>
          <div style={{position:'relative',flex:1,minWidth:'200px'}}>
            <Search style={{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',width:15,height:15,color:DS.color.graphiteLight,pointerEvents:'none'}}/>
            <input type="text" value={searchTerm} onChange={e=>setSearch(e.target.value)} placeholder="Търси по ime или длъжност..." style={{...inputBase(false),paddingLeft:'32px'}}/>
          </div>
          <button onClick={()=>setFilterSoon(!filterSoon)} style={{display:'flex',alignItems:'center',gap:'6px',padding:'10px 14px',backgroundColor:filterSoon?DS.color.warningBg:DS.color.surfaceAlt,border:`1.5px solid ${filterSoon?DS.color.warning:DS.color.borderLight}`,color:filterSoon?DS.color.warning:DS.color.graphiteMed,cursor:'pointer',fontFamily:DS.font,fontSize:'12px',fontWeight:600,whiteSpace:'nowrap'}}>
            <AlertTriangle style={{width:14,height:14}}/>{filterSoon?'Всички':'Изтичащи скоро'}
          </button>
        </div>

        <div style={{backgroundColor:DS.color.surface,border:`1px solid ${DS.color.borderLight}`,overflow:'hidden',marginBottom:'16px',boxShadow:DS.shadow.md}}>
          {fetching?(<div style={{padding:'40px',textAlign:'center',color:DS.color.graphiteLight,fontFamily:DS.font}}>Зареждане...</div>):(
            isMobile ? (
              /* ═══ МОБИЛЕН ИЗГЛЕД: Карти ═══ */
              <div style={{padding:'10px',display:'flex',flexDirection:'column',gap:'8px'}}>
                {filteredRows.length===0?(
                  <div style={{padding:'32px',textAlign:'center',color:DS.color.graphiteLight,fontFamily:DS.font,fontSize:'14px'}}>
                    {searchTerm||filterSoon?'Няма намерени записи':'Няма добавени служители'}
                  </div>
                ):filteredRows.map((row,ri)=>{
                  const d1=daysUntil(row.expiry_date_1),d2=daysUntil(row.expiry_date_2);
                  const isExp=(d1!==null&&d1<0)||(d2!==null&&d2<0);
                  const isSaving=savingId===row.id;
                  return(
                    <div key={row.id} style={{backgroundColor:isExp?DS.color.dangerBg:DS.color.surface,border:`1.5px solid ${isExp?DS.color.danger:DS.color.borderLight}`,padding:'14px',position:'relative'}}>
                      {/* Заглавие на картата */}
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}}>
                        <span style={{fontFamily:DS.font,fontSize:'11px',fontWeight:700,color:DS.color.graphiteMuted}}>
                          {isSaving?'…':row._dirty?<span style={{color:DS.color.warning}}>● незапазено</span>:`#${ri+1}`}
                        </span>
                        <button onClick={()=>deleteRow(row.id)} style={{background:'none',border:'none',color:DS.color.danger,cursor:'pointer',padding:'4px',display:'inline-flex',opacity:0.5}} onMouseEnter={e=>e.currentTarget.style.opacity='1'} onMouseLeave={e=>e.currentTarget.style.opacity='0.5'}>
                          <Trash2 style={{width:14,height:14}}/>
                        </button>
                      </div>
                      {/* Ime и Длъжност */}
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'10px'}}>
                        <div>
                          <div style={{fontFamily:DS.font,fontSize:'10px',fontWeight:600,color:DS.color.graphiteLight,textTransform:'uppercase',marginBottom:'4px'}}>Ime и Фамилия</div>
                          <input type="text" value={row.employee_name||''} placeholder="Иван Иванов"
                            onChange={e=>updateRowField(row.id,'employee_name',e.target.value)}
                            onBlur={()=>saveRow(row.id)}
                            style={{width:'100%',padding:'8px 10px',border:`1.5px solid ${DS.color.borderLight}`,fontFamily:DS.font,fontSize:'13px',color:DS.color.graphite,outline:'none',backgroundColor:DS.color.surfaceAlt,boxSizing:'border-box'}}/>
                        </div>
                        <div>
                          <div style={{fontFamily:DS.font,fontSize:'10px',fontWeight:600,color:DS.color.graphiteLight,textTransform:'uppercase',marginBottom:'4px'}}>Длъжност</div>
                          <input type="text" value={row.position||''} placeholder="Касиер"
                            onChange={e=>updateRowField(row.id,'position',e.target.value)}
                            onBlur={()=>saveRow(row.id)}
                            style={{width:'100%',padding:'8px 10px',border:`1.5px solid ${DS.color.borderLight}`,fontFamily:DS.font,fontSize:'13px',color:DS.color.graphite,outline:'none',backgroundColor:DS.color.surfaceAlt,boxSizing:'border-box'}}/>
                        </div>
                      </div>
                      {/* ЕГН */}
                      <div style={{marginBottom:'10px'}}>
                        <div style={{fontFamily:DS.font,fontSize:'10px',fontWeight:600,color:DS.color.graphiteLight,textTransform:'uppercase',marginBottom:'4px'}}>ЕГН</div>
                        <input type="text" value={row.egn||''} placeholder="0000000000"
                          onChange={e=>updateRowField(row.id,'egn',e.target.value)}
                          onBlur={()=>saveRow(row.id)}
                          style={{width:'100%',padding:'8px 10px',border:`1.5px solid ${DS.color.borderLight}`,fontFamily:DS.font,fontSize:'13px',color:DS.color.graphite,outline:'none',backgroundColor:DS.color.surfaceAlt,boxSizing:'border-box'}}/>
                      </div>
                      {/* Заверка 1 */}
                      <div style={{backgroundColor:DS.color.surfaceAlt,border:`1px solid ${DS.color.borderLight}`,padding:'10px',marginBottom:'8px'}}>
                        <div style={{fontFamily:DS.font,fontSize:'10px',fontWeight:700,color:DS.color.primary,textTransform:'uppercase',marginBottom:'8px'}}>1-ва заверка</div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                          <div>
                            <div style={{fontFamily:DS.font,fontSize:'10px',color:DS.color.graphiteLight,marginBottom:'4px'}}>Дата заверка</div>
                            <input type="date" value={row.cert_date_1||''}
                              onChange={e=>updateRowField(row.id,'cert_date_1',e.target.value)}
                              onBlur={()=>saveRow(row.id)}
                              style={{width:'100%',padding:'7px 8px',border:`1.5px solid ${DS.color.borderLight}`,fontFamily:DS.font,fontSize:'13px',color:DS.color.graphite,outline:'none',backgroundColor:DS.color.surface,boxSizing:'border-box'}}/>
                          </div>
                          <div>
                            <div style={{fontFamily:DS.font,fontSize:'10px',color:DS.color.graphiteLight,marginBottom:'4px'}}>Изтича</div>
                            <input type="date" value={row.expiry_date_1||''}
                              onChange={e=>updateRowField(row.id,'expiry_date_1',e.target.value)}
                              onBlur={()=>saveRow(row.id)}
                              style={{width:'100%',padding:'7px 8px',border:`1.5px solid ${(d1!==null&&d1<0)?DS.color.danger:(d1!==null&&d1<=30)?DS.color.warning:DS.color.borderLight}`,fontFamily:DS.font,fontSize:'13px',color:DS.color.graphite,outline:'none',backgroundColor:DS.color.surface,boxSizing:'border-box'}}/>
                            <ValidityBadge dateStr={row.expiry_date_1}/>
                          </div>
                        </div>
                      </div>
                      {/* Заверка 2 */}
                      <div style={{backgroundColor:DS.color.surfaceAlt,border:`1px solid ${DS.color.borderLight}`,padding:'10px'}}>
                        <div style={{fontFamily:DS.font,fontSize:'10px',fontWeight:700,color:DS.color.primary,textTransform:'uppercase',marginBottom:'8px'}}>2-ра заверка</div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                          <div>
                            <div style={{fontFamily:DS.font,fontSize:'10px',color:DS.color.graphiteLight,marginBottom:'4px'}}>Дата заверка</div>
                            <input type="date" value={row.cert_date_2||''}
                              onChange={e=>updateRowField(row.id,'cert_date_2',e.target.value)}
                              onBlur={()=>saveRow(row.id)}
                              style={{width:'100%',padding:'7px 8px',border:`1.5px solid ${DS.color.borderLight}`,fontFamily:DS.font,fontSize:'13px',color:DS.color.graphite,outline:'none',backgroundColor:DS.color.surface,boxSizing:'border-box'}}/>
                          </div>
                          <div>
                            <div style={{fontFamily:DS.font,fontSize:'10px',color:DS.color.graphiteLight,marginBottom:'4px'}}>Изтича</div>
                            <input type="date" value={row.expiry_date_2||''}
                              onChange={e=>updateRowField(row.id,'expiry_date_2',e.target.value)}
                              onBlur={()=>saveRow(row.id)}
                              style={{width:'100%',padding:'7px 8px',border:`1.5px solid ${(d2!==null&&d2<0)?DS.color.danger:(d2!==null&&d2<=30)?DS.color.warning:DS.color.borderLight}`,fontFamily:DS.font,fontSize:'13px',color:DS.color.graphite,outline:'none',backgroundColor:DS.color.surface,boxSizing:'border-box'}}/>
                            <ValidityBadge dateStr={row.expiry_date_2}/>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
            /* ═══ ДЕСКТОП ИЗГЛЕД: Таблица ═══ */
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',minWidth:'900px'}}>
                <thead>
                  <tr style={{backgroundColor:DS.color.primary}}>
                    <th style={{...thStyle,width:'44px'}}>№</th>
                    <th style={{...thStyle,textAlign:'left',minWidth:'170px'}}>Ime и Фамилия</th>
                    <th style={{...thStyle,textAlign:'left',minWidth:'130px'}}>Длъжност</th>
                    <th style={{...thStyle,minWidth:'110px'}}>ЕГН</th>
                    <th style={{...thStyle,minWidth:'120px',borderLeft:'2px solid rgba(255,255,255,0.25)'}}>Дата заверка<br/><span style={{fontWeight:400,fontSize:'9px',opacity:0.7}}>1-ва</span></th>
                    <th style={{...thStyle,minWidth:'140px'}}>Изтича<br/><span style={{fontWeight:400,fontSize:'9px',opacity:0.7}}>1-ва</span></th>
                    <th style={{...thStyle,minWidth:'120px',borderLeft:'2px solid rgba(255,255,255,0.25)'}}>Дата заверка<br/><span style={{fontWeight:400,fontSize:'9px',opacity:0.7}}>2-ра</span></th>
                    <th style={{...thStyle,minWidth:'140px'}}>Изтича<br/><span style={{fontWeight:400,fontSize:'9px',opacity:0.7}}>2-ра</span></th>
                    <th style={{...thStyle,width:'50px',borderRight:'none'}}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row,ri)=>{
                    const d1=daysUntil(row.expiry_date_1),d2=daysUntil(row.expiry_date_2);
                    const isExp=(d1!==null&&d1<0)||(d2!==null&&d2<0);
                    const rowBg=isExp?DS.color.dangerBg:ri%2===0?DS.color.surface:DS.color.surfaceAlt;
                    const isSaving=savingId===row.id;
                    return(
                      <tr key={row.id} style={{backgroundColor:rowBg}}>
                        <td style={{...tdStyle,textAlign:'center',color:DS.color.graphiteMuted,fontWeight:700,fontSize:'12px'}}>
                          {isSaving?<span style={{color:DS.color.primary}}>…</span>:row._dirty?<span style={{color:DS.color.warning,fontSize:'16px'}}>•</span>:ri+1}
                        </td>
                        <td style={{...tdStyle,textAlign:'left'}}><CellInput value={row.employee_name} placeholder="Иван Иванов" onChange={v=>updateRowField(row.id,'employee_name',v)} onBlur={()=>saveRow(row.id)}/></td>
                        <td style={{...tdStyle,textAlign:'left'}}><CellInput value={row.position} placeholder="Касиер" onChange={v=>updateRowField(row.id,'position',v)} onBlur={()=>saveRow(row.id)}/></td>
                        <td style={{...tdStyle,textAlign:'center'}}><CellInput value={row.egn} placeholder="0000000000" onChange={v=>updateRowField(row.id,'egn',v)} onBlur={()=>saveRow(row.id)}/></td>
                        <td style={{...tdStyle,textAlign:'center',borderLeft:`2px solid ${DS.color.borderLight}`}}><CellInput type="date" value={row.cert_date_1} onChange={v=>updateRowField(row.id,'cert_date_1',v)} onBlur={()=>saveRow(row.id)}/></td>
                        <td style={{...tdStyle,textAlign:'center'}}><CellInput type="date" value={row.expiry_date_1} onChange={v=>updateRowField(row.id,'expiry_date_1',v)} onBlur={()=>saveRow(row.id)}/><div style={{textAlign:'center'}}><ValidityBadge dateStr={row.expiry_date_1}/></div></td>
                        <td style={{...tdStyle,textAlign:'center',borderLeft:`2px solid ${DS.color.borderLight}`}}><CellInput type="date" value={row.cert_date_2} onChange={v=>updateRowField(row.id,'cert_date_2',v)} onBlur={()=>saveRow(row.id)}/></td>
                        <td style={{...tdStyle,textAlign:'center'}}><CellInput type="date" value={row.expiry_date_2} onChange={v=>updateRowField(row.id,'expiry_date_2',v)} onBlur={()=>saveRow(row.id)}/><div style={{textAlign:'center'}}><ValidityBadge dateStr={row.expiry_date_2}/></div></td>
                        <td style={{...tdStyle,textAlign:'center',borderRight:'none'}}>
                          <button onClick={()=>deleteRow(row.id)} style={{background:'none',border:'none',color:DS.color.danger,cursor:'pointer',padding:'4px',display:'inline-flex',opacity:0.4,transition:'opacity 150ms'}}
                            onMouseEnter={e=>e.currentTarget.style.opacity='1'} onMouseLeave={e=>e.currentTarget.style.opacity='0.4'}>
                            <Trash2 style={{width:14,height:14}}/>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRows.length===0&&(<tr><td colSpan={9} style={{padding:'32px',textAlign:'center',color:DS.color.graphiteLight,fontFamily:DS.font,fontSize:'14px'}}>{searchTerm||filterSoon?'Няма намерени записи':'Няма добавени служители'}</td></tr>)}
                </tbody>
              </table>
            </div>
            )
          )}
        </div>

        <div style={{display:'flex',gap:'8px',marginBottom:isMobile?'16px':'24px',flexWrap:'wrap'}}>
          <button onClick={addRow} style={{display:'flex',alignItems:'center',gap:'6px',padding:'10px 16px',backgroundColor:DS.color.primary,border:'none',color:'white',cursor:'pointer',fontFamily:DS.font,fontSize:'12px',fontWeight:600,minHeight:'40px'}}>
            <Plus style={{width:14,height:14}}/>Добави служител
          </button>
          {hasDirty&&(
            <button onClick={saveAll} disabled={loading} style={{display:'flex',alignItems:'center',gap:'6px',padding:'10px 16px',backgroundColor:DS.color.okBg,border:`1.5px solid ${DS.color.ok}`,color:DS.color.ok,cursor:'pointer',fontFamily:DS.font,fontSize:'12px',fontWeight:600,minHeight:'40px',animation:'ctrlBreathe 3s ease-in-out infinite'}}>
              <Save style={{width:14,height:14}}/>{loading?'Запазване...':'Запази всички промени'}
            </button>
          )}
        </div>
      </div>

      <div style={{textAlign:'center',padding:isMobile?'16px 12px':'20px 24px',color:DS.color.graphiteMuted,fontFamily:DS.font,fontSize:'11px',fontWeight:500,borderTop:`1px solid ${DS.color.borderLight}`,marginTop:'auto'}}>
        © 2026 Aladin Foods | by MG
      </div>
    </div>
    </>
  );
};

export default HealthBookRegistry;