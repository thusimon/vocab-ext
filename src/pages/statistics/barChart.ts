import * as d3 from "d3";
class BarChart {
  parentElement: any;
  config: any;
  data: any;
  format: any;
  svg: any;
  chart: any;
  scaleX: any;
  scaleY: any;
  axisXCall: any;
  axisYCall: any;
  axisX: any;
  axisY: any;
  title: any;
  chartBgArea: any;
  chartBgLine: any;
  tooltip: any;
  totalLabel: any;
  rects: any;
  customization: any;
  t: any;
  constructor(parentElement, config, data, format) {
    this.parentElement = parentElement;
    this.config = config;
    this.data = data;
    this.format = format;
    this.initVis();
  }

  updateSize() {
    this.config.width = window.innerWidth / 1.1;
    this.config.height = window.innerHeight / 1.2 > 600 ? 600 : window.innerHeight / 1.2;
    this.config.chartHeight = this.config.height - this.config.chartMargin[0] - this.config.chartMargin[2];
    this.config.chartWidth = this.config.width - this.config.chartMargin[1] - this.config.chartMargin[3];
  }

  initVis() {
    const vis = this;
    this.updateSize();
    const {width, height, chartWidth, chartHeight, chartMargin, title, transitionTime, chartBg, tooltipColor} = this.config;

    // create svg canvas
    vis.svg = d3.select(this.parentElement)
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    
    // init chart
    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${chartMargin[3]}, ${chartMargin[0]})`);
    
    // init axises
    vis.scaleX = d3.scaleBand()
      .range([0, chartWidth])
      .padding(0.2);
    vis.scaleY = d3.scaleLinear()
      .range([chartHeight, 0]);
    
    vis.axisXCall = d3.axisBottom(vis.scaleX)
    .tickFormat(d => {
      if (vis.customization && vis.customization.xTickFormat) {
        return vis.customization.xTickFormat(d);
      } else {
        return d;
      }
    });

    vis.axisYCall = d3.axisLeft(vis.scaleY)
    .tickFormat(d => {
      if (vis.customization && vis.customization.yTickFormat) {
        return vis.customization.yTickFormat(d);
      } else {
        return d;
      }
    });

    vis.axisX = vis.chart.append('g')
      .attr("transform", `translate(0, ${chartHeight})`);
    
    vis.axisY = vis.chart.append('g')

    if(title) {
      vis.title = vis.svg.append('text')
      .attr('x', width / 2)           
      .attr('y', chartMargin[0]/2)
      .attr('text-anchor', 'middle')  
      .style('font-size', '30px') 
      .style('font-weight', '600')  
      .text(title);
    }
    
    vis.t = d3.transition().duration(transitionTime || 500);

    vis.customization = {
      xTickFormat: (d) => {
        const date = new Date(d);
        return vis.format === 'year' ? date.getMonth() + 1 : date.getDate();
      },
      xTickValue: (d, i) => d > 0,
      yTickFormat: d => {
        if (d%5 == 0) {
          return d;
        } else {
          return null;
        }
      },
      tooltipMsg: (d) => {
        const date = new Date(d.key);
        const dateStr = vis.format === 'year' ? date.toLocaleString('en-US', { month: 'numeric', year: 'numeric'})
          : date.toLocaleString('en-US', { month: 'numeric', year: 'numeric', day: 'numeric'});
        return `${dateStr}: ${d.value}`
      }
    };
  }

  updateVis(data) {
    this.data = data;
    const vis = this;
    this.updateSize();
    const {width, height, chartWidth, chartHeight, chartMargin, barColor, chartBg, barHoverColor, tooltipColor} = this.config;
    // update scales
    const xExtent = d3.extent(vis.data, (d: any) => d.key);
    const yExtent = d3.extent(vis.data, (d: any) => d.value) as unknown as number[];
    yExtent[1] = yExtent[1] < 5 ? 5 : yExtent[1];
    vis.scaleX.domain(this.data.map(d => d.key));
    vis.scaleY.domain([0, yExtent[1]*1.05]);

    // update axises
    vis.axisXCall.scale(vis.scaleX);
    if (vis.customization && vis.customization.xTickValue) {
      vis.axisXCall.tickValues(vis.scaleX.domain().filter(vis.customization.xTickValue))
    }
    vis.axisX.transition(vis.t).call(vis.axisXCall);
    vis.axisYCall.scale(vis.scaleY);
    vis.axisY.transition(vis.t).call(vis.axisYCall);

    // add background
    vis.chartBgArea = vis.chart.selectAll('.bgArea')
      .data([1])
      .join('rect')
      .attr('class', 'bgArea')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('fill', chartBg);

    // add dashed area on Y axis
    const yTicks = vis.scaleY.ticks();
    yTicks.shift();
    const ydashLines = yTicks.map(y => [[0, y], [chartWidth, y]])
    vis.chartBgLine = vis.chart.selectAll('.y-dash-area')
      .data(ydashLines)
      .join('line')
      .transition(vis.t)
      .attr('class', 'y-dash-area')
      .attr('x1', d=>d[0][0])
      .attr('y1', d=>vis.scaleY(d[0][1]))
      .attr('x2', d=>d[1][0])
      .attr('y2', d=>vis.scaleY(d[1][1]));

    vis.rects = vis.chart.selectAll('.charBar')
      .data(this.data, (d: any)=>d)
      .join(
        enter => enter.append('rect')
          .attr('class', 'charBar')
          .attr('fill', barColor)
          .attr('x', 0)
          .attr('y', chartHeight)
          .attr('width', vis.scaleX.bandwidth())
          .attr('height', 0)
          .on('mouseover', function (evt, d: any) {
            const x = vis.scaleX(d.key)! + vis.scaleX.bandwidth() / 2 - 30;
            const y = vis.scaleY(d.value) - 10;
            d3.select(this).transition()
              .duration(200)
              .style('cursor', 'default')
              .attr('fill', barHoverColor);
            vis.tooltip.text(vis.customization.tooltipMsg(d));
            vis.tooltip.transition()
              .duration(200)
              .attr('x', x)
              .attr('y', y)
              .style('opacity', 1);
          })
          .on('mouseout', function (evt, d) {
            d3.select(this).transition()
              .duration(200)
              .style('cursor', 'default')
              .attr('fill', barColor);
            vis.tooltip.text('');
            vis.tooltip.transition()
              .duration(200)
              .style('opacity', 0);
          })
          .call(rect => rect.transition(vis.t)
            .attr('x', (d: any) => vis.scaleX(d.key) || 0)
            .attr('y', (d: any) => vis.scaleY(d.value))
            .attr('width', vis.scaleX.bandwidth())
            .attr('height', (d: any) => chartHeight - vis.scaleY(d.value))
          ),
      update => update
        .call(rect => rect.transition(vis.t)
          .attr('x', (d: any) => vis.scaleX(d.key) || 0)
          .attr('y', (d: any) => vis.scaleY(d.value))
          .attr('width', vis.scaleX.bandwidth())
          .attr('height', (d: any) => chartHeight - vis.scaleY(d.value))),
      exit => exit
        .call(rect => rect.transition(vis.t)
          .attr('height', 0)
          .attr('y', chartHeight)
          .style('fill-opacity', '0')
          .remove())
    );

    if (!vis.tooltip) {
      vis.tooltip = vis.chart.append("text")
        .attr('id', 'tooltip')
        .style('opacity', 0)
        .style('font-weight', 600)
        .style('fill', tooltipColor)
        .text('');
      vis.tooltip.transition()
      .duration(200);
    }

    if (!vis.totalLabel) {
      const total = vis.data.reduce((accu, curr) => {
        return accu + curr.value;
      }, 0);
      vis.totalLabel = vis.chart.append("text")
        .attr('id', 'total-label')
        .attr('x', chartWidth - 100)
        .attr('y', 30)
        .style('opacity', 1)
        .style('font-weight', 600)
        .style('font-size', '1.5rem')
        .style('fill', tooltipColor)
        .text(`#: ${total}`);
      vis.totalLabel.transition()
      .duration(200);
    }
  }
}

export default BarChart;
