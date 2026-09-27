const KEY = 'bt_saved_jobs';

export function getSaved() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function isSaved(id) {
  return getSaved().some((j) => j._id === id);
}

export function toggleSaved(job) {
  const list = getSaved();
  const idx = list.findIndex((j) => j._id === job._id);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(job);
  localStorage.setItem(KEY, JSON.stringify(list));
  return idx < 0;
}

export function removeSaved(id) {
  localStorage.setItem(KEY, JSON.stringify(getSaved().filter((j) => j._id !== id)));
}
