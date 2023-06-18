import { DEFAULT_SETTING, DEFAULT_USAGE, I18Ns, STORAGE_AREA } from "../../common/constants";
import { compareVersion, debounce, getI18NMessage, setBadge, storageGetP, storageSetP } from "../../common/utils";

(async () => {

const settings = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
const {TARGET_LANG, UI_LANG, UI_TAREGT_LANG_SAME } = settings;
const uiLang = UI_TAREGT_LANG_SAME ? TARGET_LANG : UI_LANG;

const titleE = document.getElementById('title');
const clickHereE = document.getElementsByClassName('click-here');
const exampleContainerE = document.getElementById('example-container');
const imageE = document.getElementById('example-img') as HTMLImageElement;
const closeE = document.getElementById('example-close');
const tableE = document.getElementById('release-table');
const versionsE = document.getElementsByClassName('version');
const tableHeadsE = document.querySelectorAll('table tr th');
const tableCellE = document.querySelector('table tr td');
const tableCellEPos = tableCellE.getBoundingClientRect();
const tableCellHeight = tableCellEPos.height;

const clickHereHander = (evt: MouseEvent) => {
  const target = evt.target as HTMLElement;
  const img = target.dataset.img;
  if(!img) {
    return;
  }
  imageE.src = `images/${img}.gif`;
  exampleContainerE.className = 'show';
}

const getLastVersionInView = async () => {
  const tableRect = tableE.getBoundingClientRect();
  const tableY = tableRect.y;
  const firstVersionY = tableY + 42;
  const windowBottom = window.innerHeight + window.scrollY
  const currentMaxVersionIndex = Math.max(0, Math.round((windowBottom - firstVersionY) / tableCellHeight) - 1);
  const currentVersionIndex = Math.min(versionsE.length - 1, currentMaxVersionIndex);
  const versionSeen = versionsE[currentVersionIndex].textContent;
  await saveTheSeenVersion(versionSeen);
}

const saveTheSeenVersion = async (version: string) => {
  // get the current seen version first
  const usage = await storageGetP(STORAGE_AREA.USAGE, DEFAULT_USAGE);
  let { VERSION_SEEN } = usage;
  const currentVersion = chrome.runtime.getManifest().version;
  if (compareVersion(VERSION_SEEN as string, version) < 0) {
    // user has seen a higher or equal version, need to update the version seen
    VERSION_SEEN = version;
    usage.VERSION_SEEN = version;
    await storageSetP(STORAGE_AREA.USAGE, usage);
  }
  if (compareVersion(VERSION_SEEN as string, currentVersion) >= 0) {
    // the version user see >= manifest version, should clear badge
    setBadge('', '#FFFFFF', '#FFFFFF');
  }
};

window.addEventListener('scroll', debounce(async () => {
  await getLastVersionInView();
}, 500));

const releaseNotesText = getI18NMessage(I18Ns, uiLang, 'release_notes');

titleE.textContent = releaseNotesText;
tableHeadsE[0].textContent = getI18NMessage(I18Ns, uiLang, 'version');
tableHeadsE[1].textContent = getI18NMessage(I18Ns, uiLang, 'date');
tableHeadsE[2].textContent = getI18NMessage(I18Ns, uiLang, 'release_what_new');
closeE.title = getI18NMessage(I18Ns, uiLang, 'close');
document.title = releaseNotesText;

await getLastVersionInView();

for(const element of clickHereE){
  element.addEventListener('click', clickHereHander);
}

closeE.addEventListener('click', () => {
  exampleContainerE.className = 'hide';
});

})();
