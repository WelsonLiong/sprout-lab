// Device-local explorer profiles and lesson progress.
const KEY = 'sprout-sces-profiles-v1';
let storageOK = true;
let db = {version: 1, activeProfileId: null, profiles: []};
const id = () => globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
export const cleanName = value => String(value || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 40) || 'Explorer';

try {
  const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
  if (saved?.version === 1 && Array.isArray(saved.profiles)) {
    db = {
      version: 1,
      activeProfileId: saved.activeProfileId,
      profiles: saved.profiles.filter(profile => profile && typeof profile.id === 'string' && typeof profile.name === 'string'),
    };
    for (const profile of db.profiles) profile.name = cleanName(profile.name);
  }
} catch { storageOK = false }

export function persist() {
  try {localStorage.setItem(KEY, JSON.stringify(db));storageOK = true} catch {storageOK = false}
  return storageOK;
}
export const canSave = () => storageOK;
export const profiles = () => db.profiles;
export const activeProfile = () => db.profiles.find(profile => profile.id === db.activeProfileId) || null;
const profileLabel = profile => db.profiles.filter(item => item.name.toLocaleLowerCase() === profile.name.toLocaleLowerCase()).length > 1
  ? `${profile.name} (Explorer ${db.profiles.indexOf(profile) + 1})` : profile.name;

export function selectProfile(profileId, name) {
  let profile = db.profiles.find(item => item.id === profileId);
  if (!profile) {profile = {id: id(), name: cleanName(name), legacy: {}};db.profiles.push(profile)}
  db.activeProfileId = profile.id;
  persist();
  return profile;
}
export function selectGuestProfile() {
  let profile = db.profiles.find(item => item.guest === true);
  if (!profile) {profile = {id: id(), name: 'Guest', guest: true, legacy: {}};db.profiles.push(profile)}
  db.activeProfileId = profile.id;
  persist();
  return profile;
}
export function saveLegacy(learning) {
  const profile = activeProfile();
  if (profile) {profile.legacy = structuredClone(learning);persist()}
}
export function explorerFields(prefix, escapeHTML, fallback = '') {
  const profile = activeProfile();
  return `${db.profiles.length ? `<label for="${prefix}-profile">Who’s exploring?</label><select id="${prefix}-profile" aria-label="Choose an explorer"><option value="new" ${!profile ? 'selected' : ''}>＋ Add a new profile</option>${db.profiles.map(item => `<option value="${escapeHTML(item.id)}" ${item.id === profile?.id ? 'selected' : ''}>${escapeHTML(profileLabel(item))} · continue</option>`).join('')}</select>` : `<input type="hidden" id="${prefix}-profile" value="new">`}<div id="${prefix}-name-wrap" ${profile ? 'hidden' : ''}><label for="${prefix}-name">What should Sprout call you?</label><input id="${prefix}-name" maxlength="40" ${profile ? '' : 'required'} pattern=".*\\S.*" autocomplete="off" placeholder="Your name or nickname" value="${escapeHTML(profile?.name || fallback)}"></div>`;
}
export function bindExplorerFields(prefix) {
  const picker = document.getElementById(`${prefix}-profile`), field = document.getElementById(`${prefix}-name`), wrap = document.getElementById(`${prefix}-name-wrap`);
  picker?.addEventListener('change', () => {const profile = db.profiles.find(item => item.id === picker.value);wrap.hidden = !!profile;field.required = !profile;field.value = profile?.name || '';if (!profile) field.focus({preventScroll: true})});
  return () => selectProfile(picker?.value, field?.value);
}
