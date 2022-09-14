import * as d3 from 'd3';

class BarChart {
  parentElement: any;
  config: any;
  data: any;
  customization: any;
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  chart: d3.Selection<SVGGElement, unknown, null, undefined>;
  scaleX: any;
  scaleY: any;
  title: d3.Selection<SVGTextElement, unknown, null, undefined>;
  t: d3.Transition<d3.BaseType, unknown, null, undefined>;
  axisXCall: d3.Axis<d3.AxisDomain>;
  axisYCall: d3.Axis<d3.AxisDomain>;
  axisX: d3.Selection<SVGGElement, unknown, null, undefined>;
  axisY: any;
  chartBgArea: d3.Selection<d3.BaseType | SVGRectElement, number, SVGGElement, unknown>;
  chartBgLine: d3.Transition<d3.BaseType | SVGLineElement, unknown, SVGGElement, unknown>;
  tooltip: any;
  rects: d3.Selection<d3.BaseType | SVGRectElement, unknown, SVGGElement, unknown>;
  constructor(parentElement, config, data, customization) {
    this.parentElement = parentElement;
    this.config = config;
    this.data = data;
    this.customization = customization;
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
    const {width, height, chartWidth, chartHeight, chartMargin, title, transition, chartBg, tooltipColor} = this.config;

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
      if (this.customization && this.customization.xTickFormat) {
        return this.customization.xTickFormat(d);
      } else {
        return d;
      }
    });

    vis.axisYCall = d3.axisLeft(vis.scaleY)
    .tickFormat(d => {
      if (this.customization && this.customization.yTickFormat) {
        return this.customization.yTickFormat(d);
      } else {
        return d;
      }
    });

    vis.axisX = vis.chart.append('g')
      .attr("transform", `translate(0, ${chartHeight})`);
    
    vis.axisX = vis.chart.append('g')

    vis.title = vis.svg.append('text')
      .attr('x', width / 2)           
      .attr('y', chartMargin[0]/2)
      .attr('text-anchor', 'middle')  
      .style('font-size', '30px') 
      .style('font-weight', '600')  
      .text(title);

    vis.t = d3.transition().duration(transition || 500);
  }

  updateVis(data) {
    this.data = data;
    const vis = this;
    this.updateSize();
    const {width, height, chartWidth, chartHeight, chartMargin, barColor, chartBg, barHoverColor, tooltipColor} = this.config;
    // update scales
    const xExtent = d3.extent(vis.data, (d: {key: string}) => d.key);
    const yExtent = d3.extent(vis.data, (d: {value: number}) => d.value);
    yExtent[1] = yExtent[1]! < 5 ? 5 : yExtent[1];
    vis.scaleX.domain(this.data.map(d => d.key));
    vis.scaleY.domain([0, yExtent[1]! * 1.05]);

    // update axises
    vis.axisXCall.scale(vis.scaleX);
    if (this.customization && this.customization.xTickValue) {
      vis.axisXCall.tickValues(vis.scaleX.domain().filter(this.customization.xTickValue))
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
      .attr('x1', (d: any)=>d[0][0])
      .attr('y1', (d: any)=>vis.scaleY(d[0][1]))
      .attr('x2', (d: any)=>d[1][0])
      .attr('y2', (d: any)=>vis.scaleY(d[1][1]));

    if (!vis.tooltip) {
      vis.tooltip = vis.chart.append("text")
        .attr('id', 'tooltip')
        .style('opacity', 0)
        .style('font-weight', 600)
        .style('fill', tooltipColor)
        .text("");
      vis.tooltip.transition()
      .duration(200);
    }

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
          .on('mouseover', function (evt, data) {
            const d = data as {key: string, value: number};
            const date = new Date(d.key);
            const msg = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}: ${d.value}`;
            const x = vis.scaleX(d.key)-40;
            const y = vis.scaleY(d.value) - 10;
            d3.select(this).transition()
              .duration(200)
              .style('cursor', 'pointer')
              .attr('fill', barHoverColor);
            vis.tooltip.text(msg);
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
            .attr('x', (d: any) => vis.scaleX(d.key))
            .attr('y', (d: any) => vis.scaleY(d.value))
            .attr('width', vis.scaleX.bandwidth())
            .attr('height', (d: any) => chartHeight - vis.scaleY(d.value))
          ),
      update => update
        .call(rect => rect.transition(vis.t)
          .attr('x', (d: any) => vis.scaleX(d.key))
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
  }
}

export default BarChart;
