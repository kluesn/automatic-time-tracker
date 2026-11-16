'use strict';
const obsidian = require('obsidian');
const { Plugin, PluginSettingTab, Setting, Notice, TFile, ItemView, Keymap, Modal, AbstractInputSuggest, normalizePath, setIcon } = obsidian;

const LIVE = 'automatic-time-tracker-live';
const SONST = '__sonstiges__';
const SPRACHE = String((typeof obsidian.getLanguage === 'function' ? obsidian.getLanguage() : obsidian.moment && obsidian.moment.locale()) || 'en')
  .toLowerCase().startsWith('de') ? 'de' : 'en';
const LOCALE = SPRACHE === 'de' ? 'de-DE' : 'en-US';
const FARBEN = ['#4a90d9', '#d9822b', '#6aa84f', '#a64d79', '#c9a227', '#3d9c9c'];

// ---------------------------------------------------------------- Texte
const TEXTE = {
  de: {
    standardOrdner: 'Zeiterfassung', standardNotiz: 'Zeiterfassung', standardBereichProperty: 'bereich',
    sonstiges: 'Sonstiges', ohneProjekt: 'ohne Projekt', nachgetragen: 'nachgetragen', nichtVorhanden: '(nicht mehr vorhanden)',
    ribbon: 'Zeiterfassung starten/pausieren',
    cmdUmschalten: 'Starten/Pausieren', cmdStart: 'Start', cmdPause: 'Pause', cmdStop: 'Stop (Sitzung beenden)',
    cmdLive: 'Live-Ansicht öffnen', cmdOeffnen: 'Übersicht öffnen', cmdNachtragen: 'Zeit nachtragen', cmdVerwalten: 'Nachgetragene Zeiten verwalten',
    noticeLaeuft: 'Zeiterfassung läuft',
    noticePause: (s, h) => `Zeiterfassung pausiert – Sitzung ${s}, heute ${h}`,
    noticeStop: s => `Sitzung beendet – ${s}`,
    statusPausiert: 'Zeiterfassung pausiert – Klick zum Starten',
    statusInaktiv: m => `Zeiterfassung: keine Aktivität seit ${m} min – zählt weiter, sobald du weiterarbeitest`,
    statusLaeuft: 'Zeiterfassung läuft – Klick zum Pausieren',
    viewTitel: 'Zeiterfassung', btStart: 'Start', btWeiter: 'Weiter', btPause: 'Pause', btStop: 'Stop',
    zLaeuft: 'Läuft', zInaktiv: m => `Inaktiv seit ${m} min – zählt weiter, sobald du weiterarbeitest`,
    zPausiert: 'Pausiert', zGestoppt: 'Keine Sitzung – Start drücken',
    aktuelleSitzung: 'aktuelle Sitzung', zaehltFuer: n => `zählt für: ${n}`,
    keinDokument: 'kein Dokument aktiv – Graph, Einstellungen o. Ä. zählen nicht',
    heute: 'Heute', kw: n => `KW ${n}`, gesamt: 'Gesamt', woche: 'Woche', alle: 'Alle', notizen: 'Notizen', projekte: 'Projekte',
    leerWoche: 'Diese Woche noch nichts erfasst.', leerGesamt: 'Noch nichts erfasst.',
    plusZeit: 'Zeit nachtragen', uebersichtOeffnen: 'Übersichtsnotiz', verwalten: 'Nachgetragene',
    dokWeg: 'Dokument nicht mehr vorhanden',
    erinnerungText: 'Du schreibst seit ein paar Minuten, aber die Zeiterfassung läuft nicht.', starten: 'Zeiterfassung starten',
    nTitel: 'Zeit nachtragen', nDauer: 'Dauer', nDauerDesc: 'z. B. 1:30, 90 oder 1,5 h', nDatum: 'Datum', nArt: 'Zuordnung',
    nArtDok: 'Dokument', nArtBereich: 'Bereich und Projekt', nDok: 'Dokument', nDokPlatz: 'Dokument suchen …',
    nBereich: 'Bereich', nProjekt: 'Projekt', nProjektDesc: 'optional', nText: 'Notiz', nTextPlatz: 'z. B. Video Vorlesung',
    speichern: 'Speichern', abbrechen: 'Abbrechen', fDauer: 'Bitte eine gültige Dauer angeben.', fDok: 'Bitte ein Dokument auswählen.',
    fDatum: 'Bitte ein Datum angeben, das nicht in der Zukunft liegt.', gespeichert: d => `${d} nachgetragen`,
    vTitel: 'Nachgetragene Zeiten', vLeer: 'Noch keine Zeiten nachgetragen.', loeschen: 'Löschen', wirklich: 'Wirklich?', geloescht: 'Eintrag gelöscht',
    nHinweis: s => `Wird vom Plugin „Automatic Time Tracker“ automatisch geschrieben, eigene Änderungen werden überschrieben. Stand: ${s}`,
    nKeine: 'Noch keine Zeiten erfasst. Starte die Erfassung über das Uhr-Symbol in der linken Leiste, in der Live-Ansicht oder unten in der Statusleiste.',
    hUeberblick: 'Überblick', hBereich: 'Pro Bereich', hProjekt: 'Pro Projekt', hDokument: 'Pro Dokument', hNachgetragen: 'Nachgetragen', hTage: 'Tage',
    cZeitraum: 'Zeitraum', cZeit: 'Zeit', cDieseWoche: n => `Diese Woche (KW ${n})`, cGesamtSeit: d => `Gesamt (seit ${d})`,
    cBereich: 'Bereich', cProjekt: 'Projekt', cDieseWocheKurz: 'Diese Woche', cDokument: 'Dokument', cZuordnung: 'Bereich · Projekt',
    cAnTagen: 'An Tagen', cZuletzt: 'Zuletzt', cDatum: 'Datum', cDauer: 'Dauer', cNotiz: 'Notiz',
    erfasstZwischen: (a, b) => `Erfasst zwischen ${a} und ${b} Uhr`, kurzGeoeffnet: n => `*${n} Dokument(e) nur kurz geöffnet*`,
    sAllgemein: 'Allgemein', sOrdner: 'Ordner der Übersichtsnotiz', sOrdnerDesc: 'Leer = Hauptordner des Vaults.',
    sNotiz: 'Name der Übersichtsnotiz', sProps: 'Zusätzliche Properties',
    sPropsDesc: 'YAML-Zeilen, die oben in die Übersichtsnotiz geschrieben werden, z. B. „tags: zeiterfassung“.',
    sLeerlauf: 'Leerlauf (Minuten)', sLeerlaufDesc: 'Ohne Maus- oder Tastatureingabe in Obsidian zählt die Zeit nach so vielen Minuten nicht mehr. Die Leerlaufzeit selbst wird wieder abgezogen.',
    sFortsetzen: 'Nach Neustart fortsetzen', sFortsetzenDesc: 'Lief die Erfassung beim Beenden von Obsidian, läuft sie nach dem Start weiter.',
    sBereiche: 'Bereiche', sBereicheDesc: 'Bereiche fassen Dokumente zusammen, z. B. Uni, Arbeit, Privat. Alles, was keinem Bereich zugeordnet ist, steht unter „Sonstiges“.',
    sZuordnung: 'Zuordnung', sZuordnungOrdner: 'Über Ordner', sZuordnungProperty: 'Über Property (Ordner als Rückfall)',
    sZuordnungDesc: 'Bei „Property“ entscheidet der Wert der Bereich-Property einer Notiz. PDFs und andere Dateien ohne Properties werden über die Ordner zugeordnet.',
    sBereichProp: 'Bereich-Property', sBereichPropDesc: 'Name der Property, deren Wert der Bereich ist, z. B. „bereich: Uni“.',
    sProjektProp: 'Projekt-Property', sProjektPropDesc: 'Optional. Liegt eine Notiz nicht in einem Unterordner eines Bereichs, wird das Projekt aus dieser Property gelesen. Ist der Wert ein Link, gilt das Projekt der verlinkten Notiz.',
    sBereichOrdner: 'Ordner, durch Komma getrennt. Das Projekt ist jeweils der erste Unterordner.',
    sBereichNeu: 'Bereich hinzufügen', sBereichLoeschen: 'Bereich entfernen', sUnbekannt: l => `Ordner nicht gefunden: ${l}`, neuerBereich: 'Neuer Bereich',
    sErinnerung: 'Erinnerung', sErinnerungAn: 'Erinnern, wenn die Erfassung nicht läuft',
    sErinnerungAnDesc: 'Wenn du eine Weile schreibst, ohne dass die Zeiterfassung läuft, erscheint ein Hinweis mit Start-Knopf. Nach einem eigenen Klick auf „Pause“ oder „Stop“ meldet er sich bis zum nächsten Tag nicht. Nach einem Hinweis ist 30 Minuten Ruhe.',
    sErinnerungMin: 'Nach wie vielen Minuten Schreiben', sErinnerungBereiche: 'Nur in diesen Bereichen erinnern (keiner gewählt = überall)',
    sAktualisieren: 'Übersicht jetzt aktualisieren', sAktualisierenBt: 'Aktualisieren', aktualisiert: 'Übersicht aktualisiert',
    cmdPomodoro: 'Pomodoro ein/aus', pBereit: m => `Start beginnt die erste Arbeitsphase (${m} min)`,
    pArbeit: (r, n, z) => `Arbeit · Runde ${r}/${n} · noch ${z}`, pArbeitPausiert: z => `Arbeit pausiert · noch ${z}`,
    pPause: z => `Pause · noch ${z}`, pLangePause: z => `Lange Pause · noch ${z}`, pWartet: 'Pause vorbei – „Weiter“ drücken',
    pArbeitEnde: m => `Arbeitsphase vorbei – ${m} min Pause. Die Erfassung ist pausiert.`,
    pPauseEnde: 'Die Pause ist vorbei.', pWeiter: 'Weiter', pAn: 'Pomodoro an', pAus: 'Pomodoro aus',
    sPomodoro: 'Pomodoro', sPomodoroDesc: 'Arbeitsphasen mit festen Pausen. Ein- und ausschalten kannst du den Modus in der Live-Ansicht.',
    sPArbeit: 'Arbeitsphase (Minuten)', sPPause: 'Kurze Pause (Minuten)', sPLang: 'Lange Pause (Minuten)',
    sPRunden: 'Lange Pause nach so vielen Runden', sPTon: 'Ton am Ende einer Phase'
  },
  en: {
    standardOrdner: 'Time tracking', standardNotiz: 'Time tracking', standardBereichProperty: 'area',
    sonstiges: 'Other', ohneProjekt: 'no project', nachgetragen: 'added manually', nichtVorhanden: '(no longer exists)',
    ribbon: 'Start/pause time tracking',
    cmdUmschalten: 'Start/pause', cmdStart: 'Start', cmdPause: 'Pause', cmdStop: 'Stop (end session)',
    cmdLive: 'Open live view', cmdOeffnen: 'Open overview note', cmdNachtragen: 'Add time manually', cmdVerwalten: 'Manage manual entries',
    noticeLaeuft: 'Time tracking started',
    noticePause: (s, h) => `Time tracking paused – session ${s}, today ${h}`,
    noticeStop: s => `Session ended – ${s}`,
    statusPausiert: 'Time tracking paused – click to start',
    statusInaktiv: m => `Time tracking: no activity for ${m} min – resumes as soon as you continue`,
    statusLaeuft: 'Time tracking running – click to pause',
    viewTitel: 'Time tracking', btStart: 'Start', btWeiter: 'Resume', btPause: 'Pause', btStop: 'Stop',
    zLaeuft: 'Running', zInaktiv: m => `Idle for ${m} min – resumes as soon as you continue`,
    zPausiert: 'Paused', zGestoppt: 'No session – press Start',
    aktuelleSitzung: 'current session', zaehltFuer: n => `counting: ${n}`,
    keinDokument: 'no document active – graph, settings etc. are not counted',
    heute: 'Today', kw: n => `Week ${n}`, gesamt: 'Total', woche: 'Week', alle: 'All', notizen: 'Notes', projekte: 'Projects',
    leerWoche: 'Nothing tracked this week yet.', leerGesamt: 'Nothing tracked yet.',
    plusZeit: 'Add time', uebersichtOeffnen: 'Overview note', verwalten: 'Manual entries',
    dokWeg: 'Document no longer exists',
    erinnerungText: "You've been writing for a few minutes, but time tracking isn't running.", starten: 'Start tracking',
    nTitel: 'Add time manually', nDauer: 'Duration', nDauerDesc: 'e.g. 1:30, 90 or 1.5h', nDatum: 'Date', nArt: 'Assign to',
    nArtDok: 'Document', nArtBereich: 'Area and project', nDok: 'Document', nDokPlatz: 'Search document…',
    nBereich: 'Area', nProjekt: 'Project', nProjektDesc: 'optional', nText: 'Note', nTextPlatz: 'e.g. lecture video',
    speichern: 'Save', abbrechen: 'Cancel', fDauer: 'Please enter a valid duration.', fDok: 'Please choose a document.',
    fDatum: 'Please enter a date that is not in the future.', gespeichert: d => `${d} added`,
    vTitel: 'Manual entries', vLeer: 'No manual entries yet.', loeschen: 'Delete', wirklich: 'Sure?', geloescht: 'Entry deleted',
    nHinweis: s => `Written automatically by the Automatic Time Tracker plugin, manual edits will be overwritten. Last update: ${s}`,
    nKeine: 'No time tracked yet. Start tracking via the clock icon in the ribbon, the live view or the status bar.',
    hUeberblick: 'Overview', hBereich: 'By area', hProjekt: 'By project', hDokument: 'By document', hNachgetragen: 'Added manually', hTage: 'Days',
    cZeitraum: 'Period', cZeit: 'Time', cDieseWoche: n => `This week (week ${n})`, cGesamtSeit: d => `Total (since ${d})`,
    cBereich: 'Area', cProjekt: 'Project', cDieseWocheKurz: 'This week', cDokument: 'Document', cZuordnung: 'Area · project',
    cAnTagen: 'Days', cZuletzt: 'Last', cDatum: 'Date', cDauer: 'Duration', cNotiz: 'Note',
    erfasstZwischen: (a, b) => `Tracked between ${a} and ${b}`, kurzGeoeffnet: n => `*${n} document(s) opened only briefly*`,
    sAllgemein: 'General', sOrdner: 'Overview note folder', sOrdnerDesc: 'Empty = vault root.',
    sNotiz: 'Overview note name', sProps: 'Additional properties',
    sPropsDesc: 'YAML lines written at the top of the overview note, e.g. "tags: time-tracking".',
    sLeerlauf: 'Idle timeout (minutes)', sLeerlaufDesc: 'Without mouse or keyboard input in Obsidian, time stops counting after this many minutes. The idle time itself is subtracted again.',
    sFortsetzen: 'Resume after restart', sFortsetzenDesc: 'If tracking was running when Obsidian quit, it continues after the next start.',
    sBereiche: 'Areas', sBereicheDesc: 'Areas group your documents, e.g. University, Work, Personal. Everything not assigned to an area is listed under "Other".',
    sZuordnung: 'Assignment', sZuordnungOrdner: 'By folder', sZuordnungProperty: 'By property (folders as fallback)',
    sZuordnungDesc: 'With "property", the value of the area property decides. PDFs and other files without properties are assigned by folder.',
    sBereichProp: 'Area property', sBereichPropDesc: 'Name of the property holding the area, e.g. "area: Work".',
    sProjektProp: 'Project property', sProjektPropDesc: 'Optional. If a note is not inside a subfolder of an area, the project is read from this property. If the value is a link, the project of the linked note is used.',
    sBereichOrdner: 'Folders, comma-separated. The project is the first subfolder.',
    sBereichNeu: 'Add area', sBereichLoeschen: 'Remove area', sUnbekannt: l => `Folder not found: ${l}`, neuerBereich: 'New area',
    sErinnerung: 'Reminder', sErinnerungAn: "Remind me when tracking isn't running",
    sErinnerungAnDesc: 'If you write for a while without tracking, a notice with a start button appears. After you press "Pause" or "Stop" yourself, it stays quiet until the next day. After a reminder it stays quiet for 30 minutes.',
    sErinnerungMin: 'After how many minutes of writing', sErinnerungBereiche: 'Only remind in these areas (none selected = everywhere)',
    sAktualisieren: 'Update overview now', sAktualisierenBt: 'Update', aktualisiert: 'Overview updated',
    cmdPomodoro: 'Toggle Pomodoro', pBereit: m => `Start begins the first work phase (${m} min)`,
    pArbeit: (r, n, z) => `Work · round ${r}/${n} · ${z} left`, pArbeitPausiert: z => `Work paused · ${z} left`,
    pPause: z => `Break · ${z} left`, pLangePause: z => `Long break · ${z} left`, pWartet: 'Break is over – press "Resume"',
    pArbeitEnde: m => `Work phase done – take a ${m} min break. Tracking is paused.`,
    pPauseEnde: 'Your break is over.', pWeiter: 'Resume', pAn: 'Pomodoro on', pAus: 'Pomodoro off',
    sPomodoro: 'Pomodoro', sPomodoroDesc: 'Work phases with fixed breaks. Turn the mode on and off in the live view.',
    sPArbeit: 'Work phase (minutes)', sPPause: 'Short break (minutes)', sPLang: 'Long break (minutes)',
    sPRunden: 'Long break after this many rounds', sPTon: 'Sound at the end of a phase'
  }
};
const t = (key, ...args) => { const v = TEXTE[SPRACHE][key] ?? TEXTE.en[key] ?? key; return typeof v === 'function' ? v(...args) : v; };

