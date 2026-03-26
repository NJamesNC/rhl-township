import { useState, useEffect, useRef } from "react";

const W = 900, H = 900, CX = 450, CY = 450, R = 320;

const SQUADS = [
  { id:1,  name:"Merch",        full:"ReflectHisLight Merch",   squad:"Squad 01", emoji:"🛍️", color:"#00ffe7", desc:"Etsy/Printify print-on-demand. SEO agent + Pinterest bot." },
  { id:2,  name:"Aria",         full:"Aria Receptionist",        squad:"Squad 02", emoji:"📞", color:"#ff2cf7", desc:"VAPI.ai + GoHighLevel. Live at (210) 791-7775 — English & Spanish." },
  { id:3,  name:"KDP",          full:"KDP Publishing",           squad:"Squad 03", emoji:"📚", color:"#ffe500", desc:"Amazon KDP. Coloring books, children's books, keyword agents." },
  { id:4,  name:"Vibe\nFactory",full:"Vibe Coding Factory",      squad:"Squad 04", emoji:"⚡", color:"#ff6b00", desc:"Hermes self-improving loops. CrewAI orchestration. Rapid prototyping." },
  { id:5,  name:"Librarian",    full:"The Librarian",            squad:"Squad 05", emoji:"🗄️", color:"#4ade80", desc:"Knowledge intake & dedup into AnythingLLM via Gemini Flash." },
  { id:6,  name:"Aria's\nDesk", full:"Aria's Desk",              squad:"Squad 06", emoji:"🗓️", color:"#e879f9", desc:"Daily Telegram briefings, task entry, Gmail triage." },
  { id:7,  name:"Studio",       full:"The Studio",               squad:"Squad 07", emoji:"🎨", color:"#a78bfa", desc:"Creative pipeline — Ideogram + fal.ai content generation." },
  { id:8,  name:"Shield",       full:"The Shield — RHLPD",       squad:"Squad 08", emoji:"🛡️", color:"#00e5ff", desc:"Security watchdog. Monitors APIs, Railway, Replit exposure." },
  { id:9,  name:"Station",      full:"The Station",              squad:"Squad 09", emoji:"🚒", color:"#ff6b35", desc:"Fire + Hospital combined. Autonomous incident response & recovery." },
  { id:11, name:"Treasury",     full:"The Treasury",             squad:"Squad 11", emoji:"💰", color:"#ffd700", desc:"Token counter + coupon cutter. ROI auditor. Keeps spend minimal." },
  { id:12, name:"Academy",      full:"The Academy",              squad:"Squad 12", emoji:"🎓", color:"#c084fc", desc:"Monitors AI updates daily. Trains all squads. Benchmarks improvements." },
];

const CHAPEL = {
  id:10, name:"The Chapel", squad:"Squad 10", emoji:"✝️", color:"#ffffff",
  desc:"The Apologist · The Scribe · The Curator · The Seeker · The Shepherd — feeds mission to every squad.",
};

const CONNECTIONS = [
  [8,9,"#00e5ff"],[8,11,"#ffd700"],[12,4,"#c084fc"],[12,5,"#c084fc"],
  [11,1,"#ffd700"],[11,2,"#ffd700"],[6,2,"#e879f9"],[5,7,"#4ade80"],
];

const BG_NODES = Array.from({length:28},(_,i)=>({
  x: Math.random()*W, y: Math.random()*H,
  vx:(Math.random()-.5)*0.4, vy:(Math.random()-.5)*0.4,
  r: 1+Math.random()*2,
  color:["#00ffe722","#ff2cf711","#ffe50011","#ffffff0d"][i%4],
}));

function getPositions(){
  return SQUADS.map((sq,i)=>{
    const angle=(i*(2*Math.PI/SQUADS.length))-Math.PI/2;
    return {...sq, x:CX+R*Math.cos(angle), y:CY+R*Math.sin(angle)};
  });
}

function lerp(a,b,t){return a+(b-a)*t;}

