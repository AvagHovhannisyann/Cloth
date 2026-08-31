/**
 * Applies the persisted theme before first paint to avoid a flash.
 * Reads the zustand persist payload directly — key must match lib/store.ts.
 */
const script = `
(function () {
  try {
    var raw = localStorage.getItem("atelier-store-v1");
    var theme = raw ? (JSON.parse(raw).state.settings || {}).theme : "system";
    var dark =
      theme === "dark" ||
      ((theme === "system" || !theme) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
