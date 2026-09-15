import { useEffect, useRef, useState } from "react";
import "./App.css";

const definitions={
 welcome:{title:"Welcome.exe",pos:{x:220,y:70}},about:{title:"About_Me.exe",pos:{x:180,y:430}},projects:{title:"Projects.exe",pos:{x:330,y:170}},skills:{title:"Skills.exe",pos:{x:430,y:220}},experience:{title:"Experience.exe",pos:{x:360,y:280}},contact:{title:"Contact.exe",pos:{x:500,y:180}},system:{title:"System_Info.exe",pos:{x:760,y:470}}
};
const desktopItems=[["computer","My Portfolio","welcome"],["user","About Me","about"],["folder","Projects","projects"],["gear","Skills","skills"],["briefcase","Experience","experience"],["mail","Contact","contact"],["trash","Recycle Bin",null]];
const symbols={computer:"▣",user:"♟",folder:"▰",gear:"⚙",briefcase:"▤",mail:"✉",trash:"♜"};

function RetroWindow({id,title,state,onFocus,onClose,onMinimize,onMaximize,onMove,children}){
 const drag=useRef(null);
 const down=e=>{if(state.maximized)return;onFocus(id);drag.current={mx:e.clientX,my:e.clientY,x:state.x,y:state.y};document.body.classList.add("dragging")};
 useEffect(()=>{const move=e=>{if(!drag.current)return;onMove(id,Math.max(0,drag.current.x+e.clientX-drag.current.mx),Math.max(0,drag.current.y+e.clientY-drag.current.my))};const up=()=>{drag.current=null;document.body.classList.remove("dragging")};window.addEventListener("mousemove",move);window.addEventListener("mouseup",up);return()=>{window.removeEventListener("mousemove",move);window.removeEventListener("mouseup",up)}},[]);
 if(!state.open||state.minimized)return null;
 return <section className={`window app-window ${state.maximized?"maximized":""}`} style={{left:state.x,top:state.y,zIndex:state.z}} onMouseDown={()=>onFocus(id)}>
  <header className="titlebar draggable" onMouseDown={down} onDoubleClick={()=>onMaximize(id)}><span>▣ {title}</span><div><button onMouseDown={e=>e.stopPropagation()} onClick={()=>onMinimize(id)}>_</button><button onMouseDown={e=>e.stopPropagation()} onClick={()=>onMaximize(id)}>□</button><button onMouseDown={e=>e.stopPropagation()} onClick={()=>onClose(id)}>×</button></div></header>
  <nav className="menubar"><u>F</u>ile　 <u>E</u>dit　 <u>V</u>iew　 <u>H</u>elp</nav><div className="window-body">{children}</div>
 </section>
}

