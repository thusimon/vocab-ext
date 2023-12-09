import {
  STORAGE_AREA, DEFAULT_SETTING
} from '../../common/constants';
import {
  storageGetP, getI18NMessage
} from '../../common/utils';
import BarChart from './barChart';

(async () => {
const settings = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
const { TARGET_LANG, UI_LANG, UI_TAREGT_LANG_SAME } = settings;
const uiLang = UI_TAREGT_LANG_SAME ? TARGET_LANG : UI_LANG;

let I18Ns: {[key: string]: any};
// due to service-worker inactive after 5min, use try catch to make sure the data is obtained
try {
  I18Ns = await chrome.runtime.sendMessage({type: 'getI18NStrings'});
} catch(e) {
  I18Ns = await chrome.runtime.sendMessage({type: 'getI18NStrings'});
}

const titleE = document.getElementById('statistics-title');
const controllerE = document.getElementById('statistics-controller');
const chartE = document.getElementById('statistics-charts');
const yearLabelE = document.getElementById('data-source-year-label');
const yearSelectE = document.getElementById('data-source-year');
const monthLabelE = document.getElementById('data-source-month-label')
const monthSelectE = document.getElementById('data-source-month');
const emptyMessageE = document.getElementById('statistics-empty');

titleE.textContent = getI18NMessage(I18Ns, uiLang, 'stat_vocab_add_header');
yearLabelE.textContent = getI18NMessage(I18Ns, uiLang, 'stat_year');
monthLabelE.textContent = getI18NMessage(I18Ns, uiLang, 'stat_month');
emptyMessageE.textContent = getI18NMessage(I18Ns, uiLang, 'newtab_no_vocab_msg');
document.title = getI18NMessage(I18Ns, uiLang, 'stat_title');

const getDayTime = (ms) => {
  const date = new Date(ms);
  date.setHours(0,0,0,0);
  return date.getTime();
};

const getCountTimeStat = (vocab) => {
  const stat = {};
  for (let key in vocab) {
    if (vocab[key].createdTime) {
      const vocabDay = getDayTime(vocab[key].createdTime);
      stat[vocabDay] = (stat[vocabDay] || 0) + 1;
    }
  }

  // add other days if there no record
  const today = getDayTime(Date.now());

  let currentDay = Math.min(...Object.keys(stat).map(d=>+d));
  while(currentDay <= today) {
    if (!stat[currentDay]) {
      stat[currentDay] = 0;
    }
    const currentDayDate = new Date(currentDay);
    currentDayDate.setDate(currentDayDate.getDate()+1);
    currentDay = currentDayDate.getTime();
  }
  // convert stat to array
  const statArr = Object.keys(stat).map((dayTime) => {
    return {key: +dayTime, value: stat[dayTime]}
  });

  statArr.sort((v1, v2) => v1.key - v2.key);

  return statArr;
};

const getYearData = (data, year) => {
  const yearStart = new Date(year, 0, 1, 0, 0, 0, 0).getTime();
  const yearEnd = new Date(year + 1, 0, 1, 0, 0, 0, 0).getTime();
  const yearData = data.filter(d => {
    const date = +d.key;
    return date > yearStart && date < yearEnd;
  });
  // group yearData to months
  const yearDataObj = {};
  for(let m = 0; m < 12; m++) {
    const mDate = new Date(year, m, 1, 0, 0, 0, 0).getTime();
    yearDataObj[mDate] = 0;
  }
  yearData.forEach(d => {
    const date = new Date(+d.key)
    const mDate = new Date(year, date.getMonth(), 1, 0, 0, 0, 0).getTime();
    yearDataObj[mDate] += d.value
  });
  // convert stat to array
  return Object.keys(yearDataObj).map((dayTime) => {
    return {key: +dayTime, value: yearDataObj[dayTime]}
  });
};

const getYearMonthData = (data, year, month) => {
  const yearMonthStart = new Date(year, month, 1, 0, 0, 0, 0).getTime();
  const yearMonthEnd = new Date(year, month + 1, 1, 0, 0, 0, 0).getTime();
  return data.filter(d => {
    const date = +d.key;
    return date > yearMonthStart && date < yearMonthEnd;
  });
};

const updateDataTimeRange = () => {
  const year = parseInt((yearSelectE as HTMLSelectElement).value);
  const month = parseInt((monthSelectE as HTMLSelectElement).value);
  let dataToDraw = [];
  let format = 'year';
  if (!Number.isInteger(year) || year <= 0) {
    dataToDraw = []
  } else {
    if (!Number.isInteger(month) || month < 0) {
      // get data for all year
      dataToDraw = getYearData(countTimeStat, year);
    } else {
      // get data for year + month
      dataToDraw = getYearMonthData(countTimeStat, year, month);
      format = 'month';
    }
  }

  drawChart(dataToDraw, format); 
}

const createDataSourceOptions = (allData) => {
  // get the earliest date
  const firstEntry = allData[0];
  const firstYear = new Date(firstEntry.key).getFullYear();
  const todayYear = new Date().getFullYear();
  for (let year = firstYear; year <= todayYear; year++) {
    const option = document.createElement('option');
    option.value = `${year}`;
    option.textContent = `${year}`;
    option.selected = year === todayYear;
    yearSelectE.append(option)
  }
  yearSelectE.addEventListener('change', (evt) => {
    const target = evt.target as HTMLSelectElement;
    if (!target || !target.value) {
      return;
    }
    updateDataTimeRange();
  });
  monthSelectE.addEventListener('change', (evt) => {
    const target = evt.target as HTMLSelectElement;
    if (!target || !target.value) {
      return;
    }
    updateDataTimeRange();
  })
};

const drawChart = (data, format) => {
  while (chartE.lastChild) {
    chartE.removeChild(chartE.lastChild);
  }

  const config = {
    width: 1000,
    height: 850,
    chartMargin: [0, 30, 30, 30],
    chartBg: 'lightyellow',
    chartWidth: 1000,
    chartHeight: 850,
    barColor: '#1034a6',
    barHoverColor: '#0080ff',
    transitionTime: 250,
    tooltipColor: '#ff7b25',
    title: null
  }

  const barChart = new BarChart('#statistics-charts', config, [], format);
  barChart.updateVis(data);
}

const setting = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
const vocabAll = await storageGetP(STORAGE_AREA.VOCAB, {});
const langKeySetting = `${setting.SOURCE_LANG}-${setting.TARGET_LANG}`;
const vocab = vocabAll[langKeySetting] || {};
const countTimeStat = getCountTimeStat(vocab);

if (countTimeStat && countTimeStat.length > 0) {
  emptyMessageE.style.display = 'none';
  controllerE.style.display = 'block';
  createDataSourceOptions(countTimeStat);
  updateDataTimeRange();
} else {
  emptyMessageE.style.display = 'block';
  controllerE.style.display = 'none';
}

})();
