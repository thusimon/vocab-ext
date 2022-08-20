(async () => {

const settings = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
const {TARGET_LANG} = settings;

const controllerE = document.getElementById('statistics-controller');
const chartE = document.getElementById('statistics-charts');

const chartTitle = getI18NMessage(TARGET_LANG, 'stat_vocab_add_header');
const dataOptionWeekE = document.getElementById('data-source-option-week');
const dataOptionMonthE = document.getElementById('data-source-option-month');
const dataOptionQuarterE = document.getElementById('data-source-option-quarter');
const dataOptionYearE = document.getElementById('data-source-option-year');
const dataOptionAllE = document.getElementById('data-source-option-all');


dataOptionWeekE.text = getI18NMessage(TARGET_LANG, 'stat_this_week');
dataOptionMonthE.text = getI18NMessage(TARGET_LANG, 'stat_this_month');
dataOptionQuarterE.text = getI18NMessage(TARGET_LANG, 'stat_this_quarter');
dataOptionYearE.text = getI18NMessage(TARGET_LANG, 'stat_this_year');
dataOptionAllE.text = getI18NMessage(TARGET_LANG, 'stat_all_data');

const ONE_DAY_MS = 24*3600*1000;

const getDayTime = (ms) => {
  const date = new Date(ms);
  date.setHours(0,0,0,0);
  return date.getTime();
}

const getCountTimeStat = (vocab) => {
  const stat = {};
  for (let key in vocab) {
    const vocabDay = getDayTime(vocab[key].createdTime);
    stat[vocabDay] = (stat[vocabDay] || 0) + 1;
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

  return statArr;
}

const getWeekData = (data) => {
  const currentDay = new Date();
  const currWeekDay = currentDay.getDay() + 1;
  const weekData = data.slice(-currWeekDay);
  const emptyDataToAppend = new Array(7-currWeekDay).map((d, i) => {
    const nextDay = new Date(currentDay);
    nextDay.setHours(0,0,0,0);
    const currentDate = currentDay.getDate();
    nextDay.setDate(currentDate + i);
    return {day: nextDay.getTime(), count: 0}
  });
  return weekData.concat(emptyDataToAppend);
}

const getMonthData = (data) => {
  return data;
}

const getQuarterData = (data) => {
  return data;
}

const getYearData = (data) => {
  return data;
}

const getDataByTimeRange = (timeRange) => {
  const countTimeStat = getCountTimeStat(vocab);
  countTimeStat.sort((v1, v2) => v1.key - v2.key);
  switch (timeRange) {
    case 'week':
      return getWeekData(countTimeStat)
    case 'month':
      return getMonthData(countTimeStat)
    case 'quarter':
      return getQuarterData(countTimeStat)
    case 'year':
      return getYearData(countTimeStat)
    case 'all':
    default:
      return countTimeStat;
  }
}
const dataSelectionE = document.getElementById('data-source-select');
dataSelectionE.addEventListener('change', (evt) => {
  const dataToDraw = getDataByTimeRange(evt.target.value);
  updateConfig();
  updateChart(dataToDraw, chartCaption);
})

const setting = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
const vocabAll = await storageGetP(STORAGE_AREA.VOCAB, {});
const langKeySetting = `${setting.SOURCE_LANG}-${setting.TARGET_LANG}`;
const vocab = vocabAll[langKeySetting] || {};

const config = {
  width: 1000,
  height: 850,
  chartMargin: [50, 30, 30, 30],
  chartBg: 'lightyellow',
  chartWidth: 1000,
  chartHeight: 850,
  barColor: '#1034a6',
  barHoverColor: '#0080ff',
  tooltipColor: 'green',
  title: chartTitle
}

const dataToDraw = getDataByTimeRange('all');

const customization = {
  xTickFormat: (d) => {
    const date = new Date(d);
    return `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;
  },
  xTickValue: (d, i) => !(i%7),
  yTickFormat: d => {
    if (d%5 == 0) {
      return d;
    } else {
      return null;
    }
  }
}
const barChart = new BarChart('#statistics-charts', config, [], customization);
barChart.updateVis(dataToDraw);

})();