// ---------------------------------------------------------------- Hilfsfunktionen
const pad = n => String(n).padStart(2, '0');
const tagKey = ms => { const d = new Date(ms); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const keyDatum = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const fmt = opt => new Intl.DateTimeFormat(LOCALE, opt);
const tagTitel = k => fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(keyDatum(k));
const datumKurz = k => SPRACHE === 'de' ? fmt({ day: '2-digit', month: '2-digit', year: 'numeric' }).format(keyDatum(k))
  : fmt({ day: 'numeric', month: 'short', year: 'numeric' }).format(keyDatum(k));
const uhr = ms => fmt({ hour: '2-digit', minute: '2-digit' }).format(new Date(ms));
const mitternacht = ms => { const d = new Date(ms); d.setHours(24, 0, 0, 0); return d.getTime(); };
const dauer = ms => { const min = Math.round(ms / 60000); if (ms < 60000) return '< 1 min'; if (min < 60) return `${min} min`; return `${Math.floor(min / 60)} h ${pad(min % 60)} min`; };
const kurz = ms => { const min = Math.floor(ms / 60000); return `${Math.floor(min / 60)}:${pad(min % 60)}`; };
const mmss = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${pad(s % 60)}`; };
const uhrzeitLang = ms => { const s = Math.floor(ms / 1000); return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`; };
const dateiname = p => p.split('/').pop().replace(/\.md$/, '');
const zelle = s => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
function wocheVon(k) { // ISO-Kalenderwoche und Montag der Woche
  const d = keyDatum(k); const tag = (d.getDay() + 6) % 7;
  const montag = new Date(d); montag.setDate(d.getDate() - tag);
  const th = new Date(d); th.setDate(d.getDate() - tag + 3);
  const jan4 = new Date(th.getFullYear(), 0, 4);
  const kw = 1 + Math.round(((th - jan4) / 86400000 - 3 + ((jan4.getDay() + 6) % 7)) / 7);
  return { kw, montag: tagKey(montag.getTime()) };
}
function parseDauer(s) {
  s = String(s).trim().toLowerCase().replace(',', '.'); let m;
  if ((m = s.match(/^(\d+):(\d{1,2})$/))) return (+m[1] * 60 + +m[2]) * 60000;
  if ((m = s.match(/^(\d+(?:\.\d+)?)\s*(?:h|std|stunden?|hours?)$/))) return Math.round(+m[1] * 60) * 60000;
  if ((m = s.match(/^(?:(\d+)\s*(?:h|std)\s*)?(?:(\d+)\s*(?:m|min|minuten?|minutes?)?)?$/)) && (m[1] || m[2])) return ((+m[1] || 0) * 60 + (+m[2] || 0)) * 60000;
  return null;
}
const STANDARD = () => ({
  ordner: t('standardOrdner'), notiz: t('standardNotiz'), notizProperties: '', leerlaufMin: 5, fortsetzen: true,
  zuordnung: 'ordner', bereichProperty: t('standardBereichProperty'), projektProperty: '', bereiche: [],
  erinnerung: true, erinnerungMin: 2, erinnerungBereiche: [],
  pomodoro: false, pArbeit: 25, pPause: 5, pLang: 15, pRunden: 4, pTon: true
});

