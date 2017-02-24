import * as d3 from 'd3';

export default class BarChart {
    constructor(element, model) {

        this.model = model;
        
        const margin = { top: 10, right: 20, bottom: 60, left: 40 };
        this.width = element.offsetWidth - margin.left - margin.right;
        this.height = element.offsetHeight - margin.top - margin.bottom;

        this.svg = d3.select(element)
            .append('svg')
                .attr('width', this.width + margin.left + margin.right)
                .attr('height', this.height + margin.top + margin.bottom)
            .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        this.setAxis();

    }

    setData(data) {
        
        const dataPages = data.qHyperCube.qDataPages[0].qMatrix;

        // Map over data, return the textual value of the first column (i.e our dimension).
        this.x.domain(dataPages.map((d) => d[0].qText));

        // Qlik Sense gives you min and max values for calculations.
        this.y.domain([0, data.qHyperCube.qMeasureInfo[0].qMax * 1.05]);

        let bar = this.svg.selectAll('.bar').data(dataPages, (d) => d[0].qElemNumber)

        // D3 Exit selections - Remove bar.
        bar.exit().remove();

        bar.enter().append('rect')
            .attr('class', 'bar')
            .attr('id', (d) => d[0].qElemNumber)
            .attr('x', (d) => this.x(d[0].qText))
            .attr('width', this.x.bandwidth())
            .attr('y', this.height)
            .attr('height', 0)
            .merge(bar)
            .transition(750)
            .attr('y', (d) => this.y(d[1].qNum))
            .attr('height', (d) => this.height - this.y(d[1].qNum))
            .style('fill', 'green')
                        
            // Transition axies.
            d3.transition(this.svg).select(".x.axis").call(this.xAxis);
            d3.transition(this.svg).select(".y.axis").call(this.yAxis);

    }

    setAxis() {
        
        this.x = d3.scaleBand()
            .rangeRound([0,  this.width], .1)
            .paddingInner(0.1)
            .paddingOuter(0.2);
        
        this.y = d3.scaleLinear()
            .range([this.height, 0]);

        this.xAxis = d3.axisBottom().scale(this.x);
        this.yAxis = d3.axisLeft().scale(this.y)

        this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(this.xAxis);

        this.svg.append("g")
            .attr("class", "y axis")
            .call(this.yAxis);

    }
}