export default function RHLTownship(){
  const bgRef    = useRef(null);
  const mainRef  = useRef(null);
  const frameRef = useRef(0);
  const bgNodes  = useRef(BG_NODES.map(n=>({...n})));
  const [nodes]  = useState(getPositions);
  const [selected,setSelected] = useState(null);
  const [hovered,setHovered]   = useState(null);
  const [time,setTime]         = useState("");

  useEffect(()=>{
    const t=()=>setTime(new Date().toLocaleTimeString("en-US",{hour12:false}));
    t(); const id=setInterval(t,1000); return()=>clearInterval(id);
  },[]);

  useEffect(()=>{
    const canvas=bgRef.current;
    const ctx=canvas.getContext("2d");
    const pts=bgNodes.current;
    let af;
    const draw=()=>{
      ctx.clearRect(0,0,W,H);
      pts.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0||p.x>W) p.vx*=-1;
        if(p.y<0||p.y>H) p.vy*=-1;
      });
      pts.forEach((p,i)=>{
        pts.forEach((q,j)=>{
          if(j<=i) return;
          const d=Math.hypot(p.x-q.x,p.y-q.y);
          if(d<140){
            ctx.beginPath();
            ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y);
            ctx.strokeStyle=`rgba(0,230,255,${0.04*(1-d/140)})`;
            ctx.lineWidth=0.5; ctx.stroke();
          }
        });
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=p.color;
        ctx.fill();
      });
      af=requestAnimationFrame(draw);
    };
    af=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(af);
  },[]);

  useEffect(()=>{
    const canvas=mainRef.current;
    const ctx=canvas.getContext("2d");

    const cParts=nodes.map((n,i)=>({
      tx:n.x, ty:n.y, col:n.color,
      p:(i/nodes.length),
      spd:0.0022+Math.random()*0.0018,
      trail:0.07,
    }));

    const iParts=CONNECTIONS.flatMap(([a,b,col])=>{
      const from=nodes.find(n=>n.id===a);
      const to=nodes.find(n=>n.id===b);
      if(!from||!to) return [];
      return [{fx:from.x,fy:from.y,tx:to.x,ty:to.y,col,p:Math.random(),spd:0.005}];
    });

    const ekgOffset=nodes.map(()=>Math.random()*100);

    let af;
    const draw=()=>{
      const f=frameRef.current;
      ctx.clearRect(0,0,W,H);

      [R-2,R+2].forEach(r=>{
        ctx.beginPath();
        ctx.arc(CX,CY,r,0,Math.PI*2);
        ctx.strokeStyle="rgba(0,229,255,0.06)";
        ctx.lineWidth=1;
        ctx.setLineDash([6,14]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      ctx.save();
      ctx.translate(CX,CY);
      ctx.rotate(f*0.003);
      ctx.beginPath();
      ctx.arc(0,0,R+18,0,Math.PI*2);
      ctx.strokeStyle="rgba(255,44,247,0.08)";
      ctx.lineWidth=1;
      ctx.setLineDash([3,20]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      ctx.save();
      ctx.translate(CX,CY);
      ctx.rotate(-f*0.002);
      ctx.beginPath();
      ctx.arc(0,0,R+34,0,Math.PI*2);
      ctx.strokeStyle="rgba(0,255,231,0.05)";
      ctx.lineWidth=1;
      ctx.setLineDash([2,28]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      ctx.beginPath();
      ctx.arc(CX,CY,90,0,Math.PI*2);
      ctx.strokeStyle="rgba(255,255,255,0.06)";
      ctx.lineWidth=1;
      ctx.setLineDash([4,10]);
      ctx.stroke();
      ctx.setLineDash([]);

      nodes.forEach(node=>{
        const grad=ctx.createLinearGradient(CX,CY,node.x,node.y);
        grad.addColorStop(0,"rgba(255,255,255,0.08)");
        grad.addColorStop(1,node.color+"18");
        ctx.beginPath();
        ctx.moveTo(CX,CY);
        ctx.lineTo(node.x,node.y);
        ctx.strokeStyle=grad;
        ctx.lineWidth=1;
        ctx.stroke();
      });

      CONNECTIONS.forEach(([a,b,col])=>{
        const from=nodes.find(n=>n.id===a);
        const to=nodes.find(n=>n.id===b);
        if(!from||!to) return;
        const grad=ctx.createLinearGradient(from.x,from.y,to.x,to.y);
        grad.addColorStop(0,col+"30");
        grad.addColorStop(0.5,col+"60");
        grad.addColorStop(1,col+"30");
        ctx.beginPath();
        ctx.moveTo(from.x,from.y);
        ctx.lineTo(to.x,to.y);
        ctx.strokeStyle=grad;
        ctx.lineWidth=1.2;
        ctx.stroke();
      });

      cParts.forEach(p=>{
        p.p+=p.spd;
        if(p.p>1) p.p=0;
        const x=lerp(CX,p.tx,p.p);
        const y=lerp(CY,p.ty,p.p);
        const tp=Math.max(0,p.p-p.trail);
        const tx2=lerp(CX,p.tx,tp);
        const ty2=lerp(CY,p.ty,tp);

        const tg=ctx.createLinearGradient(tx2,ty2,x,y);
        tg.addColorStop(0,"rgba(255,255,255,0)");
        tg.addColorStop(0.5,"rgba(255,255,255,0.3)");
        tg.addColorStop(1,"rgba(255,255,255,0.9)");
        ctx.beginPath();
        ctx.moveTo(tx2,ty2);
        ctx.lineTo(x,y);
        ctx.strokeStyle=tg;
        ctx.lineWidth=2;
        ctx.stroke();

        ctx.shadowColor="#fff";
        ctx.shadowBlur=16;
        ctx.beginPath();
        ctx.arc(x,y,3,0,Math.PI*2);
        ctx.fillStyle="#fff";
        ctx.fill();
        ctx.shadowBlur=0;
      });

      iParts.forEach(p=>{
        p.p+=p.spd;
        if(p.p>1) p.p=0;
        const x=lerp(p.fx,p.tx,p.p);
        const y=lerp(p.fy,p.ty,p.p);

        ctx.shadowColor=p.col;
        ctx.shadowBlur=20;
        ctx.beginPath();
        ctx.arc(x,y,3.5,0,Math.PI*2);
        ctx.fillStyle=p.col;
        ctx.fill();
        ctx.shadowBlur=0;

        const tp=Math.max(0,p.p-0.06);
        const tx2=lerp(p.fx,p.tx,tp);
        const ty2=lerp(p.fy,p.ty,tp);
        const tg=ctx.createLinearGradient(tx2,ty2,x,y);
        tg.addColorStop(0,p.col+"00");
        tg.addColorStop(1,p.col+"80");
        ctx.beginPath();
        ctx.moveTo(tx2,ty2);
        ctx.lineTo(x,y);
        ctx.strokeStyle=tg;
        ctx.lineWidth=2;
        ctx.stroke();
      });

      const pulse=0.5+0.5*Math.sin(f*0.03);
      [120,90,60].forEach((r,i)=>{
        const a=[0.04,0.07,0.12][i]*(0.7+0.3*pulse);
        const g=ctx.createRadialGradient(CX,CY,0,CX,CY,r);
        g.addColorStop(0,`rgba(255,255,255,${a*2})`);
        g.addColorStop(0.5,`rgba(200,220,255,${a})`);
        g.addColorStop(1,"rgba(255,255,255,0)");
        ctx.beginPath();
        ctx.arc(CX,CY,r,0,Math.PI*2);
        ctx.fillStyle=g;
        ctx.fill();
      });

      [1,2,3].forEach(i=>{
        const rr=60+(f%(80*i))/1.2;
        if(rr>220) return;
        const aa=Math.max(0,0.25-rr/600);
        ctx.beginPath();
        ctx.arc(CX,CY,rr,0,Math.PI*2);
        ctx.strokeStyle=`rgba(255,255,255,${aa})`;
        ctx.lineWidth=1;
        ctx.stroke();
      });

      nodes.forEach((node,idx)=>{
        const nx=node.x, ny=node.y;
        const angle=Math.atan2(ny-CY,nx-CX);
        const ex=nx+Math.cos(angle+Math.PI/2)*30;
        const ey=ny+Math.sin(angle+Math.PI/2)*30;
        ctx.save();
        ctx.translate(ex-25,ey-6);
        ctx.beginPath();
        const off=(f*2+ekgOffset[idx])%100;
        const pts2=[[0,6],[8,6],[10,0],[12,12],[14,6],[22,6],[24,2],[26,10],[28,6],[50,6]];
        pts2.forEach(([px,py],i)=>{
          const sx=(px-off+100)%100*0.5;
          if(i===0) ctx.moveTo(sx,py);
          else ctx.lineTo(sx,py);
        });
        ctx.strokeStyle=node.color+"99";
        ctx.lineWidth=1;
        ctx.stroke();
        ctx.restore();
      });

      frameRef.current++;
      af=requestAnimationFrame(draw);
    };
    af=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(af);
  },[nodes]);

  return(
    <div style={{
      background:"#020610",
      minHeight:"100vh",
      display:"flex",
      flexDirection:"column",
      alignItems:"center",
      fontFamily:"'Courier New',monospace",
      color:"#fff",
      position:"relative",
      overflow:"hidden",
    }}>
      <div style={{
        position:"fixed",top:0,left:0,right:0,bottom:0,
        background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)",
        pointerEvents:"none",zIndex:100,
      }}/>
      <div style={{
        position:"fixed",top:0,left:0,right:0,bottom:0,
        background:"radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,0.7) 100%)",
        pointerEvents:"none",zIndex:99,
      }}/>

      <div style={{
        width:"100%",maxWidth:900,
        display:"flex",justifyContent:"space-between",alignItems:"center",
        padding:"12px 24px",
        borderBottom:"1px solid rgba(0,229,255,0.15)",
        background:"rgba(2,6,16,0.9)",
        backdropFilter:"blur(8px)",
        position:"relative",zIndex:10,
      }}>
        <div>
          <div style={{fontSize:8,letterSpacing:"0.45em",color:"#00e5ff",marginBottom:3}}>
            ■ RHL DIGITAL // MASTER AGENT NETWORK
          </div>
          <div style={{fontSize:18,fontWeight:"bold",letterSpacing:"0.2em",
            textShadow:"0 0 20px rgba(0,229,255,0.6)"}}>
            THE TOWNSHIP
          </div>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:7,color:"#FFD700",letterSpacing:"0.25em"}}>
            COLOSSIANS 3:23
          </div>
          <div style={{fontSize:9,color:"#FFD700",letterSpacing:"0.12em",marginTop:2}}>
            WHATEVER YOU DO — WORK AT IT WITH ALL YOUR HEART
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:18,fontWeight:"bold",color:"#ff2cf7",
            textShadow:"0 0 15px rgba(255,44,247,0.8)",letterSpacing:"0.1em"}}>
            {time}
          </div>
          <div style={{fontSize:7,color:"rgba(255,255,255,0.25)",letterSpacing:"0.2em",marginTop:2}}>
            {SQUADS.length+1} SQUADS ONLINE
          </div>
        </div>
      </div>

      <div style={{position:"relative",width:W,height:H,flexShrink:0}}>
        <canvas ref={bgRef} width={W} height={H}
          style={{position:"absolute",top:0,left:0,opacity:0.6}}/>
        <canvas ref={mainRef} width={W} height={H}
          style={{position:"absolute",top:0,left:0}}/>

        <div
          onClick={()=>setSelected(selected?.id===10?null:CHAPEL)}
          onMouseEnter={()=>setHovered(CHAPEL)}
          onMouseLeave={()=>setHovered(null)}
          style={{
            position:"absolute",
            left:CX-70,top:CY-70,
            width:140,height:140,
            borderRadius:"50%",
            background:selected?.id===10
              ?"radial-gradient(circle,rgba(255,255,255,0.18) 0%,rgba(255,255,255,0.04) 60%)"
              :"radial-gradient(circle,rgba(255,255,255,0.1) 0%,rgba(255,255,255,0.02) 60%)",
            border:selected?.id===10
              ?"2px solid rgba(255,255,255,1)"
              :"1.5px solid rgba(255,255,255,0.7)",
            display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",
            cursor:"pointer",
            boxShadow:selected?.id===10
              ?"0 0 60px rgba(255,255,255,0.5),0 0 120px rgba(255,255,255,0.15),inset 0 0 40px rgba(255,255,255,0.05)"
              :"0 0 40px rgba(255,255,255,0.25),0 0 80px rgba(255,255,255,0.08),inset 0 0 20px rgba(255,255,255,0.03)",
            zIndex:20,
            transition:"all 0.3s",
          }}
        >
          <svg width="44" height="44" viewBox="0 0 44 44">
            <defs>
              <filter id="cglow">
                <feGaussianBlur stdDeviation="2" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <rect x="19" y="4" width="6" height="36" fill="white" rx="1.5" filter="url(#cglow)"/>
            <rect x="6" y="14" width="32" height="6" fill="white" rx="1.5" filter="url(#cglow)"/>
          </svg>
          <div style={{fontSize:7,color:"rgba(255,255,255,0.7)",letterSpacing:"0.2em",marginTop:6}}>THE CHAPEL</div>
          <div style={{fontSize:6,color:"rgba(255,255,255,0.3)",letterSpacing:"0.12em",marginTop:2}}>SQUAD 10</div>
        </div>

        {nodes.map(node=>{
          const isHov=hovered?.id===node.id;
          const isSel=selected?.id===node.id;
          const sz=isSel?58:isHov?56:50;
          const angle=Math.atan2(node.y-CY,node.x-CX);
          const skewX=Math.cos(angle)*4;
          const scaleY=0.82+0.18*Math.abs(Math.sin(angle));

          return(
            <div key={node.id}
              onClick={()=>setSelected(isSel?null:node)}
              onMouseEnter={()=>setHovered(node)}
              onMouseLeave={()=>setHovered(null)}
              style={{
                position:"absolute",
                left:node.x-sz,top:node.y-sz,
                width:sz*2,height:sz*2,
                borderRadius:"50%",
                background:isSel
                  ?`radial-gradient(circle,${node.color}30 0%,${node.color}10 50%,transparent 70%)`
                  :`radial-gradient(circle,${node.color}18 0%,${node.color}05 60%,transparent 80%)`,
                border:`${isSel?2:1.5}px solid ${node.color}${isSel?"dd":"55"}`,
                display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",
                cursor:"pointer",
                boxShadow:isSel
                  ?`0 0 50px ${node.color}80,0 0 100px ${node.color}30,inset 0 0 30px ${node.color}10`
                  :isHov
                  ?`0 0 30px ${node.color}60,0 0 60px ${node.color}20`
                  :`0 0 15px ${node.color}30`,
                zIndex:15,
                transform:`skewX(${skewX*0.3}deg) scaleY(${scaleY})`,
                transition:"all 0.25s",
                backdropFilter:isSel?"blur(4px)":"none",
              }}
            >
              {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([dx,dy],ci)=>(
                <div key={ci} style={{
                  position:"absolute",
                  ...dx>0?{right:"4px"}:{left:"4px"},
                  ...dy>0?{bottom:"4px"}:{top:"4px"},
                  width:6,height:6,
                  borderTop:dy<0?`1px solid ${node.color}80`:"none",
                  borderBottom:dy>0?`1px solid ${node.color}80`:"none",
                  borderLeft:dx<0?`1px solid ${node.color}80`:"none",
                  borderRight:dx>0?`1px solid ${node.color}80`:"none",
                }}/>
              ))}
              <span style={{fontSize:sz>50?20:17,lineHeight:1}}>{node.emoji}</span>
              <span style={{
                fontSize:sz>50?8:7,color:node.color,
                textAlign:"center",lineHeight:1.3,
                padding:"0 4px",whiteSpace:"pre-wrap",
                letterSpacing:"0.05em",marginTop:3,
                fontWeight:"bold",
                textShadow:`0 0 8px ${node.color}`,
              }}>{node.name}</span>
              <span style={{fontSize:6,color:"rgba(255,255,255,0.25)",marginTop:2,letterSpacing:"0.1em"}}>
                {node.squad}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{width:"100%",maxWidth:900,minHeight:80,padding:"0 24px 16px",position:"relative",zIndex:10}}>
        {selected?(
          <div style={{
            padding:"16px 20px",
            border:`1px solid ${selected.color||"#fff"}25`,
            borderLeft:`3px solid ${selected.color||"#fff"}`,
            borderBottom:`3px solid ${selected.color||"#fff"}20`,
            background:"rgba(2,6,16,0.85)",
            backdropFilter:"blur(8px)",
            display:"flex",gap:20,alignItems:"center",
            boxShadow:`0 0 30px ${selected.color||"#fff"}15,inset 0 0 20px rgba(0,0,0,0.5)`,
            position:"relative",
          }}>
            {["topLeft","topRight","bottomLeft","bottomRight"].map(pos=>(
              <div key={pos} style={{
                position:"absolute",
                ...pos.includes("top")?{top:-1}:{bottom:-1},
                ...pos.includes("Left")?{left:-1}:{right:-1},
                width:12,height:12,
                borderTop:pos.includes("top")?`2px solid ${selected.color||"#fff"}`:"none",
                borderBottom:pos.includes("bottom")?`2px solid ${selected.color||"#fff"}`:"none",
                borderLeft:pos.includes("Left")?`2px solid ${selected.color||"#fff"}`:"none",
                borderRight:pos.includes("Right")?`2px solid ${selected.color||"#fff"}`:"none",
              }}/>
            ))}
            <span style={{fontSize:32}}>{selected.emoji}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:8,letterSpacing:"0.25em",marginBottom:4,
                color:selected.color||"#fff",textShadow:`0 0 10px ${selected.color||"#fff"}`}}>
                {selected.squad?.toUpperCase()} // {(selected.full||selected.name||"").replace("\n"," ").toUpperCase()}
              </div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.65)",lineHeight:1.6}}>
                {selected.desc}
              </div>
            </div>
            <div style={{fontSize:8,letterSpacing:"0.15em",color:(selected.color||"#fff")+"99",
              writingMode:"vertical-lr",opacity:0.5}}>
              OPERATIONAL
            </div>
          </div>
        ):(
          <div style={{textAlign:"center",color:"rgba(255,255,255,0.12)",
            fontSize:8,letterSpacing:"0.3em",paddingTop:28}}>
            ▷ SELECT A NODE TO VIEW SQUAD DETAILS
          </div>
        )}
      </div>

      <div style={{
        width:"100%",maxWidth:900,
        borderTop:"1px solid rgba(0,229,255,0.1)",
        padding:"10px 24px",
        display:"flex",justifyContent:"space-between",alignItems:"center",
        background:"rgba(2,6,16,0.9)",
        backdropFilter:"blur(8px)",
        position:"relative",zIndex:10,
        flexWrap:"wrap",gap:8,
      }}>
        {[
          ["■","RAILWAY","#00e5ff"],
          ["■","n8n ACTIVE","#4ade80"],
          ["■","AnythingLLM","#e879f9"],
          ["■","GitHub: NJamesNC","#ffd700"],
          ["■","VAPI LIVE","#ff2cf7"],
        ].map(([dot,label,col])=>(
          <span key={label} style={{fontSize:7,letterSpacing:"0.15em",color:col,textShadow:`0 0 6px ${col}`}}>
            {dot} {label}
          </span>
        ))}
      </div>
    </div>
  );
}