function App(){
 const initial=Object.fromEntries(Object.entries(definitions).map(([id,d],i)=>[id,{open:["welcome","about","system"].includes(id),minimized:false,maximized:false,x:d.pos.x,y:d.pos.y,z:i+2}]));
 const [windows,setWindows]=useState(initial),[now,setNow]=useState(new Date()),[start,setStart]=useState(false),[boot,setBoot]=useState(true),z=useRef(20);
 useEffect(()=>{const clock=setInterval(()=>setNow(new Date()),1000),timer=setTimeout(()=>setBoot(false),1800);return()=>{clearInterval(clock);clearTimeout(timer)}},[]);
 const patch=(id,p)=>setWindows(w=>({...w,[id]:{...w[id],...p}}));
 const focus=id=>patch(id,{z:++z.current});
 const open=id=>{if(!id)return;patch(id,{open:true,minimized:false,z:++z.current});setStart(false)};
 const close=id=>patch(id,{open:false,minimized:false});
 const minimize=id=>patch(id,{minimized:true});
 const maximize=id=>patch(id,{maximized:!windows[id].maximized,z:++z.current});
 const move=(id,x,y)=>patch(id,{x,y});
 const content={
  welcome:<div className="hero"><div className="portrait"><div className="head">●</div><div className="body">▲</div></div><div className="hero-copy"><p>Hello, I'm</p><h1>MARK REAL<span className="cursor">_</span></h1><h2>Computer Science Student<br/>Developer<br/>Problem Solver</h2><p className="tagline">I build things, break things, and learn how they work.</p><button className="enter" onClick={()=>open("projects")}>&gt; ENTER PORTFOLIO</button></div></div>,
  about:<div className="terminal"><p>C:\Portfolio&gt; whoami</p><p>Mark Real</p><p>C:\Portfolio&gt; about --me</p><p>I'm a Computer Science student passionate about building useful and creative software.</p><p>I enjoy turning ideas into real projects, learning new technologies, and solving problems one bug at a time.</p><p className="prompt">C:\Portfolio&gt; <span className="cursor">_</span></p></div>,
  projects:<div className="folder-view"><h3>PROJECT DIRECTORY</h3><div className="file-card">▰ <b>Church Management System</b><small>React • Supabase • Vercel</small></div><div className="file-card">▰ <b>More projects loading...</b><small>This portfolio is one of them :)</small></div></div>,
  skills:<div className="terminal"><p>C:\Skills&gt; dir</p><p>HTML　CSS　JavaScript　React</p><p>TailwindCSS　Supabase　Git/GitHub</p><p>PHP　Laravel　MySQL</p><p>Problem Solving　UI Development</p><p>C:\Skills&gt; <span className="cursor">_</span></p></div>,
  experience:<div className="folder-view"><h3>EXPERIENCE.LOG</h3><p><b>Computer Science Student</b></p><p>Building academic and personal software projects while continuously learning modern web development.</p><hr/><p><b>On-the-Job Training</b></p><p>Professional workplace experience and hands-on technical learning.</p></div>,
  contact:<div className="terminal"><p>C:\Portfolio&gt; contact --open</p><p>GitHub: BreadKramz</p><p>Email: add_your_email_here</p><p>Location: Dumaguete City, Philippines</p><br/><p>Let's build something interesting.</p><p>C:\Portfolio&gt; <span className="cursor">_</span></p></div>,
  system:<div className="sysgrid"><div><b>STATUS:</b><br/>● ONLINE</div><div><b>LOCATION:</b><br/>Dumaguete, PH</div><div><b>ROLE:</b><br/>CS Student</div><div><b>FOCUS:</b><br/>Web Development</div></div>
 };
 return <main className="desktop" onMouseDown={()=>start&&setStart(false)}>
  {boot&&<div className="boot"><div><b>MARKREAL BIOS v1.0</b><p>Initializing PortfolioOS...</p><p>Loading creativity ........ OK</p><p>Loading projects .......... OK</p><p>Starting desktop_</p></div></div>}
  <div className="noise"/><aside className="desktop-icons">{desktopItems.map(([type,label,id])=><button className="desktop-item" key={label} onDoubleClick={()=>open(id)} onClick={()=>id&&focus(id)}><div className={`pixel-icon ${type}`}>{symbols[type]}</div><span>{label}</span></button>)}</aside>
  {Object.entries(definitions).map(([id,d])=><RetroWindow key={id} id={id} title={d.title} state={windows[id]} onFocus={focus} onClose={close} onMinimize={minimize} onMaximize={maximize} onMove={move}>{content[id]}</RetroWindow>)}
  <section className="player window"><header className="titlebar"><span>♫ Now Playing</span><button>×</button></header><div className="player-body"><div className="album">♫</div><div><strong>LOFI BEATS</strong><br/><small>coding_playlist.mp3</small><div className="track"><i/></div><div className="controls">◀　▶　■　▶▶</div></div></div></section>
  <section className="note"><header>Note.txt <span>×</span></header><div><b>REMEMBER:</b><br/><br/>Keep learning.<br/>Keep building.<br/>Keep going.<br/><br/>You got this! ☺</div></section>
  <div className="wall-copy">SMALL STEPS,<br/>BIGGER THINGS.<span>_</span></div>
  {start&&<div className="start-menu" onMouseDown={e=>e.stopPropagation()}><div className="start-side">PORTFOLIO<span>OS</span></div><div className="start-links">{desktopItems.slice(0,6).map(([type,label,id])=><button key={id} onClick={()=>open(id)}><span>{symbols[type]}</span>{label}</button>)}<hr/><button onClick={()=>setBoot(true)}>▣ Restart...</button></div></div>}
  <footer className="taskbar" onMouseDown={e=>e.stopPropagation()}><button className={`start ${start?"active":""}`} onClick={()=>setStart(s=>!s)}>▦ Start</button>{Object.entries(windows).filter(([,w])=>w.open).map(([id,w])=><button key={id} className={`task ${!w.minimized?"active":""}`} onClick={()=>w.minimized?open(id):minimize(id)}>▣ {definitions[id].title}</button>)}<div className="tray">▥　♬　▰　 <b>{now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</b><small>{now.toLocaleDateString()}</small></div></footer>
 </main>
}
export default App;
