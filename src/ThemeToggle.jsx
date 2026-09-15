import { useEffect, useState } from "react";

function ThemeToggle() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "dark" ? "light" : "dark",
    );
  };

  const isDark = theme === "dark";

  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={!isDark}
      onClick={toggleTheme}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {isDark ? "☾" : "☀"}
      </span>
      <span className="theme-toggle-copy">
        <small>DISPLAY</small>
        <b>{isDark ? "DARK" : "LIGHT"}</b>
      </span>
      <span className={`theme-switch ${isDark ? "is-dark" : "is-light"}`}>
        <i />
      </span>
    </button>
  );
}

export default ThemeToggle;
