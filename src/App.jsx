import { useEffect, useRef, useState } from "react";
import "./App.css";

const definitions = {
  welcome: { title: "Welcome.exe", pos: { x: 205, y: 65 } },
  about: { title: "About_Me.exe", pos: { x: 175, y: 425 } },
  projects: { title: "Projects.exe", pos: { x: 330, y: 170 } },
  skills: { title: "Skills.exe", pos: { x: 430, y: 220 } },
  experience: { title: "Experience.exe", pos: { x: 360, y: 280 } },
  contact: { title: "Contact.exe", pos: { x: 500, y: 180 } },
  system: { title: "System_Info.exe", pos: { x: 750, y: 470 } },
};

const desktopItems = [
  ["computer", "My Portfolio", "welcome"],
  ["user", "About Me", "about"],
  ["folder", "Projects", "projects"],
  ["gear", "Skills", "skills"],
  ["briefcase", "Experience", "experience"],
  ["mail", "Contact", "contact"],
  ["trash", "Recycle Bin", null],
];

const symbols = {
  computer: "▣",
  user: "♟",
  folder: "▰",
  gear: "⚙",
  briefcase: "▤",
  mail: "✉",
  trash: "♜",
};

function RetroWindow({
  id,
  title,
  state,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onMove,
  children,
}) {
  const drag = useRef(null);

  const handleMouseDown = (event) => {
    if (state.maximized) return;

    onFocus(id);
    drag.current = {
      mouseX: event.clientX,
      mouseY: event.clientY,
      windowX: state.x,
      windowY: state.y,
    };

    document.body.classList.add("dragging");
  };

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!drag.current) return;

      const nextX = Math.max(
        0,
        drag.current.windowX + event.clientX - drag.current.mouseX,
      );
      const nextY = Math.max(
        0,
        drag.current.windowY + event.clientY - drag.current.mouseY,
      );

      onMove(id, nextX, nextY);
    };

    const handleMouseUp = () => {
      drag.current = null;
      document.body.classList.remove("dragging");
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [id, onMove]);

  if (!state.open || state.minimized) return null;

  return (
    <section
      className={`window app-window ${state.maximized ? "maximized" : ""}`}
      style={{ left: state.x, top: state.y, zIndex: state.z }}
      onMouseDown={() => onFocus(id)}
    >
      <header
        className="titlebar draggable"
        onMouseDown={handleMouseDown}
        onDoubleClick={() => onMaximize(id)}
      >
        <span>▣ {title}</span>

        <div>
          <button
            onMouseDown={(event) => event.stopPropagation()}
            onClick={() => onMinimize(id)}
          >
            _
          </button>
          <button
            onMouseDown={(event) => event.stopPropagation()}
            onClick={() => onMaximize(id)}
          >
            □
          </button>
          <button
            onMouseDown={(event) => event.stopPropagation()}
            onClick={() => onClose(id)}
          >
            ×
          </button>
        </div>
      </header>

      <nav className="menubar">
        <u>F</u>ile　 <u>E</u>dit　 <u>V</u>iew　 <u>H</u>elp
      </nav>

      <div className="window-body">{children}</div>
    </section>
  );
}

