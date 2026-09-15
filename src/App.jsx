import { useEffect, useState } from "react";
import "./App.css";

const desktopItems = [
  ["computer", "My Portfolio"], ["user", "About Me"], ["folder", "Projects"],
  ["gear", "Skills"], ["briefcase", "Experience"], ["mail", "Contact"], ["trash", "Recycle Bin"],
];

const Icon = ({ type }) => {
  const icons = { computer:"▣", user:"♟", folder:"▰", gear:"⚙", briefcase:"▤", mail:"✉", trash:"♜" };
  return <div className={`pixel-icon ${type}`}>{icons[type]}</div>;
};

function RetroWindow({ title, className="", children }) {
  return <section className={`window ${className}`}>
    <header className="titlebar"><span>▣ {title}</span><div><button>_</button><button>□</button><button>×</button></div></header>
    <nav className="menubar"><u>F</u>ile　 <u>E</u>dit　 <u>V</u>iew　 <u>H</u>elp</nav>
    <div className="window-body">{children}</div>
  </section>;
}

function App() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id=setInterval(()=>setNow(new Date()),1000); return()=>clearInterval(id); },[]);

  return <main className="desktop">
    <div className="noise" />
    <aside className="desktop-icons">
      {desktopItems.map(([type,label]) => <div className="desktop-item" key={label}><Icon type={type}/><span>{label}</span></div>)}
    </aside>

    <RetroWindow title="Welcome.exe" className="welcome">
      <div className="hero">
        <div className="portrait" aria-label="profile placeholder"><div className="head">●</div><div className="body">▲</div></div>
        <div className="hero-copy"><p>Hello, I'm</p><h1>MARK REAL<span className="cursor">_</span></h1><h2>Computer Science Student<br/>Developer<br/>Problem Solver</h2><p className="tagline">I build things, break things, and learn how they work.</p><button className="enter">&gt; ENTER PORTFOLIO</button></div>
      </div>
    </RetroWindow>

    <section className="player window"><header className="titlebar"><span>♫ Now Playing</span><button>×</button></header><div className="player-body"><div className="album">♫</div><div><strong>LOFI BEATS</strong><br/><small>coding_playlist.mp3</small><div className="track"><i/></div><div className="controls">◀　▶　■　▶▶</div></div></div></section>

    <section className="note"><header>Note.txt <span>×</span></header><div><b>REMEMBER:</b><br/><br/>Keep learning.<br/>Keep building.<br/>Keep going.<br/><br/>You got this! ☺</div></section>

    <RetroWindow title="About_Me.exe" className="about">
      <div className="terminal"><p>C:\Portfolio&gt; whoami</p><p>Mark Real</p><p>C:\Portfolio&gt; about --me</p><p>I'm a Computer Science student passionate about building useful and creative software.</p><p>I enjoy turning ideas into real projects, learning new technologies, and solving problems one bug at a time.</p><p className="prompt">C:\Portfolio&gt; <span className="cursor">_</span></p></div>
    </RetroWindow>

    <RetroWindow title="System_Info.exe" className="sysinfo">
      <div className="sysgrid"><div><b>STATUS:</b><br/>● ONLINE</div><div><b>LOCATION:</b><br/>Dumaguete, PH</div><div><b>ROLE:</b><br/>CS Student</div><div><b>FOCUS:</b><br/>Web Development</div></div>
    </RetroWindow>

    <div className="wall-copy">SMALL STEPS,<br/>BIGGER THINGS.<span>_</span></div>

    <footer className="taskbar"><button className="start">▦ Start</button><button className="task active">▣ Welcome.exe</button><button className="task">▣ About_Me.exe</button><div className="tray">▥　♬　▰　 <b>{now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</b><small>{now.toLocaleDateString()}</small></div></footer>
  </main>;
}
export default App;
