(async () => {

const controllerE = document.getElementById('statistics-controller');
const chartE = document.getElementById('statistics-charts');

const chartCaption = chrome.i18n.getMessage('stat_vocab_add_header');
const dataOptionWeekE = document.getElementById('data-source-option-week');
const dataOptionMonthE = document.getElementById('data-source-option-month');
const dataOptionQuarterE = document.getElementById('data-source-option-quarter');
const dataOptionYearE = document.getElementById('data-source-option-year');
const dataOptionAllE = document.getElementById('data-source-option-all');


dataOptionWeekE.text = chrome.i18n.getMessage('this_week');
dataOptionMonthE.text = chrome.i18n.getMessage('this_month');
dataOptionQuarterE.text = chrome.i18n.getMessage('this_quarter');
dataOptionYearE.text = chrome.i18n.getMessage('this_year');
dataOptionAllE.text = chrome.i18n.getMessage('all_data');

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
  const statArr = Object.keys(stat).map(d=>+d).map((dayTime) => {
    return {day: dayTime, count: stat[dayTime]}
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
  countTimeStat.sort((v1, v2) => v1.day - v2.day);
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
  chargBg: 'lightyellow',
  chartWidth: 1000,
  chartHeight: 850,
  barColor: '#1034a6',
  barHoverColor: '#0080ff',
  tooltipColor: 'green'
}

const updateConfig = () => {
  config.width = window.innerWidth / 1.1;
  config.height = window.innerHeight / 1.2 > 600 ? 600 : window.innerHeight / 1.2;
  config.chartHeight = config.height - config.chartMargin[0] - config.chartMargin[2];
  config.chartWidth = config.width - config.chartMargin[1] - config.chartMargin[3];
}

updateConfig();

const svg = d3.select('#statistics-charts')
  .append('svg')
  .attr('width', config.width)
  .attr('height', config.height);

const updateChart = (data, chartCaption, extendXRange) => {
  const barWidth = config.chartWidth/data.length / 1.2;

  const xExtent = d3.extent(data, d => d.day);
  // extend one day to both left and right
  const yExtent = d3.extent(data, d => d.count);

  if (extendXRange) {
    xExtent[0] -= ONE_DAY_MS;
    xExtent[1] += ONE_DAY_MS
  }

  if (yExtent[1] == 0) {
    yExtent[1] = 10;
  }

  const scaleX = d3.scaleBand()
    .domain(data.map(d => d.day))
    .range([0, config.chartWidth]);
  
  const scaleXLinear = d3.scaleLinear()
    .domain([xExtent[0], xExtent[1]])
    .range([0, config.chartWidth]);

  const scaleY = d3.scaleLinear()
    .domain([yExtent[0], yExtent[1]*1.05])
    .range([config.chartHeight, 0]);

  const x_axis = d3.axisBottom()
    .scale(scaleX)
    .tickValues(scaleX.domain().filter(function(d,i){ return !(i%10)}))
    .tickFormat(d => {
      const date = new Date(d);
      return `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;
    });

  const y_axis = d3.axisLeft()
    .scale(scaleY);
  
  const yTicks = scaleY.ticks();
  yTicks.shift();

  const chart = svg.append("g")
    .attr('transform', `translate(${config.chartMargin[3]}, ${config.chartMargin[0]})`)

  const backgroundRect = chart.append('rect')
    .attr('width', config.chartWidth)
    .attr('height', config.chartHeight)
    .attr('fill', config.chargBg)
    .attr('opacity', 0.5);

  // add dashed area on Y axis
  const ydashLines = yTicks.map(y => [[xExtent[0], y], [xExtent[1], y]])
  const dashedAreaLines = chart.selectAll('.y-dash-area')
    .data(ydashLines)
    .enter()
    .append('line')
    .attr('x1', d=>scaleXLinear(d[0][0]))
    .attr('y1', d=>scaleY(d[0][1]))
    .attr('x2', d=>scaleXLinear(d[1][0]))
    .attr('y2', d=>scaleY(d[1][1]))
    .attr('class', 'y-dash-area');

  const tooltip = chart.append("text")
    .attr('id', 'tooltip')
    .style('opacity', 1)
    .style('font-weight', 600)
    .style('fill', config.tooltipColor)
    .text("");

  const rects = chart.selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', (d) => scaleX(d.day) - barWidth/2)
    .attr('y', config.chartHeight)
    .attr('width', barWidth)
    .attr('height', 0)
    .attr('fill', config.barColor)
    .on('mouseover', function (evt, d) {
      const date = new Date(d.day);
      const msg = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}: ${d.count}`;
      const x = scaleXLinear(d.day)-40;
      const y = scaleY(d.count) - 10;
      d3.select(this).transition()
        .duration(100)
        .attr('fill', config.barHoverColor);
      d3.selectAll('#tooltip').transition()
        .duration(200)
        .text(msg)
        .attr('x', x)
        .attr('y', y)
        .style('opacity', 1)
    })
    .on('mouseout', function (evt, d) {
      d3.select(this).transition()
        .duration(100)
        .attr('fill', config.barColor);
      d3.selectAll('#tooltip').transition()
        .duration(200)
        .text('')
        .style('opacity', 0)
    });

  svg.append('g')
    .attr("transform", `translate(${config.chartMargin[3]}, ${config.chartMargin[0]})`)
    .call(y_axis);

  svg.append('g')
    .attr("transform", `translate(${config.chartMargin[3]}, ${config.chartHeight + config.chartMargin[0]})`)
    .call(x_axis);

  svg.append('text')
    .attr('x', config.width / 2)           
    .attr('y', config.chartMargin[0]/2)
    .attr('text-anchor', 'middle')  
    .style('font-size', '30px') 
    .style('font-weight', '600')  
    .text(chartCaption);

  rects.transition()
    .duration(750)
    .attr('x', (d) => scaleX(d.day) - barWidth/2)
    .attr('y', (d) => scaleY(d.count))
    .attr('width', barWidth)
    .attr('height', (d) => config.chartHeight - scaleY(d.count));
}

const dataToDraw = getDataByTimeRange('all');
updateChart(dataToDraw, chartCaption);

})();
