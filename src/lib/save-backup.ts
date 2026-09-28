import { backupFilename, exportBackup } from "./backup";
import { markBackedUp, type CourageState } from "./state";
import { act } from "./store";

/** Saves the backup file (a download) and remembers when, so the save pop-up can rest. */
export function saveBackupFile(state: CourageState) {
  const now = new Date();
  const url = URL.createObjectURL(new Blob([exportBackup(markBackedUp(state, now))], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = backupFilename(now);
  a.click();
  // Later, so Safari and older Firefox have started the download first.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  act((s) => markBackedUp(s, now));
}
