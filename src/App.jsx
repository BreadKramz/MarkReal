import { useEffect, useRef, useState } from "react";
import "./App.css";

const definitions = {
  welcome: { title: "Welcome.exe", pos: { x: 185, y: 78 } },
  about: { title: "About_Me.exe", pos: { x: 225, y: 445 } },
  projects: { title: "Projects.exe", pos: { x: 320, y: 150 } },
  cms: { title: "Church_Management_System.exe", pos: { x: 210, y: 95 } },
  skills: { title: "Skills.exe", pos: { x: 400, y: 190 } },
  experience: { title: "Experience.exe", pos: { x: 355, y: 245 } },
  contact: { title: "Contact.exe", pos: { x: 475, y: 170 } },
  system: { title: "System_Info.exe", pos: { x: 785, y: 465 } },
  cmd: { title: "Command_Prompt.exe", pos: { x: 480, y: 280 } },
};

const desktopItems = [
  ["▦", "Portfolio", "welcome", "portfolio"],
  ["●", "About Me", "about", "user"],
  ["▤", "Projects", "projects", "folder"],
  ["✦", "Skills", "skills", "skills"],
  ["▥", "Experience", "experience", "document"],
  ["✉", "Contact", "contact", "mail"],
  [">_", "Command Prompt", "cmd", "terminal"],
  ["♲", "Recycle Bin", null, "trash"],
];

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

      onMove(
        id,
        Math.max(0, drag.current.windowX + event.clientX - drag.current.mouseX),
        Math.max(0, drag.current.windowY + event.clientY - drag.current.mouseY),
      );
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
      className={`window app-window window-${id} ${state.maximized ? "maximized" : ""}`}
      style={{ left: state.x, top: state.y, zIndex: state.z }}
      onMouseDown={() => onFocus(id)}
    >
      <header
        className="titlebar draggable"
        onMouseDown={handleMouseDown}
        onDoubleClick={() => onMaximize(id)}
      >
        <span className="window-title">
          <i className="window-dot" />
          {title}
        </span>

        <div className="window-actions">
          <button
            aria-label={`Minimize ${title}`}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={() => onMinimize(id)}
          >
            _
          </button>
          <button
            aria-label={`Maximize ${title}`}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={() => onMaximize(id)}
          >
            □
          </button>
          <button
            aria-label={`Close ${title}`}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={() => onClose(id)}
          >
            ×
          </button>
        </div>
      </header>

      <nav className="menubar">
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span>Help</span>
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
        open: id === "welcome",
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
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(true);
  const [locked, setLocked] = useState(true);
  const [lockPassword, setLockPassword] = useState("");
  const [lockError, setLockError] = useState(false);
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);
  const zIndex = useRef(20);
  const utilityDrag = useRef(null);
  const [utilityPositions, setUtilityPositions] = useState({
    player: { x: null, y: 165 },
    note: { x: null, y: 355 },
  });
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState([
    "PortfolioOS Command Prompt [Version 2.0]",
    "Type help to see available commands.",
  ]);

  const unlockPortfolio = async (event) => {
    event.preventDefault();
    if (lockPassword === "Code4Life") {
      const audio = audioRef.current;
      if (audio) {
        try {
          await audio.play();
        } catch {
          setIsPlaying(false);
        }
      }
      setLocked(false);
      setShowFullscreenPrompt(false);
      setShowWelcomeToast(true);
      window.setTimeout(() => setShowWelcomeToast(false), 4200);
      setLockError(false);
      setLockPassword("");
      return;
    }
    setLockError(true);
  };

  const runCommand = (event) => {
    event.preventDefault();
    const input = command.trim();
    if (!input) return;

    const cmd = input.toLowerCase();

    if (cmd === "cls") {
      setCommandHistory([]);
      setCommand("");
      return;
    }

    let output = "";
    if (cmd === "help") output = "Commands: help, about, projects, cls";
    else if (cmd === "about") output = "Mark Real - Computer Science student and developer.";
    else if (cmd === "projects") output = "Projects: Church Management System | PortfolioOS";
    else output = input + " is not recognized. Type help.";

    setCommandHistory((history) => history.concat(["C:\\PORTFOLIO> " + input, output]));
    setCommand("");
  };

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setIsPlaying(false);
      }
    } else {
      audio.pause();
    }
  };

  const startUtilityDrag = (event, id) => {
    if (event.button !== 0) return;
    const element = event.currentTarget.closest(id === "player" ? ".player" : ".note");
    if (!element) return;
    const rect = element.getBoundingClientRect();
    utilityDrag.current = {
      id,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
    setUtilityPositions((current) => ({
      ...current,
      [id]: { x: rect.left, y: rect.top },
    }));
    document.body.classList.add("dragging");
    event.preventDefault();
  };

  useEffect(() => {
    const moveUtility = (event) => {
      if (!utilityDrag.current) return;
      const { id, offsetX, offsetY } = utilityDrag.current;
      const width = id === "player" ? 300 : 205;
      const height = id === "player" ? 154 : 205;
      setUtilityPositions((current) => ({
        ...current,
        [id]: {
          x: Math.max(0, Math.min(window.innerWidth - width, event.clientX - offsetX)),
          y: Math.max(0, Math.min(window.innerHeight - 52 - height, event.clientY - offsetY)),
        },
      }));
    };
    const stopUtilityDrag = () => {
      utilityDrag.current = null;
      document.body.classList.remove("dragging");
    };
    window.addEventListener("mousemove", moveUtility);
    window.addEventListener("mouseup", stopUtilityDrag);
    return () => {
      window.removeEventListener("mousemove", moveUtility);
      window.removeEventListener("mouseup", stopUtilityDrag);
    };
  }, []);

  const seekMusic = (event) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
  };

  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 1000);
    const bootTimer = setTimeout(() => {
      setBooting(false);
    }, 1500);

    const startMusic = async () => {
      const audio = audioRef.current;
      if (!audio) return;

      try {
        await audio.play();
      } catch {
        // Browsers may block autoplay with sound until the visitor interacts.
      }
    };

    startMusic();

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

  const closeWindow = (id) => patchWindow(id, { open: false, minimized: false });
  const minimizeWindow = (id) => patchWindow(id, { minimized: true });

  const maximizeWindow = (id) => {
    patchWindow(id, {
      maximized: !windows[id].maximized,
      z: ++zIndex.current,
    });
  };

  const moveWindow = (id, x, y) => patchWindow(id, { x, y });

  const windowContent = {
    welcome: (
      <div className="hero">
        <div className="hero-copy">
          <p className="eyebrow">PORTFOLIO / 2026</p>
          <p className="hello">&gt; Hello, I'm</p>
          <h1>
            MARK
            <br />
            REAL<span className="cursor">_</span>
          </h1>
          <p className="role">Computer Science Student · Developer</p>
          <p className="tagline">
            Building thoughtful software, learning through the process.
          </p>

          <div className="hero-actions">
            <button className="primary-action" onClick={() => openWindow("projects")}>
              View Projects
            </button>
            <button className="secondary-action" onClick={() => openWindow("about")}>
              About Me
            </button>
          </div>
        </div>

        <div className="portrait-panel">
          <div className="portrait-grid" />
          <img
            className="profile-photo"
            src="/profile.jpg"
            alt="Mark Real"
          />
          <span>MR // PROFILE</span>
        </div>
      </div>
    ),

    about: (
      <div className="about-content">
        <div className="terminal-label">C:\\PORTFOLIO\\ABOUT&gt;</div>
        <h3>About me</h3>
        <p>
          I'm a Computer Science student focused on creating practical,
          thoughtful web experiences and learning how software works from the
          inside out.
        </p>
        <p>
          I enjoy turning ideas into working projects, refining the details,
          and improving with every build.
        </p>
        <div className="terminal-prompt">
          ready<span className="cursor">_</span>
        </div>
      </div>
    ),

    projects: (
      <div className="project-list">
        <div className="section-heading">
          <span>01</span>
          <div>
            <small>SELECTED WORK</small>
            <h3>Projects</h3>
          </div>
        </div>

        <article className="project-card project-card-launch" onDoubleClick={() => openWindow("cms")}>
          <div className="project-number">01</div>
          <div>
            <h4>Church Management System</h4>
            <p>Centralized web platform for church records and services.</p>
            <small>REACT / SUPABASE / VERCEL</small>
            <button className="project-launch" type="button" onClick={() => openWindow("cms")}>Launch System.exe</button>
          </div>
        </article>

        <article className="project-card">
          <div className="project-number">02</div>
          <div>
            <h4>PortfolioOS</h4>
            <p>An interactive retro-desktop portfolio built in React.</p>
            <small>REACT / CSS / UI SYSTEMS</small>
          </div>
        </article>
      </div>
    ),

    cms: (
      <div className="cms-browser">
        <div className="cms-browser-bar">
          <span className="cms-browser-status">● LIVE</span>
          <div className="cms-address">https://omp-church.vercel.app/</div>
          <button
            type="button"
            onClick={() =>
              window.open(
                "https://omp-church.vercel.app/",
                "_blank",
                "noopener,noreferrer",
              )
            }
          >
            ↗ Open
          </button>
        </div>
        <div className="cms-frame-wrap">
          <iframe
            className="cms-frame"
            src="https://omp-church.vercel.app/"
            title="Church Management System live preview"
            loading="lazy"
          />
        </div>
        <div className="cms-browser-footer">
          If the embedded preview is blocked, use ↗ Open to launch the live system.
        </div>
      </div>
    ),

    skills: (
      <div className="skills-content">
        <div className="section-heading compact">
          <span>02</span>
          <div>
            <small>TOOLKIT</small>
            <h3>Skills</h3>
          </div>
        </div>
        <div className="skill-grid">
          <span>HTML</span>
          <span>CSS</span>
          <span>JavaScript</span>
          <span>React</span>
          <span>TailwindCSS</span>
          <span>Supabase</span>
          <span>Git / GitHub</span>
          <span>PHP / Laravel</span>
          <span>MySQL</span>
        </div>
      </div>
    ),

    experience: (
      <div className="experience-content">
        <div className="section-heading compact">
          <span>03</span>
          <div>
            <small>JOURNEY</small>
            <h3>Experience</h3>
          </div>
        </div>
        <div className="timeline-item">
          <span>2023–2026</span>
          <div>
            <b>Negros Oriental State University (NORSU)</b>
            <p>4th Year · Bachelor of Science in Computer Science</p>
          </div>
        </div>
        <div className="timeline-item">
          <span>2026</span>
          <div>
            <b>Government Service Insurance System (GSIS)</b>
            <p>On-the-Job Training · Current</p>
          </div>
        </div>
      </div>
    ),

    contact: (
      <div className="contact-content">
        <p className="eyebrow">CONTACT CHANNEL</p>
        <h3>Let's build something.</h3>
        <p>GitHub / BreadKramz</p>
        <p>Email / realmarklesterj@gmail.com</p>
        <p>Phone / 0945 605 7652 · 0962 516 8169</p>
        <p>LinkedIn / Mark Lester Real</p>
        <div className="terminal-prompt">
          awaiting_message<span className="cursor">_</span>
        </div>
      </div>
    ),

    system: (
      <div className="system-content">
        <div className="system-head">
          <span className="status-light" />
          SYSTEM ONLINE
        </div>
        <dl>
          <div>
            <dt>USER</dt>
            <dd>Mark Real</dd>
          </div>
          <div>
            <dt>OS</dt>
            <dd>PortfolioOS 2.0</dd>
          </div>
          <div>
            <dt>ROLE</dt>
            <dd>CS Student</dd>
          </div>
          <div>
            <dt>STATUS</dt>
            <dd>Building</dd>
          </div>
        </dl>
      </div>
    ),

    cmd: (
      <div className="cmd-content">
        <div className="cmd-history">
          {commandHistory.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
        <form className="cmd-line" onSubmit={runCommand}>
          <label htmlFor="portfolio-command">C:\\PORTFOLIO&gt;</label>
          <input
            id="portfolio-command"
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            autoComplete="off"
            spellCheck="false"
            aria-label="Portfolio command"
          />
          <span className="cmd-cursor">_</span>
        </form>
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
          <div className="boot-logo">MR</div>
          <div className="boot-copy">
            <b>PORTFOLIO OS</b>
            <span>Initializing workspace...</span>
            <div className="boot-progress">
              <i />
            </div>
          </div>
        </div>
      )}

      {!booting && locked && (
        <div className="lockscreen">
          <div className="lock-time">
            <b>{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</b>
            <span>{now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}</span>
          </div>
          <form className="lock-panel" onSubmit={unlockPortfolio}>
            <div className="lock-avatar">MR</div>
            <h2>Mark Real</h2>
            <p>PORTFOLIO OS // USER LOGIN</p>
            <div className="lock-input-row">
              <input
                type="password"
                value={lockPassword}
                onChange={(event) => { setLockPassword(event.target.value); setLockError(false); }}
                placeholder="Enter password"
                autoFocus
                aria-label="Portfolio password"
              />
              <button type="submit" aria-label="Unlock PortfolioOS">→</button>
            </div>
            {lockError && <span className="lock-error">Incorrect password. Try again.</span>}
            <div className="lock-note"><span>NOTE.TXT</span>Password hint: <b>Code4Life</b></div>
          </form>
          {showFullscreenPrompt && <div className="lock-fullscreen-alert">
            <div className="lock-fullscreen-alert-head">
              <span><i /> PortfolioOS Display</span>
              <b>×</b>
            </div>
            <div className="lock-fullscreen-alert-body">
              <div className="lock-display-icon">▣</div>
              <div>
                <b>Fullscreen recommended</b>
                <p>For the full PortfolioOS experience, enter fullscreen mode?</p>
                <div className="lock-fullscreen-actions">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await document.documentElement.requestFullscreen();
                      } catch {
                        // Fullscreen may be unavailable or blocked by the browser.
                      }
                      setShowFullscreenPrompt(false);
                    }}
                  >
                    Yes, Fullscreen
                  </button>
                  <button type="button" onClick={() => setShowFullscreenPrompt(false)}>No, Continue</button>
                </div>
              </div>
            </div>
          </div>}
          <div className="lock-footer">PORTFOLIO OS 2.5 · SECURE SESSION</div>
        </div>
      )}

      {showFullscreenPrompt && !locked && (
        <div className="fullscreen-overlay">
          <div className="fullscreen-dialog window">
            <header className="titlebar">
              <span className="window-title">
                <i className="window-dot" />
                PortfolioOS Setup
              </span>
            </header>
            <div className="fullscreen-dialog-body">
              <div className="fullscreen-icon">▣</div>
              <div>
                <b>For the full PortfolioOS experience</b>
                <p>Would you like to view this site in fullscreen mode?</p>
                <div className="fullscreen-actions">
                  <button
                    className="primary-action"
                    onClick={async () => {
                      const audio = audioRef.current;
                      try {
                        if (audio?.paused) await audio.play();
                      } catch {
                        setIsPlaying(false);
                      }
                      try {
                        await document.documentElement.requestFullscreen();
                      } catch {
                        // Fullscreen can be unavailable or blocked by the browser.
                      }
                      setShowFullscreenPrompt(false);
                    }}
                  >
                    Yes, Fullscreen
                  </button>
                  <button
                    className="secondary-action"
                    onClick={async () => {
                      const audio = audioRef.current;
                      try {
                        if (audio?.paused) await audio.play();
                      } catch {
                        setIsPlaying(false);
                      }
                      setShowFullscreenPrompt(false);
                    }}
                  >
                    No, Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="desktop-glow" />
      {!booting && !locked && <div className="desktop-aurora" />}
      {!booting && !locked && (
        <div className="system-widget">
          <div className="system-widget-head"><span /> PORTFOLIO NETWORK</div>
          <div className="system-widget-row"><b>STATUS</b><span>ONLINE</span></div>
          <div className="system-widget-row"><b>SESSION</b><span>MARK_REAL</span></div>
          <div className="system-widget-meter"><i /></div>
          <small>NODE 04 · DUMAGUETE</small>
        </div>
      )}
      {showWelcomeToast && (
        <div className="welcome-toast">
          <span className="welcome-toast-icon">✓</span>
          <div><b>Welcome back, Mark.</b><small>PortfolioOS workspace is ready.</small></div>
        </div>
      )}
      <div className="moon" />
      <div className="stars">·　.　　·　　　.　·　　　.</div>
      <div className="city city-back" />
      <div className="city city-front" />
      <div className="noise" />

      {(booting || locked) && (
        <div className="desktop-brand">
          <span>MR</span>
          <small>PORTFOLIO OS</small>
        </div>
      )}

      <aside className="desktop-icons">
        {desktopItems.map(([symbol, label, id, iconType]) => (
          <button
            className="desktop-item"
            key={label}
            onDoubleClick={() => openWindow(id)}
          >
            <span className={`pixel-icon icon-${iconType}`}><i>{symbol}</i></span>
            <span className="icon-label">{label}</span>
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

      <section
        className="player window utility-window"
        style={utilityPositions.player.x === null ? undefined : { left: utilityPositions.player.x, top: utilityPositions.player.y, right: "auto" }}
      >
        <audio
          ref={audioRef}
          src="/music/lofi.mp3"
          loop
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        />
        <header className="titlebar utility-drag-handle" onMouseDown={(event) => startUtilityDrag(event, "player")}>
          <span className="window-title">
            <i className="window-dot" />
            now_playing.exe
          </span>
          <div className="window-actions">
            <button aria-label={isPlaying ? "Pause music" : "Play music"} onClick={toggleMusic}>
              {isPlaying ? "Ⅱ" : "▶"}
            </button>
          </div>
        </header>
        <div className="player-body">
          <div className={`album-art ${isPlaying ? "playing" : ""}`}>
            <span>LO</span>
            <span>FI</span>
          </div>
          <div className="player-info">
            <small>{isPlaying ? "NOW PLAYING" : "READY TO PLAY"}</small>
            <b>lofi.mp3</b>
            <span>chill.exe</span>
            <button className="track" type="button" aria-label="Seek through track" onClick={seekMusic}>
              <i style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }} />
            </button>
            <div className="player-bottom">
              <span>{formatTime(currentTime)}</span>
              <button className="player-control" type="button" onClick={toggleMusic}>
                {isPlaying ? "❚❚ PAUSE" : "▶ PLAY"}
              </button>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </section>

      <section
        className="note"
        style={utilityPositions.note.x === null ? undefined : { left: utilityPositions.note.x, top: utilityPositions.note.y, right: "auto" }}
      >
        <header className="utility-drag-handle" onMouseDown={(event) => startUtilityDrag(event, "note")}>
          <span>note.exe</span>
          <span>×</span>
        </header>
        <div>
          <small>REMINDER / 001</small>
          <p>
            Good ideas start
            <br />
            with a curious mind.
          </p>
          <b>— MARK</b>
        </div>
      </section>

      <div className="wall-copy">
        <small>PERSONAL SYSTEM / 2026</small>
        SMALL STEPS
        <br />
        <span>BIGGER THINGS.</span>
      </div>

      {startMenuOpen && (
        <div
          className="start-menu"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="start-menu-head">
            <span className="start-avatar">MR</span>
            <div>
              <b>Mark Real</b>
              <small>Computer Science</small>
            </div>
          </div>
          <div className="start-links">
            {desktopItems.filter(([, , id]) => id).map(([symbol, label, id]) => (
              <button key={id} onClick={() => openWindow(id)}>
                <span>{symbol}</span>
                <div>
                  <b>{label}</b>
                  <small>Open {label.toLowerCase()}</small>
                </div>
              </button>
            ))}
          </div>
          <div className="start-footer">
            <button onClick={() => setBooting(true)}>↻ Restart</button>
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
          <span>MR</span>
          Start
        </button>

        <div className="task-divider" />

        <div className="task-list">
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
                <i />
                {definitions[id].title}
              </button>
            ))}
        </div>

        <div className="task-motto">CODE / CREATE / IMPROVE</div>

        <div className="tray">
          <span className="tray-icons">▥　♬　▰</span>
          <div>
            <b>
              {now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </b>
            <small>{now.toLocaleDateString()}</small>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default App;