// ---------------------------------------------------------------- Plugin
module.exports = class AutomaticTimeTracker extends Plugin {
  async onload() {
    const daten = (await this.loadData()) || {};
    this.settings = Object.assign(STANDARD(), daten.settings);
    this.tage = daten.tage || {};          // { 'JJJJ-MM-TT': { pfad: [ms, erster Start, letztes Ende] } }
    this.manuell = daten.manuell || [];    // [{ id, tag, ms, pfad?, bereich?, projekt?, text }]
    this.sitzung = daten.sitzung || null;  // { ms, beginn }
    this.laeuft = false; this.inaktiv = false; this.seg = null;
    this.letzteAktivitaet = Date.now(); this.letzterTick = Date.now(); this.anzeigeZustand = '';
    this.pauseGrund = 'auto'; this.pauseTag = ''; this.erinnertBis = 0; this.tippen = null;
    this.zCache = new Map();
    this.pomo = null; this.pomoHinweis = null;   // { phase: arbeit|pause|wartet, ende, rest, runde, lang, dauer }

    this.statusEl = this.addStatusBarItem();
    this.statusEl.addClass('att-status');
    this.statusEl.setAttr('data-tooltip-position', 'top');
    this.registerDomEvent(this.statusEl, 'click', () => this.umschalten());
    this.ribbonEl = this.addRibbonIcon('timer-off', t('ribbon'), () => this.umschalten());

    this.registerView(LIVE, leaf => new LiveAnsicht(leaf, this));
    this.addCommand({ id: 'umschalten', name: t('cmdUmschalten'), callback: () => this.umschalten() });
    this.addCommand({ id: 'start', name: t('cmdStart'), callback: () => this.start(false) });
    this.addCommand({ id: 'pause', name: t('cmdPause'), callback: () => { if (this.laeuft) this.pause(); } });
    this.addCommand({ id: 'stop', name: t('cmdStop'), callback: () => this.stop() });
    this.addCommand({ id: 'live', name: t('cmdLive'), callback: () => this.liveOeffnen() });
    this.addCommand({ id: 'nachtragen', name: t('cmdNachtragen'), callback: () => new NachtragModal(this.app, this).open() });
    this.addCommand({ id: 'verwalten', name: t('cmdVerwalten'), callback: () => new VerwaltenModal(this.app, this).open() });
    this.addCommand({ id: 'pomodoro', name: t('cmdPomodoro'), callback: () => this.pomodoroUmschalten() });
    this.addCommand({ id: 'oeffnen', name: t('cmdOeffnen'), callback: () => this.oeffnen() });
    this.addSettingTab(new Einstellungen(this.app, this));

    const aktiv = () => {
      const jetzt = Date.now(), vorher = this.letzteAktivitaet;
      this.letzteAktivitaet = jetzt;
      if (this.laeuft && this.seg && jetzt - vorher >= this.leerlaufMs()) this.schliessen(vorher);
      if (this.laeuft && this.inaktiv) this.tick();
    };
    for (const ev of ['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart'])
      this.registerDomEvent(window, ev, aktiv, { capture: true, passive: true });

    this.registerEvent(this.app.workspace.on('active-leaf-change', () => this.tick()));
    this.registerEvent(this.app.workspace.on('editor-change', (ed, info) => this.getippt(info && info.file)));
    this.registerEvent(this.app.vault.on('rename', (f, alt) => this.umbenannt(f.path, alt)));
    this.registerEvent(this.app.metadataCache.on('changed', () => this.zCache.clear()));
    this.registerInterval(window.setInterval(() => this.tick(), 1000));
    this.registerInterval(window.setInterval(() => { if (this.laeuft) this.speichern(); }, 60000));

    this.app.workspace.onLayoutReady(() => {
      if (this.settings.fortsetzen && daten.laeuft) this.start(true);
      this.anzeigen();
    });
    this.anzeigen();
  }

  onunload() { this.schliessen(this.seg ? this.seg.e : Date.now()); this.speichern(false); }

  leerlaufMs() { return Math.max(1, Number(this.settings.leerlaufMin) || 5) * 60000; }
  notizPfad() { return normalizePath(`${this.settings.ordner ? this.settings.ordner + '/' : ''}${this.settings.notiz || t('standardNotiz')}.md`); }
  daten() { return { settings: this.settings, laeuft: this.laeuft, sitzung: this.sitzung, tage: this.tage, manuell: this.manuell }; }
  async einstellungenSichern() { this.zCache.clear(); await this.saveData(this.daten()); this.anzeigen(true); }

  aktuelleDatei() {
    const leaf = this.app.workspace.getMostRecentLeaf(this.app.workspace.rootSplit);
    const f = leaf && leaf.view && leaf.view.file;
    if (!(f instanceof TFile) || f.path === this.notizPfad()) return null;
    return f.path;
  }

  // ------------------------------------------------ Erfassen
  buchen(p, s, e) {
    if (!p || e - s <= 0) return;
    const tg = this.tage[tagKey(s)] || (this.tage[tagKey(s)] = {});
    const r = tg[p] || (tg[p] = [0, s, e]);
    r[0] += e - s; r[1] = Math.min(r[1], s); r[2] = Math.max(r[2], e);
    if (this.sitzung) this.sitzung.ms += e - s;
  }

  schliessen(ende) {
    if (!this.seg) return;
    this.buchen(this.seg.p, this.seg.s, Math.max(this.seg.s, Math.min(ende, this.seg.e)));
    this.seg = null;
  }

  tick() {
    const jetzt = Date.now();
    if (this.laeuft) {
      if (jetzt - this.letzterTick > 10000) this.schliessen(this.letzterTick);          // Ruhezustand des Computers
      if (jetzt - this.letzteAktivitaet >= this.leerlaufMs()) {                         // Leerlauf
        if (!this.inaktiv) { this.inaktiv = true; this.schliessen(this.letzteAktivitaet); }
      } else {
        this.inaktiv = false;
        const p = this.aktuelleDatei();
        if (this.seg && (this.seg.p !== p || tagKey(this.seg.s) !== tagKey(jetzt)))
          this.schliessen(Math.min(jetzt, mitternacht(this.seg.s)));
        if (p) { if (!this.seg) this.seg = { p, s: jetzt, e: jetzt }; else this.seg.e = jetzt; }
      }
    }
    this.letzterTick = jetzt;
    this.pomodoroTick(jetzt);
    this.anzeigen();
  }

  umschalten() { this.laeuft ? this.pause() : this.start(false); }

  start(still) {
    if (this.laeuft) return;
    if (!this.sitzung) this.sitzung = { ms: 0, beginn: Date.now() };
    this.laeuft = true; this.inaktiv = false; this.tippen = null;
    if (this.settings.pomodoro) this.pomodoroArbeit();
    this.letzteAktivitaet = this.letzterTick = Date.now();
    this.tick(); this.speichern();
    if (!still) new Notice(t('noticeLaeuft'));
  }

  pause(grund = 'manuell') {
    if (!this.laeuft) return;
    this.schliessen(Date.now());
    if (this.pomo && this.pomo.phase === 'arbeit' && grund === 'manuell') { this.pomo.rest = Math.max(0, this.pomo.ende - Date.now()); this.pomo.ende = null; }
    this.laeuft = false; this.inaktiv = false;
    this.pauseGrund = grund; this.pauseTag = tagKey(Date.now());
    this.speichern(); this.anzeigen();
    if (grund === 'manuell') new Notice(t('noticePause', uhrzeitLang(this.sitzungMs()), dauer(this.heute())));
  }

  stop() {
    if (!this.sitzung && !this.laeuft) return;
    this.schliessen(Date.now());
    const ms = this.sitzungMs();
    this.laeuft = false; this.inaktiv = false; this.sitzung = null;
    this.pomo = null; this.pomoHinweisSchliessen();
    this.pauseGrund = 'manuell'; this.pauseTag = tagKey(Date.now());
    this.speichern(); this.anzeigen();
    new Notice(t('noticeStop', uhrzeitLang(ms)));
  }

  sitzungMs() {
    if (!this.sitzung) return 0;
    return this.sitzung.ms + (this.seg ? Math.max(0, this.seg.e - this.seg.s) : 0);
  }

  heute() {
    const k = tagKey(Date.now());
    let sum = Object.values(this.tage[k] || {}).reduce((a, r) => a + r[0], 0);
    if (this.seg && tagKey(this.seg.s) === k) sum += this.seg.e - this.seg.s;
    for (const m of this.manuell) if (m.tag === k) sum += m.ms;
    return sum;
  }

  // ------------------------------------------------ Pomodoro
  minuten(key, std) { return Math.max(1, Number(this.settings[key]) || std) * 60000; }

  pomodoroArbeit() {                       // beim Start: Arbeitsphase beginnen oder fortsetzen
    const jetzt = Date.now(), p = this.pomo;
    this.pomoHinweisSchliessen();
    if (p && p.phase === 'arbeit') { if (p.ende === null) p.ende = jetzt + (p.rest || 0); p.rest = 0; return; }
    const runde = p ? p.runde + 1 : 1, d = this.minuten('pArbeit', 25);
    this.pomo = { phase: 'arbeit', ende: jetzt + d, dauer: d, rest: 0, runde };
  }

  pomodoroTick(jetzt) {
    const p = this.pomo;
    if (!this.settings.pomodoro || !p) return;
    if (p.phase === 'arbeit' && this.laeuft && p.ende !== null && jetzt >= p.ende) {
      const lang = p.runde % Math.max(1, Number(this.settings.pRunden) || 4) === 0;
      const d = lang ? this.minuten('pLang', 15) : this.minuten('pPause', 5);
      this.pomo = { phase: 'pause', ende: jetzt + d, dauer: d, runde: p.runde, lang };
      this.pause('auto');
      this.ton(); new Notice(t('pArbeitEnde', Math.round(d / 60000)), 10000);
    } else if (p.phase === 'pause' && jetzt >= p.ende) {
      p.phase = 'wartet'; this.ton();
      let hinweis = null;
      const frag = createFragment(f => {
        f.createDiv({ text: t('pPauseEnde') });
        const b = f.createEl('button', { cls: 'mod-cta att-hinweis-knopf', text: t('pWeiter') });
        b.addEventListener('click', e => { e.stopPropagation(); this.start(false); if (hinweis) hinweis.hide(); });
      });
      hinweis = this.pomoHinweis = new Notice(frag, 0);
    }
  }

  pomodoroUmschalten() {
    this.settings.pomodoro = !this.settings.pomodoro;
    this.pomo = null; this.pomoHinweisSchliessen();
    if (this.settings.pomodoro && this.laeuft) this.pomodoroArbeit();
    this.saveData(this.daten()); this.anzeigen();
    new Notice(this.settings.pomodoro ? t('pAn') : t('pAus'));
  }

  pomoHinweisSchliessen() { if (this.pomoHinweis) { this.pomoHinweis.hide(); this.pomoHinweis = null; } }

  pomodoroText() {
    const p = this.pomo, jetzt = Date.now();
    if (!p) return { text: t('pBereit', Math.round(this.minuten('pArbeit', 25) / 60000)), anteil: 0, phase: 'bereit' };
    if (p.phase === 'arbeit') {
      const rest = p.ende === null ? p.rest : p.ende - jetzt, n = Math.max(1, Number(this.settings.pRunden) || 4);
      return { text: p.ende === null ? t('pArbeitPausiert', mmss(rest)) : t('pArbeit', ((p.runde - 1) % n) + 1, n, mmss(rest)), anteil: 1 - rest / p.dauer, phase: 'arbeit' };
    }
    if (p.phase === 'pause') return { text: p.lang ? t('pLangePause', mmss(p.ende - jetzt)) : t('pPause', mmss(p.ende - jetzt)), anteil: 1 - (p.ende - jetzt) / p.dauer, phase: 'pause' };
    return { text: t('pWartet'), anteil: 1, phase: 'wartet' };
  }

  ton() {
    if (!this.settings.pTon) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const spiel = (f, t0) => {
        const o = ctx.createOscillator(), g = ctx.createGain(), z = ctx.currentTime + t0;
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, z); g.gain.exponentialRampToValueAtTime(0.2, z + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, z + 0.6);
        o.connect(g).connect(ctx.destination); o.start(z); o.stop(z + 0.65);
      };
      spiel(880, 0); spiel(1175, 0.25);
      window.setTimeout(() => ctx.close(), 1500);
    } catch (e) { /* kein Ton möglich */ }
  }

  // ------------------------------------------------ Erinnerung
  getippt(file) {
    if (!this.settings.erinnerung || this.laeuft || !file) return;
    const jetzt = Date.now();
    if (this.pauseGrund === 'manuell' && this.pauseTag === tagKey(jetzt)) return;
    if (jetzt < this.erinnertBis || file.path === this.notizPfad()) return;
    const erlaubt = this.settings.erinnerungBereiche || [];
    if (erlaubt.length && !erlaubt.includes(this.zuordnung(file.path).bereich ?? SONST)) return;
    if (!this.tippen || jetzt - this.tippen.letzt > 60000) this.tippen = { start: jetzt, letzt: jetzt };
    else this.tippen.letzt = jetzt;
    if (jetzt - this.tippen.start >= Math.max(1, Number(this.settings.erinnerungMin) || 2) * 60000) {
      this.tippen = null; this.erinnertBis = jetzt + 30 * 60000;
      this.erinnern();
    }
  }

  erinnern() {
    let hinweis = null;
    const frag = createFragment(f => {
      f.createDiv({ text: t('erinnerungText') });
      const b = f.createEl('button', { cls: 'mod-cta att-hinweis-knopf', text: t('starten') });
      b.addEventListener('click', e => { e.stopPropagation(); this.start(false); if (hinweis) hinweis.hide(); });
    });
    hinweis = new Notice(frag, 20000);
  }

  // ------------------------------------------------ Bereiche und Projekte
  propertyWert(pfad, key) {
    if (!key) return null;
    const f = this.app.vault.getAbstractFileByPath(pfad);
    if (!(f instanceof TFile)) return null;
    let v = this.app.metadataCache.getFileCache(f)?.frontmatter?.[key];
    if (Array.isArray(v)) v = v[0];
    if (v === null || v === undefined || String(v).trim() === '') return null;
    return String(v).trim();
  }

  linkZiel(wert, quelle) {
    const m = wert.match(/^\[\[([^\]|#]+)/);
    if (!m) return { text: wert, datei: null };
    return { text: m[1].split('/').pop(), datei: this.app.metadataCache.getFirstLinkpathDest(m[1], quelle) };
  }

  ordnerZuordnung(pfad) {
    let best = null;
    for (const b of this.settings.bereiche) for (const roh of b.ordner || []) {
      const o = normalizePath(roh || '');
      if (!roh || !o || o === '/') continue;
      if ((pfad === o || pfad.startsWith(o + '/')) && (!best || o.length > best.o.length)) best = { b, o };
    }
    if (!best) return null;
    const rest = pfad.slice(best.o.length + 1).split('/');
    return { bereich: best.b.name, projekt: rest.length > 1 ? rest[0] : null };
  }

  projektAusProperty(pfad) {
    const v = this.propertyWert(pfad, this.settings.projektProperty);
    if (!v) return null;
    const z = this.linkZiel(v, pfad);
    if (z.datei) { const oz = this.ordnerZuordnung(z.datei.path); return (oz && oz.projekt) || z.datei.basename; }
    return z.text;
  }

  bereichAusProperty(pfad) {
    const v = this.propertyWert(pfad, this.settings.bereichProperty);
    if (!v) return null;
    const z = this.linkZiel(v, pfad), name = z.datei ? z.datei.basename : z.text;
    const bekannt = this.settings.bereiche.find(b => b.name.toLowerCase() === name.toLowerCase());
    return bekannt ? bekannt.name : name;
  }

  zuordnung(pfad) {
    if (this.zCache.has(pfad)) return this.zCache.get(pfad);
    let z = null;
    if (this.settings.zuordnung === 'property') {
      const b = this.bereichAusProperty(pfad);
      if (b) z = { bereich: b, projekt: this.projektAusProperty(pfad) };
    }
    if (!z) {
      const oz = this.ordnerZuordnung(pfad);
      z = oz ? { bereich: oz.bereich, projekt: oz.projekt || this.projektAusProperty(pfad) } : { bereich: null, projekt: this.projektAusProperty(pfad) };
    }
    this.zCache.set(pfad, z);
    return z;
  }

  zuordnungEintrag(e) {
    if (e.manuell && !e.pfad) return { bereich: e.manuell.bereich || null, projekt: e.manuell.projekt || null };
    return this.zuordnung(e.pfad);
  }

  bereichName(key) { return !key || key === SONST ? t('sonstiges') : key; }
  bereichFarbe(key) {
    const i = this.settings.bereiche.findIndex(b => b.name === key);
    return i < 0 ? 'var(--text-faint)' : (this.settings.bereiche[i].farbe || FARBEN[i % FARBEN.length]);
  }
  zuordnungText(z) { return z.projekt ? `${this.bereichName(z.bereich)} · ${z.projekt}` : this.bereichName(z.bereich); }

  // ------------------------------------------------ Auswertung
  alleEintraege() {
    const out = [];
    for (const [k, tg] of Object.entries(this.tage)) for (const [p, r] of Object.entries(tg)) out.push({ k, pfad: p, ms: r[0], von: r[1], bis: r[2] });
    if (this.seg && this.seg.e > this.seg.s) out.push({ k: tagKey(this.seg.s), pfad: this.seg.p, ms: this.seg.e - this.seg.s, von: this.seg.s, bis: this.seg.e });
    for (const m of this.manuell) out.push({ k: m.tag, pfad: m.pfad || null, ms: m.ms, manuell: m });
    return out;
  }

  statistik(filter = 'alle') {
    const hk = tagKey(Date.now()), w = wocheVon(hk);
    const r = { heute: 0, woche: 0, gesamt: 0, kw: w.kw, bereiche: {}, dok: { woche: {}, gesamt: {} }, proj: { woche: {}, gesamt: {} } };
    const add = (o, k, ms) => { o[k] = (o[k] || 0) + ms; };
    for (const e of this.alleEintraege()) {
      const z = this.zuordnungEintrag(e), bk = z.bereich ?? SONST;
      add(r.bereiche, bk, e.ms);
      if (filter !== 'alle' && bk !== filter) continue;
      const dk = e.pfad || 'm:' + e.manuell.id, pk = bk + '\u0000' + (z.projekt || '');
      r.gesamt += e.ms; add(r.dok.gesamt, dk, e.ms); add(r.proj.gesamt, pk, e.ms);
      if (e.k >= w.montag && e.k <= hk) { r.woche += e.ms; add(r.dok.woche, dk, e.ms); add(r.proj.woche, pk, e.ms); }
      if (e.k === hk) r.heute += e.ms;
    }
    return r;
  }

  bekannteProjekte(bereich) {
    const s = new Set();
    for (const e of this.alleEintraege()) { const z = this.zuordnungEintrag(e); if ((z.bereich ?? SONST) === bereich && z.projekt) s.add(z.projekt); }
    for (const b of this.settings.bereiche) if ((b.name) === bereich) for (const o of b.ordner || []) {
      const f = this.app.vault.getAbstractFileByPath(normalizePath(o));
      if (f && f.children) for (const c of f.children) if (c.children) s.add(c.name);
    }
    return [...s].sort((a, b) => a.localeCompare(b, LOCALE));
  }

  async nachtragen(eintrag) {
    eintrag.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    this.manuell.push(eintrag);
    await this.speichern(); this.anzeigen(true);
  }

  async manuellLoeschen(id) {
    this.manuell = this.manuell.filter(m => m.id !== id);
    await this.speichern(); this.anzeigen(true);
  }

  // ------------------------------------------------ Anzeige
  anzeigen(neu = false) {
    for (const l of this.app.workspace.getLeavesOfType(LIVE)) if (l.view instanceof LiveAnsicht) { if (neu) l.view.listenKey = l.view.chipKey = ''; l.view.aktualisieren(); }
    const zustand = !this.laeuft ? 'pausiert' : this.inaktiv ? 'inaktiv' : 'laeuft';
    const zeichen = { pausiert: '⏸', inaktiv: '💤', laeuft: '⏱' }[zustand];
    let pomoZusatz = '';
    if (this.settings.pomodoro && this.pomo && this.pomo.phase !== 'wartet' && this.pomo.ende !== null)
      pomoZusatz = ` · ${this.pomo.phase === 'arbeit' ? '🍅' : '☕'} ${mmss(this.pomo.ende - Date.now())}`;
    this.statusEl.setText(`${zeichen} ${kurz(this.heute())}${pomoZusatz}`);
    if (zustand === this.anzeigeZustand) return;
    this.anzeigeZustand = zustand;
    this.statusEl.toggleClass('laeuft', zustand === 'laeuft');
    this.statusEl.toggleClass('inaktiv', zustand === 'inaktiv');
    this.statusEl.setAttr('aria-label', { pausiert: t('statusPausiert'), inaktiv: t('statusInaktiv', this.settings.leerlaufMin), laeuft: t('statusLaeuft') }[zustand]);
    setIcon(this.ribbonEl, this.laeuft ? 'timer' : 'timer-off');
    this.ribbonEl.toggleClass('att-laeuft', this.laeuft);
  }

  async liveOeffnen() {
    let leaf = this.app.workspace.getLeavesOfType(LIVE)[0];
    if (!leaf) { leaf = this.app.workspace.getLeftLeaf(true); await leaf.setViewState({ type: LIVE, active: true }); }
    await this.app.workspace.revealLeaf(leaf);
  }

  umbenannt(neu, alt) {
    const ersetzen = p => p === alt ? neu : p.startsWith(alt + '/') ? neu + p.slice(alt.length) : p;
    for (const tg of Object.values(this.tage)) for (const p of Object.keys(tg)) {
      const q = ersetzen(p); if (q === p) continue;
      const r = tg[p]; delete tg[p];
      if (tg[q]) { tg[q][0] += r[0]; tg[q][1] = Math.min(tg[q][1], r[1]); tg[q][2] = Math.max(tg[q][2], r[2]); } else tg[q] = r;
    }
    for (const m of this.manuell) if (m.pfad) m.pfad = ersetzen(m.pfad);
    if (this.seg) this.seg.p = ersetzen(this.seg.p);
    let geaendert = false;
    for (const b of this.settings.bereiche) b.ordner = (b.ordner || []).map(o => { const q = ersetzen(normalizePath(o)); if (q !== normalizePath(o)) geaendert = true; return q; });
    if (this.settings.ordner) { const q = ersetzen(normalizePath(this.settings.ordner)); if (q !== normalizePath(this.settings.ordner)) { this.settings.ordner = q; geaendert = true; } }
    this.zCache.clear();
    if (geaendert) this.saveData(this.daten());
  }

  async speichern(notiz = true) {
    if (this.seg) {                         // Zwischenstand buchen, nur bis zur letzten Aktivität
      const grenze = Math.max(this.seg.s, Math.min(this.seg.e, this.letzteAktivitaet));
      this.buchen(this.seg.p, this.seg.s, grenze); this.seg.s = grenze;
    }
    await this.saveData(this.daten());
    if (notiz) await this.notizSchreiben().catch(e => console.error('Automatic Time Tracker', e));
  }

  // ------------------------------------------------ Übersichtsnotiz
  link(pfad) {
    if (!this.app.vault.getAbstractFileByPath(pfad)) return `${zelle(dateiname(pfad))} ${t('nichtVorhanden')}`;
    return `[[${pfad.replace(/\.md$/, '')}\\|${zelle(dateiname(pfad))}]]`;
  }

  eintragName(e) { return e.pfad ? this.link(e.pfad) : `✎ ${zelle(e.manuell.text || t('nachgetragen'))}`; }

  rendern() {
    const jetzt = Date.now(), hk = tagKey(jetzt), w = wocheVon(hk);
    const zeilen = [];
    const props = String(this.settings.notizProperties || '').trim();
    if (props) zeilen.push('---', props, '---');
    zeilen.push(`# ${this.settings.notiz || t('standardNotiz')}`, '', t('nHinweis', `${datumKurz(hk)}, ${uhr(jetzt)}`), '');
    const eintraege = this.alleEintraege();
    if (!eintraege.length) return zeilen.concat([t('nKeine'), '']).join('\n');

    const st = this.statistik(), tage = [...new Set(eintraege.map(e => e.k))].sort().reverse();
    zeilen.push(`## ${t('hUeberblick')}`, '', `| ${t('cZeitraum')} | ${t('cZeit')} |`, '|---|---|',
      `| ${t('heute')} | ${dauer(st.heute)} |`, `| ${t('cDieseWoche', st.kw)} | ${dauer(st.woche)} |`,
      `| ${t('cGesamtSeit', datumKurz(tage[tage.length - 1]))} | ${dauer(st.gesamt)} |`, '');

    const bWoche = {}, bGesamt = {};
    for (const [pk, ms] of Object.entries(st.proj.gesamt)) { const b = pk.split('\u0000')[0]; bGesamt[b] = (bGesamt[b] || 0) + ms; bWoche[b] = (bWoche[b] || 0) + (st.proj.woche[pk] || 0); }
    zeilen.push(`## ${t('hBereich')}`, '', `| ${t('cBereich')} | ${t('cDieseWocheKurz')} | ${t('gesamt')} |`, '|---|---|---|');
    for (const b of Object.keys(bGesamt).sort((a, c) => bGesamt[c] - bGesamt[a]))
      zeilen.push(`| ${zelle(this.bereichName(b))} | ${bWoche[b] ? dauer(bWoche[b]) : '–'} | ${dauer(bGesamt[b])} |`);
    zeilen.push('');

    zeilen.push(`## ${t('hProjekt')}`, '', `| ${t('cBereich')} | ${t('cProjekt')} | ${t('cDieseWocheKurz')} | ${t('gesamt')} |`, '|---|---|---|---|');
    for (const pk of Object.keys(st.proj.gesamt).sort((a, c) => st.proj.gesamt[c] - st.proj.gesamt[a])) {
      const [b, p] = pk.split('\u0000');
      zeilen.push(`| ${zelle(this.bereichName(b))} | ${zelle(p || t('ohneProjekt'))} | ${st.proj.woche[pk] ? dauer(st.proj.woche[pk]) : '–'} | ${dauer(st.proj.gesamt[pk])} |`);
    }
    zeilen.push('');

    const dok = {};
    for (const e of eintraege) {
      const dk = e.pfad || 'm:' + e.manuell.id;
      const d = dok[dk] || (dok[dk] = { e, ms: 0, tage: new Set(), zuletzt: e.k });
      d.ms += e.ms; d.tage.add(e.k); if (e.k > d.zuletzt) d.zuletzt = e.k;
    }
    zeilen.push(`## ${t('hDokument')}`, '', `| ${t('cDokument')} | ${t('cZuordnung')} | ${t('gesamt')} | ${t('cAnTagen')} | ${t('cZuletzt')} |`, '|---|---|---|---|---|');
    for (const dk of Object.keys(dok).sort((a, c) => dok[c].ms - dok[a].ms)) {
      const d = dok[dk]; if (d.ms < 30000) continue;
      zeilen.push(`| ${this.eintragName(d.e)} | ${zelle(this.zuordnungText(this.zuordnungEintrag(d.e)))} | ${dauer(d.ms)} | ${d.tage.size} | ${datumKurz(d.zuletzt)} |`);
    }
    zeilen.push('');

    if (this.manuell.length) {
      zeilen.push(`## ${t('hNachgetragen')}`, '', `| ${t('cDatum')} | ${t('cDauer')} | ${t('cZuordnung')} | ${t('cDokument')} | ${t('cNotiz')} |`, '|---|---|---|---|---|');
      for (const m of [...this.manuell].sort((a, c) => c.tag.localeCompare(a.tag))) {
        const e = { pfad: m.pfad || null, manuell: m };
        zeilen.push(`| ${datumKurz(m.tag)} | ${dauer(m.ms)} | ${zelle(this.zuordnungText(this.zuordnungEintrag(e)))} | ${m.pfad ? this.link(m.pfad) : '–'} | ${zelle(m.text || '')} |`);
      }
      zeilen.push('');
    }

    zeilen.push(`## ${t('hTage')}`, '');
    for (const k of tage) {
      const tagE = eintraege.filter(e => e.k === k), erfasst = tagE.filter(e => !e.manuell);
      const summe = tagE.reduce((a, e) => a + e.ms, 0);
      zeilen.push(`### ${tagTitel(k)} · ${dauer(summe)}`, '');
      if (erfasst.length) zeilen.push(t('erfasstZwischen', uhr(Math.min(...erfasst.map(e => e.von))), uhr(Math.max(...erfasst.map(e => e.bis)))), '');
      zeilen.push(`| ${t('cDokument')} | ${t('cZuordnung')} | ${t('cZeit')} |`, '|---|---|---|');
      let kurzGeoeffnet = 0;
      for (const e of tagE.sort((a, c) => c.ms - a.ms)) {
        if (!e.manuell && e.ms < 30000) { kurzGeoeffnet++; continue; }
        zeilen.push(`| ${this.eintragName(e)}${e.manuell && e.pfad ? ' ✎' : ''} | ${zelle(this.zuordnungText(this.zuordnungEintrag(e)))} | ${dauer(e.ms)} |`);
      }
      if (kurzGeoeffnet) zeilen.push(`| ${t('kurzGeoeffnet', kurzGeoeffnet)} | | < 30 s |`);
      zeilen.push('');
    }
    return zeilen.join('\n');
  }

  async notizSchreiben() {
    const pfad = this.notizPfad(), ordner = pfad.includes('/') ? pfad.slice(0, pfad.lastIndexOf('/')) : '';
    if (ordner && !this.app.vault.getAbstractFileByPath(ordner)) await this.app.vault.createFolder(ordner).catch(() => {});
    const inhalt = this.rendern(), f = this.app.vault.getAbstractFileByPath(pfad);
    if (f instanceof TFile) { if ((await this.app.vault.cachedRead(f)) !== inhalt) await this.app.vault.process(f, () => inhalt); }
    else await this.app.vault.create(pfad, inhalt);
  }

  async oeffnen() {
    await this.speichern();
    const f = this.app.vault.getAbstractFileByPath(this.notizPfad());
    if (f instanceof TFile) await this.app.workspace.getLeaf('tab').openFile(f);
  }
};

// ---------------------------------------------------------------- Live-Ansicht
class LiveAnsicht extends ItemView {
  constructor(leaf, plugin) {
    super(leaf); this.plugin = plugin;
    this.zeitraum = 'woche'; this.gruppe = 'notizen'; this.filter = 'alle'; this.listenKey = ''; this.chipKey = '';
  }
  getViewType() { return LIVE; }
  getDisplayText() { return t('viewTitel'); }
  getIcon() { return 'timer'; }

  async onOpen() {
    const p = this.plugin, c = this.contentEl;
    c.empty(); c.addClass('att-live');
    const knoepfe = c.createDiv('att-knoepfe');
    this.btStart = this.knopf(knoepfe, 'play', t('btStart'), () => p.start(false));
    this.btPause = this.knopf(knoepfe, 'pause', t('btPause'), () => p.pause());
    this.btStop = this.knopf(knoepfe, 'square', t('btStop'), () => p.stop());

    const uhrBox = c.createDiv('att-uhrbox');
    this.zustandEl = uhrBox.createDiv('att-zustand');
    this.uhrEl = uhrBox.createDiv({ cls: 'att-uhr', text: '00:00:00' });
    uhrBox.createDiv({ cls: 'att-unterzeile', text: t('aktuelleSitzung') });
    this.dokEl = uhrBox.createDiv('att-dok');

    this.pomoEl = c.createDiv('att-pomo');
    const pk = this.pomoEl.createDiv('att-pomo-kopf');
    pk.createSpan({ cls: 'att-pomo-titel', text: '🍅 Pomodoro' });
    this.pomoSchalter = pk.createDiv('checkbox-container');
    this.pomoSchalter.onclick = () => p.pomodoroUmschalten();
    this.pomoText = this.pomoEl.createDiv('att-pomo-text');
    this.pomoFill = this.pomoEl.createDiv('att-pomo-balken').createDiv('att-pomo-fill');

    this.chipsEl = c.createDiv('att-chips');
    const summen = c.createDiv('att-summen');
    const feld = () => { const f = summen.createDiv('att-feld'); return [f.createDiv('att-wert'), f.createDiv('att-label')]; };
    let l;
    [this.heuteEl, l] = feld(); l.setText(t('heute'));
    [this.wocheEl, this.wocheLabel] = feld();
    [this.gesamtEl, l] = feld(); l.setText(t('gesamt'));

    const kopf = c.createDiv('att-listenkopf');
    const umsch = (werte, key) => {
      const g = kopf.createDiv('att-umschalter'), bts = {};
      for (const [wert, text] of werte) {
        const b = g.createEl('button', { text }); bts[wert] = b;
        b.onclick = () => { this[key] = wert; this.listenKey = ''; this.aktualisieren(); };
      }
      return bts;
    };
    this.btZeitraum = umsch([['woche', t('woche')], ['gesamt', t('gesamt')]], 'zeitraum');
    this.btGruppe = umsch([['notizen', t('notizen')], ['projekte', t('projekte')]], 'gruppe');
    this.listeEl = c.createDiv('att-liste');

    const fuss = c.createDiv('att-fuss');
    const plus = fuss.createEl('button', { cls: 'att-plus' });
    setIcon(plus.createSpan(), 'plus'); plus.createSpan({ text: t('plusZeit') });
    plus.onclick = () => new NachtragModal(this.app, p).open();
    const links = fuss.createDiv('att-links');
    const a1 = links.createEl('a', { text: t('uebersichtOeffnen'), href: '#' });
    a1.onclick = e => { e.preventDefault(); p.oeffnen(); };
    links.createSpan({ text: ' · ' });
    const a2 = links.createEl('a', { text: t('verwalten'), href: '#' });
    a2.onclick = e => { e.preventDefault(); new VerwaltenModal(this.app, p).open(); };
    this.aktualisieren();
  }

  knopf(parent, icon, text, fn) {
    const b = parent.createEl('button', { cls: 'att-knopf' });
    setIcon(b.createSpan('att-knopf-icon'), icon);
    b.createSpan({ cls: 'att-knopf-text', text });
    b.onclick = fn;
    return b;
  }

  chips(st) {
    const p = this.plugin;
    const keys = ['alle', ...p.settings.bereiche.map(b => b.name), ...(st.bereiche[SONST] ? [SONST] : [])];
    for (const k of Object.keys(st.bereiche)) if (!keys.includes(k)) keys.push(k);
    if (!keys.includes(this.filter)) this.filter = 'alle';
    const key = keys.join('|') + '#' + this.filter;
    if (key === this.chipKey) return;
    this.chipKey = key; this.chipsEl.empty();
    this.chipsEl.toggleClass('att-versteckt', keys.length <= 2);
    for (const k of keys) {
      const b = this.chipsEl.createEl('button', { cls: 'att-chip' + (k === this.filter ? ' aktiv' : '') });
      if (k !== 'alle') b.createSpan({ cls: 'att-punkt' }).setCssProps({ '--att-farbe': p.bereichFarbe(k) });
      b.createSpan({ text: k === 'alle' ? t('alle') : p.bereichName(k) });
      b.onclick = () => { this.filter = k; this.chipKey = this.listenKey = ''; this.aktualisieren(); };
    }
  }

  aktualisieren() {
    if (!this.uhrEl) return;
    const p = this.plugin, st = p.statistik(this.filter);
    const zustand = p.laeuft ? (p.inaktiv ? 'inaktiv' : 'laeuft') : (p.sitzung ? 'pausiert' : 'gestoppt');
    this.contentEl.dataset.zustand = zustand;
    this.zustandEl.setText({ laeuft: t('zLaeuft'), inaktiv: t('zInaktiv', p.settings.leerlaufMin), pausiert: t('zPausiert'), gestoppt: t('zGestoppt') }[zustand]);
    this.uhrEl.setText(uhrzeitLang(p.sitzungMs()));
    const aktuell = p.laeuft && !p.inaktiv ? p.aktuelleDatei() : null;
    this.dokEl.setText(aktuell ? t('zaehltFuer', dateiname(aktuell)) : zustand === 'laeuft' ? t('keinDokument') : '');

    this.btStart.disabled = p.laeuft; this.btPause.disabled = !p.laeuft; this.btStop.disabled = !p.sitzung && !p.laeuft;
    this.btStart.lastChild.setText(p.sitzung && !p.laeuft ? t('btWeiter') : t('btStart'));
    const pomoAn = !!p.settings.pomodoro;
    this.pomoSchalter.toggleClass('is-enabled', pomoAn);
    this.pomoEl.toggleClass('att-pomo-an', pomoAn);
    if (pomoAn) {
      const pt = p.pomodoroText();
      this.pomoEl.dataset.phase = pt.phase; this.pomoText.setText(pt.text);
      this.pomoFill.setCssProps({ '--att-breite': `${Math.min(100, Math.max(0, Math.round(pt.anteil * 100)))}%` });
    }
    this.chips(st);
    this.heuteEl.setText(kurz(st.heute)); this.wocheEl.setText(kurz(st.woche)); this.gesamtEl.setText(kurz(st.gesamt));
    this.wocheLabel.setText(t('kw', st.kw));
    for (const [k, b] of Object.entries(this.btZeitraum)) b.toggleClass('aktiv', k === this.zeitraum);
    for (const [k, b] of Object.entries(this.btGruppe)) b.toggleClass('aktiv', k === this.gruppe);

    const quelle = this.gruppe === 'notizen' ? st.dok : st.proj, werte = quelle[this.zeitraum];
    const liste = Object.keys(werte).filter(x => werte[x] >= 30000 || x === aktuell || x.startsWith('m:')).sort((a, b) => werte[b] - werte[a]);
    const key = [this.zeitraum, this.gruppe, this.filter, aktuell, ...liste.map(x => x + ':' + Math.floor(werte[x] / 60000))].join('|');
    if (key === this.listenKey) return;
    this.listenKey = key;
    this.listeEl.empty();
    if (!liste.length) { this.listeEl.createDiv({ cls: 'att-leer', text: this.zeitraum === 'woche' ? t('leerWoche') : t('leerGesamt') }); return; }
    const max = werte[liste[0]] || 1;
    for (const k of liste) {
      let name, z, onclick;
      if (this.gruppe === 'projekte') {
        const [b, pr] = k.split('\u0000'); name = pr || t('ohneProjekt'); z = { bereich: b, projekt: null };
      } else if (k.startsWith('m:')) {
        const m = p.manuell.find(x => x.id === k.slice(2));
        name = `✎ ${(m && m.text) || t('nachgetragen')}`; z = m ? p.zuordnungEintrag({ manuell: m }) : { bereich: null };
        onclick = () => new VerwaltenModal(this.app, p).open();
      } else {
        name = dateiname(k); z = p.zuordnung(k);
        onclick = e => {
          const f = this.app.vault.getAbstractFileByPath(k);
          if (f instanceof TFile) this.app.workspace.getLeaf(Keymap.isModEvent(e)).openFile(f); else new Notice(t('dokWeg'));
        };
      }
      const zeile = this.listeEl.createDiv('att-zeile');
      if (k === aktuell) zeile.addClass('att-aktuell');
      if (onclick) zeile.onclick = onclick; else zeile.addClass('att-ohne-klick');
      const oben = zeile.createDiv('att-zeile-oben');
      oben.createSpan({ cls: 'att-name', text: name }).setAttr('title', k.startsWith('m:') || this.gruppe === 'projekte' ? name : k);
      oben.createSpan({ cls: 'att-zeit', text: dauer(werte[k]) });
      const unten = zeile.createDiv('att-zeile-unten');
      const bk = z.bereich ?? SONST;
      unten.createSpan({ cls: 'att-punkt' }).setCssProps({ '--att-farbe': p.bereichFarbe(bk) });
      unten.createSpan({ cls: 'att-modul', text: this.gruppe === 'projekte' ? p.bereichName(bk) : p.zuordnungText(z) });
      const balken = unten.createDiv('att-balken').createDiv('att-balken-fill');
      balken.setCssProps({ '--att-breite': `${Math.max(3, Math.round(werte[k] / max * 100))}%`,
        '--att-farbe': p.bereichFarbe(bk) === 'var(--text-faint)' ? 'var(--interactive-accent)' : p.bereichFarbe(bk) });
    }
  }
}

// ---------------------------------------------------------------- Nachtragen
class DateiSuggest extends AbstractInputSuggest {
  constructor(app, input, plugin) { super(app, input); this.plugin = plugin; this.input = input; }
  getSuggestions(q) {
    const s = q.toLowerCase(), np = this.plugin.notizPfad();
    return this.app.vault.getFiles().filter(f => f.path !== np && f.path.toLowerCase().includes(s))
      .sort((a, b) => b.stat.mtime - a.stat.mtime).slice(0, 30);
  }
  renderSuggestion(f, el) { el.createDiv({ text: f.basename }); el.createDiv({ cls: 'att-suggest-pfad', text: f.parent && f.parent.path !== '/' ? f.parent.path : '' }); }
  selectSuggestion(f) { this.input.value = f.path; this.input.dispatchEvent(new Event('input')); this.close(); }
}

class TextSuggest extends AbstractInputSuggest {
  constructor(app, input, quelle) { super(app, input); this.quelle = quelle; this.input = input; }
  getSuggestions(q) { const s = q.toLowerCase(); return this.quelle().filter(x => x.toLowerCase().includes(s)).slice(0, 30); }
  renderSuggestion(x, el) { el.setText(x); }
  selectSuggestion(x) { this.input.value = x; this.input.dispatchEvent(new Event('input')); this.close(); }
}

class NachtragModal extends Modal {
  constructor(app, plugin) {
    super(app); this.plugin = plugin;
    const aktuell = plugin.aktuelleDatei();
    this.werte = { dauer: '', tag: tagKey(Date.now()), art: 'dok', pfad: aktuell || '', bereich: (plugin.settings.bereiche[0] || {}).name || SONST, projekt: '', text: '' };
  }
  onOpen() {
    const { contentEl } = this, p = this.plugin, w = this.werte;
    this.setTitle ? this.setTitle(t('nTitel')) : contentEl.createEl('h2', { text: t('nTitel') });
    contentEl.addClass('att-modal');
    new Setting(contentEl).setName(t('nDauer')).setDesc(t('nDauerDesc')).addText(tx => {
      tx.setValue(w.dauer).onChange(v => { w.dauer = v; }); window.setTimeout(() => tx.inputEl.focus(), 10);
      tx.inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') this.speichern(); });
    });
    new Setting(contentEl).setName(t('nDatum')).addText(tx => {
      tx.inputEl.type = 'date'; tx.inputEl.max = tagKey(Date.now()); tx.setValue(w.tag).onChange(v => { w.tag = v; });
    });
    new Setting(contentEl).setName(t('nArt')).addDropdown(d => d.addOption('dok', t('nArtDok')).addOption('bereich', t('nArtBereich'))
      .setValue(w.art).onChange(v => { w.art = v; this.felder(); }));
    this.felderEl = contentEl.createDiv();
    new Setting(contentEl).setName(t('nText')).addText(tx => {
      tx.setPlaceholder(t('nTextPlatz')).setValue(w.text).onChange(v => { w.text = v; });
      tx.inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') this.speichern(); });
    });
    new Setting(contentEl)
      .addButton(b => b.setButtonText(t('abbrechen')).onClick(() => this.close()))
      .addButton(b => b.setButtonText(t('speichern')).setCta().onClick(() => this.speichern()));
    this.felder();
  }
  felder() {
    const el = this.felderEl, p = this.plugin, w = this.werte; el.empty();
    if (w.art === 'dok') {
      new Setting(el).setName(t('nDok')).addSearch(s => {
        s.setPlaceholder(t('nDokPlatz')).setValue(w.pfad).onChange(v => { w.pfad = v; });
        new DateiSuggest(this.app, s.inputEl, p);
      });
    } else {
      new Setting(el).setName(t('nBereich')).addDropdown(d => {
        for (const b of p.settings.bereiche) d.addOption(b.name, b.name);
        d.addOption(SONST, t('sonstiges'));
        d.setValue(w.bereich).onChange(v => { w.bereich = v; });
      });
      new Setting(el).setName(t('nProjekt')).setDesc(t('nProjektDesc')).addText(tx => {
        tx.setValue(w.projekt).onChange(v => { w.projekt = v; });
        new TextSuggest(this.app, tx.inputEl, () => p.bekannteProjekte(w.bereich));
      });
    }
  }
  async speichern() {
    const p = this.plugin, w = this.werte, ms = parseDauer(w.dauer);
    if (!ms || ms <= 0) return new Notice(t('fDauer'));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(w.tag) || w.tag > tagKey(Date.now())) return new Notice(t('fDatum'));
    const eintrag = { tag: w.tag, ms, text: w.text.trim() };
    if (w.art === 'dok') {
      const f = this.app.vault.getAbstractFileByPath(normalizePath(w.pfad.trim()));
      if (!(f instanceof TFile)) return new Notice(t('fDok'));
      eintrag.pfad = f.path;
    } else {
      eintrag.bereich = w.bereich === SONST ? null : w.bereich;
      if (w.projekt.trim()) eintrag.projekt = w.projekt.trim();
    }
    await p.nachtragen(eintrag);
    new Notice(t('gespeichert', dauer(ms)));
    this.close();
  }
  onClose() { this.contentEl.empty(); }
}

class VerwaltenModal extends Modal {
  constructor(app, plugin) { super(app); this.plugin = plugin; }
  onOpen() { this.setTitle ? this.setTitle(t('vTitel')) : null; this.contentEl.addClass('att-modal'); this.liste(); }
  liste() {
    const p = this.plugin, el = this.contentEl; el.empty();
    if (!this.setTitle) el.createEl('h2', { text: t('vTitel') });
    if (!p.manuell.length) { el.createDiv({ cls: 'att-leer', text: t('vLeer') }); return; }
    for (const m of [...p.manuell].sort((a, b) => b.tag.localeCompare(a.tag))) {
      const z = p.zuordnungEintrag({ pfad: m.pfad || null, manuell: m });
      const s = new Setting(el).setName(`${datumKurz(m.tag)} · ${dauer(m.ms)}${m.text ? ' · ' + m.text : ''}`)
        .setDesc(m.pfad ? `${dateiname(m.pfad)} (${p.zuordnungText(z)})` : p.zuordnungText(z));
      s.addButton(b => {
        b.setIcon('trash').setTooltip(t('loeschen'));
        b.onClick(async () => {
          if (!b.buttonEl.hasClass('mod-warning')) { b.setButtonText(t('wirklich')).setWarning(); return; }
          await p.manuellLoeschen(m.id); new Notice(t('geloescht')); this.liste();
        });
      });
    }
  }
  onClose() { this.contentEl.empty(); }
}

// ---------------------------------------------------------------- Einstellungen
class Einstellungen extends PluginSettingTab {
  constructor(app, plugin) { super(app, plugin); this.plugin = plugin; }
  display() {
    const { containerEl } = this, p = this.plugin, s = p.settings; containerEl.empty();
    const sichern = () => p.einstellungenSichern();

    new Setting(containerEl).setName(t('sOrdner')).setDesc(t('sOrdnerDesc'))
      .addText(tx => tx.setValue(s.ordner).onChange(async v => { s.ordner = v.trim(); await sichern(); }));
    new Setting(containerEl).setName(t('sNotiz'))
      .addText(tx => tx.setValue(s.notiz).onChange(async v => { s.notiz = v.trim() || t('standardNotiz'); await sichern(); }));
    new Setting(containerEl).setName(t('sProps')).setDesc(t('sPropsDesc'))
      .addTextArea(tx => { tx.setValue(s.notizProperties).onChange(async v => { s.notizProperties = v; await sichern(); }); tx.inputEl.rows = 3; });
    new Setting(containerEl).setName(t('sLeerlauf')).setDesc(t('sLeerlaufDesc'))
      .addSlider(sl => sl.setLimits(1, 30, 1).setValue(s.leerlaufMin).setDynamicTooltip().onChange(async v => { s.leerlaufMin = v; await sichern(); }));
    new Setting(containerEl).setName(t('sFortsetzen')).setDesc(t('sFortsetzenDesc'))
      .addToggle(tg => tg.setValue(s.fortsetzen).onChange(async v => { s.fortsetzen = v; await sichern(); }));

    new Setting(containerEl).setName(t('sBereiche')).setDesc(t('sBereicheDesc')).setHeading();
    new Setting(containerEl).setName(t('sZuordnung')).setDesc(t('sZuordnungDesc'))
      .addDropdown(d => d.addOption('ordner', t('sZuordnungOrdner')).addOption('property', t('sZuordnungProperty'))
        .setValue(s.zuordnung).onChange(async v => { s.zuordnung = v; await sichern(); this.display(); }));
    if (s.zuordnung === 'property')
      new Setting(containerEl).setName(t('sBereichProp')).setDesc(t('sBereichPropDesc'))
        .addText(tx => tx.setValue(s.bereichProperty).onChange(async v => { s.bereichProperty = v.trim(); await sichern(); }));
    new Setting(containerEl).setName(t('sProjektProp')).setDesc(t('sProjektPropDesc'))
      .addText(tx => tx.setValue(s.projektProperty).onChange(async v => { s.projektProperty = v.trim(); await sichern(); }));

    s.bereiche.forEach((b, i) => {
      const fehlend = (b.ordner || []).filter(o => o && !this.app.vault.getAbstractFileByPath(normalizePath(o)));
      const zeile = new Setting(containerEl).setClass('att-bereich-zeile')
        .setDesc(fehlend.length ? t('sUnbekannt', fehlend.join(', ')) : t('sBereichOrdner'));
      if (typeof zeile.addColorPicker === 'function')
        zeile.addColorPicker(c => c.setValue(b.farbe || FARBEN[i % FARBEN.length]).onChange(async v => { b.farbe = v; await sichern(); }));
      zeile.addText(tx => tx.setPlaceholder(t('nBereich')).setValue(b.name).onChange(async v => {
        const alt = b.name; b.name = v.trim() || alt;
        s.erinnerungBereiche = s.erinnerungBereiche.map(x => x === alt ? b.name : x);
        for (const m of p.manuell) if (m.bereich === alt) m.bereich = b.name;
        await sichern();
      }));
      zeile.addText(tx => { tx.inputEl.addClass('att-ordnerfeld'); tx.setPlaceholder('Ordner/Unterordner').setValue((b.ordner || []).join(', '))
        .onChange(async v => { b.ordner = v.split(',').map(x => x.trim()).filter(Boolean); await sichern(); }); });
      zeile.addExtraButton(x => x.setIcon('trash').setTooltip(t('sBereichLoeschen')).onClick(async () => {
        s.bereiche.splice(i, 1); s.erinnerungBereiche = s.erinnerungBereiche.filter(n => n !== b.name); await sichern(); this.display();
      }));
    });
    new Setting(containerEl).addButton(bt => bt.setButtonText(t('sBereichNeu')).onClick(async () => {
      s.bereiche.push({ name: `${t('neuerBereich')} ${s.bereiche.length + 1}`, ordner: [], farbe: FARBEN[s.bereiche.length % FARBEN.length] });
      await sichern(); this.display();
    }));

    new Setting(containerEl).setName(t('sErinnerung')).setHeading();
    new Setting(containerEl).setName(t('sErinnerungAn')).setDesc(t('sErinnerungAnDesc'))
      .addToggle(tg => tg.setValue(s.erinnerung).onChange(async v => { s.erinnerung = v; await sichern(); this.display(); }));
    if (s.erinnerung) {
      new Setting(containerEl).setName(t('sErinnerungMin'))
        .addSlider(sl => sl.setLimits(1, 10, 1).setValue(s.erinnerungMin).setDynamicTooltip().onChange(async v => { s.erinnerungMin = v; await sichern(); }));
      const auswahl = new Setting(containerEl).setName(t('sErinnerungBereiche'));
      for (const name of [...s.bereiche.map(b => b.name), SONST]) {
        auswahl.addToggle(tg => {
          tg.setTooltip(p.bereichName(name)).setValue(s.erinnerungBereiche.includes(name)).onChange(async v => {
            s.erinnerungBereiche = v ? [...new Set([...s.erinnerungBereiche, name])] : s.erinnerungBereiche.filter(n => n !== name); await sichern();
          });
          tg.toggleEl.parentElement.insertBefore(createSpan({ cls: 'att-toggle-label', text: p.bereichName(name) }), tg.toggleEl);
        });
      }
    }

    new Setting(containerEl).setName(t('sPomodoro')).setDesc(t('sPomodoroDesc')).setHeading();
    const regler = (key, name, min, max, schritt) => new Setting(containerEl).setName(t(name))
      .addSlider(sl => sl.setLimits(min, max, schritt).setValue(s[key]).setDynamicTooltip().onChange(async v => { s[key] = v; await sichern(); }));
    regler('pArbeit', 'sPArbeit', 5, 90, 5); regler('pPause', 'sPPause', 1, 30, 1); regler('pLang', 'sPLang', 5, 60, 5); regler('pRunden', 'sPRunden', 2, 8, 1);
    new Setting(containerEl).setName(t('sPTon')).addToggle(tg => tg.setValue(s.pTon).onChange(async v => { s.pTon = v; await sichern(); }));

    new Setting(containerEl).setName(t('sAktualisieren'))
      .addButton(bt => bt.setButtonText(t('sAktualisierenBt')).onClick(async () => { await p.speichern(); new Notice(t('aktualisiert')); }));
  }
}