function App() {
  const initialWindows = Object.fromEntries(
    Object.entries(definitions).map(([id, definition], index) => [
      id,
      {
        open: ["welcome", "about", "system"].includes(id),
        minimized: false,
        maximized: false,
        x: definition.pos.x,
        y: definition.pos.y,
        z: index + 2,
      },
    ]),
  );

  const [windows, setWindows] = useState(initialWindows);
  const [now, setNow] = useState(new Date());
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [booting, setBooting] = useState(true);
  const zIndex = useRef(20);

  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 1000);
    const bootTimer = setTimeout(() => setBooting(false), 1800);

    return () => {
      clearInterval(clock);
      clearTimeout(bootTimer);
    };
  }, []);

  const patchWindow = (id, changes) => {
    setWindows((current) => ({
      ...current,
      [id]: {
        ...current[id],
        ...changes,
      },
    }));
  };

  const focusWindow = (id) => {
    patchWindow(id, { z: ++zIndex.current });
  };

  const openWindow = (id) => {
    if (!id) return;

    patchWindow(id, {
      open: true,
      minimized: false,
      z: ++zIndex.current,
    });

    setStartMenuOpen(false);
  };

  const closeWindow = (id) => {
    patchWindow(id, { open: false, minimized: false });
  };

  const minimizeWindow = (id) => {
    patchWindow(id, { minimized: true });
  };

  const maximizeWindow = (id) => {
    patchWindow(id, {
      maximized: !windows[id].maximized,
      z: ++zIndex.current,
    });
  };

  const moveWindow = (id, x, y) => {
    patchWindow(id, { x, y });
  };

  const windowContent = {
    welcome: (
      <div className="hero">
        <div className="portrait">
          <div className="pixel-face">
            <i />
            <i />
            <b />
            <span />
          </div>
          <div className="portrait-caption">MR // 04</div>
        </div>

        <div className="hero-copy">
          <p className="hello">&gt; Hello, I'm</p>
          <h1>
            MARK REAL<span className="cursor">_</span>
          </h1>
          <h2>
            Computer Science Student
            <br />
            Developer
            <br />
            Problem Solver
          </h2>
          <p className="tagline">“Still a work in progress...”</p>
          <button className="enter" onClick={() => openWindow("projects")}>
            &gt; ENTER PORTFOLIO
          </button>
        </div>
      </div>
    ),

    about: (
      <div className="terminal">
        <p>C:\Portfolio&gt; whoami</p>
        <p>Mark Real</p>
        <p>C:\Portfolio&gt; about --me</p>
        <p>
          A Computer Science student who likes building web applications,
          exploring new technologies, and turning ideas into reality.
        </p>
        <p>
          I learn by making things — one project, one bug, and one small step at
          a time.
        </p>
        <p>
          C:\Portfolio&gt; <span className="cursor">_</span>
        </p>
      </div>
    ),

    projects: (
      <div className="folder-view">
        <h3>PROJECT DIRECTORY</h3>

        <div className="file-card">
          ▰ <b>Church Management System</b>
          <small>React • Supabase • Vercel</small>
        </div>

        <div className="file-card">
          ▰ <b>PortfolioOS</b>
          <small>React • CSS • questionable amounts of caffeine</small>
        </div>
      </div>
    ),

    skills: (
      <div className="terminal">
        <p>C:\Skills&gt; dir</p>
        <p>HTML　CSS　JavaScript　React</p>
        <p>TailwindCSS　Supabase　Git/GitHub</p>
        <p>PHP　Laravel　MySQL</p>
        <p>Problem Solving　UI Development</p>
        <p>
          C:\Skills&gt; <span className="cursor">_</span>
        </p>
      </div>
    ),

    experience: (
      <div className="folder-view">
        <h3>EXPERIENCE.LOG</h3>
        <p>
          <b>Computer Science Student</b>
        </p>
        <p>
          Building academic and personal software projects while learning
          modern development workflows.
        </p>
        <hr />
        <p>
          <b>On-the-Job Training</b>
        </p>
        <p>Hands-on professional workplace and technical experience.</p>
      </div>
    ),

    contact: (
      <div className="terminal">
        <p>C:\Portfolio&gt; contact --open</p>
        <p>GitHub: BreadKramz</p>
        <p>Email: add_your_email_here</p>
        <p>Location: Dumaguete City, Philippines</p>
        <br />
        <p>Let's build something interesting.</p>
        <p>
          C:\Portfolio&gt; <span className="cursor">_</span>
        </p>
      </div>
    ),

    system: (
      <div className="sysgrid">
        <div>
          <b>USER</b>
          <br />
          Mark Real
        </div>
        <div>
          <b>OS</b>
          <br />
          PortfolioOS v1.0
        </div>
        <div>
          <b>LOCATION</b>
          <br />
          Dumaguete, PH
        </div>
        <div>
          <b>STATUS</b>
          <br />● Building...
        </div>
      </div>
    ),
  };

  return (
    <main
      className="desktop"
      onMouseDown={() => startMenuOpen && setStartMenuOpen(false)}
    >
      {booting && (
        <div className="boot">
          <div>
            <b>MARKREAL BIOS v1.0</b>
            <p>Memory test ............... 16384 MB OK</p>
            <p>Loading creativity ........ OK</p>
            <p>Mounting /projects ........ OK</p>
            <p>
              Starting PortfolioOS<span className="cursor">_</span>
            </p>
          </div>
        </div>
      )}

      <div className="moon" />
      <div className="city city-back" />
      <div className="city city-front" />
      <div className="stars">·　.　　·　　　.　·　　　.</div>
      <div className="noise" />

      <aside className="desktop-icons">
        {desktopItems.map(([type, label, id]) => (
          <button
            className="desktop-item"
            key={label}
            onDoubleClick={() => openWindow(id)}
          >
            <div className={`pixel-icon ${type}`}>{symbols[type]}</div>
            <span>{label}</span>
          </button>
        ))}
      </aside>

      {Object.entries(definitions).map(([id, definition]) => (
        <RetroWindow
          key={id}
          id={id}
          title={definition.title}
          state={windows[id]}
          onFocus={focusWindow}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onMaximize={maximizeWindow}
          onMove={moveWindow}
        >
          {windowContent[id]}
        </RetroWindow>
      ))}

      <section className="player window">
        <header className="titlebar">
          <span>♫ Now Playing</span>
          <button>×</button>
        </header>

        <div className="player-body">
          <div className="album">
            <span>
              LO
              <br />
              FI
            </span>
          </div>

          <div>
            <strong>chill.exe</strong>
            <br />
            <small>late_night_coding.mp3</small>
            <div className="track">
              <i />
            </div>
            <div className="timecode">2:17 / 3:45</div>
            <div className="controls">|◀　▶　▶|</div>
          </div>
        </div>
      </section>

      <section className="note">
        <header>
          Note.txt <span>×</span>
        </header>
        <div>
          <b>GOOD IDEAS</b>
          <br />
          start with a
          <br />
          <u>curious mind.</u>
          <br />
          <br />
          <small>— Mark</small>
        </div>
      </section>

      <div className="wall-copy">
        SMALL STEPS
        <br />
        BIGGER THINGS<span className="cursor">_</span>
      </div>

      {startMenuOpen && (
        <div
          className="start-menu"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="start-side">
            PORTFOLIO<span>OS</span>
          </div>

          <div className="start-links">
            {desktopItems.slice(0, 6).map(([type, label, id]) => (
              <button key={id} onClick={() => openWindow(id)}>
                <span>{symbols[type]}</span>
                {label}
              </button>
            ))}

            <hr />

            <button onClick={() => setBooting(true)}>▣ Restart...</button>
          </div>
        </div>
      )}

      <footer
        className="taskbar"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className={`start ${startMenuOpen ? "active" : ""}`}
          onClick={() => setStartMenuOpen((current) => !current)}
        >
          ▦ Start
        </button>

        {Object.entries(windows)
          .filter(([, windowState]) => windowState.open)
          .map(([id, windowState]) => (
            <button
              key={id}
              className={`task ${!windowState.minimized ? "active" : ""}`}
              onClick={() =>
                windowState.minimized
                  ? openWindow(id)
                  : minimizeWindow(id)
              }
            >
              ▣ {definitions[id].title}
            </button>
          ))}

        <div className="task-motto">CODE　CREATE　IMPROVE</div>

        <div className="tray">
          ▥ ♬ ▰
          <b>
            {now.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </b>
          <small>{now.toLocaleDateString()}</small>
        </div>
      </footer>
    </main>
  );
}

export default App;
