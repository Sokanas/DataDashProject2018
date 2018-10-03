/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

import DataViewObjects = powerbi.extensibility.utils.dataview.DataViewObjects;

module powerbi.extensibility.visual.barChartBBB7DBA9A1C741B7A4FE47AD4699A7BA  {
    "use strict";

    interface DataPoint {
        category: string;
        value: number;
        colour: string;
        identity: powerbi.visuals.ISelectionId;
        highlighted: boolean;
        tooltips: VisualTooltipDataItem[];
    };

    interface DataSeries {
        dataPoints: DataPoint[];
        colours: string;
        identity: powerbi.visuals.ISelectionId;
        name: string;
    }

    interface ViewModel {
        dataSeries: DataSeries[];
        maxValue: number;
        highlights: boolean
    };

    export class Visual implements IVisual {
        private host: IVisualHost;
        private svg: d3.Selection<SVGElement>;
        private barGroup: d3.Selection<SVGElement>;
        private xPadding = 0.1
        private selectionManager: ISelectionManager;
        private xAxisGroup: d3.Selection<SVGElement>;
        private yAxisGroup: d3.Selection<SVGElement>;
        private viewModel: ViewModel;

        private settings = {
            axis: {
                x: {
                    padding: {
                        default: 50,
                        value: 50
                    },
                    show: {
                        default: true,
                        value: true
                    }
                },
                y: {
                    padding: {
                        default: 50,
                        value: 50
                    },
                    show: {
                        default: true,
                        value: true
                    }
                }
            },
            border: {
                top: {
                    default: 10,
                    value: 10
                }
            }
        }

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.svg = d3.select(options.element)
                .append("svg")
                .classed("barChart", true);
            this.barGroup = this.svg.append("g")
                .classed("bar-group", true);
            this.xAxisGroup = this.svg.append("g")
                .classed("x-axis", true);
            this.yAxisGroup = this.svg.append("g")
                .classed("y-axis", true);
            this.selectionManager = this.host.createSelectionManager();
        }

        public update(options: VisualUpdateOptions) {

            this.updateSettings(options);

            //Get data from viewModel
            this.viewModel = this.getViewModel(options);

            let width = options.viewport.width;
            let height = options.viewport.height;
            let xAxisPadding = this.settings.axis.x.show.value ? this.settings.axis.x.padding.value : 0;
            let yAxisPadding = this.settings.axis.y.show.value ? this.settings.axis.y.padding.value : 0;
            this.svg.attr({
                width: width,
                height: height
            });

            //Define scaling behavious to map chart co-ordinates to screen co-ordinates, and creating axes
            let yScale = d3.scale.linear()
                .domain([0, this.viewModel.maxValue])
                .range([height - xAxisPadding, 0 + this.settings.border.top.value]);
            let yAxis = d3.svg.axis()
                .scale(yScale)
                .orient("left")
                .tickSize(1);
            this.yAxisGroup
                .call(yAxis)
                .attr({
                    transform: "translate(" + yAxisPadding + ",0)"
                })
                .style({
                    fill: "#777777"
                })
                .selectAll("text")
                .style({
                    "text-anchor": "end",
                    "font-size": "x-small"
                });
            let xScale = d3.scale.ordinal()
                .domain(this.viewModel.dataSeries[0].dataPoints.map(d => d.category)) //Fix this to iterate through things
                .rangeRoundBands([yAxisPadding, width], this.xPadding);
            let xAxis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom")
                .tickSize(1);
            this.xAxisGroup
                .call(xAxis)
                .attr({
                    transform: "translate(0, " + (height - xAxisPadding) + ")"
                })
                .style({
                    fill: "#777777"
                })
                .selectAll("text")
                .attr({
                    transform: "rotate(-35)"
                })
                .style({
                    "text-anchor": "end",
                    "font-size": "x-small"
                });
            //Create Bars
            for (let i = 0, len = this.viewModel.dataSeries.length; i < len; i++) {
                let bars = this.barGroup
                    .selectAll(".bar")
                    .data(this.viewModel.dataSeries[i].dataPoints);
                bars.enter()
                    .append("rect")
                    .classed("bar", true);
                bars
                    .attr({
                        width: xScale.rangeBand() / len,
                        height: d => height - yScale(d.value) - xAxisPadding,
                        y: d => yScale(d.value),
                        x: d => xScale(d.category) + (xScale.rangeBand() / len)*i
                    })
                    .style({
                        fill: d => d.colour,
                        "fill-opacity": d => this.viewModel.highlights ? d.highlighted ? 1.0 : 0.5 : 1.0
                    })
                    .on("click", (d) => {
                        this.selectionManager.select(d.identity, true)
                            .then(ids => {
                                bars.style({
                                    "fill-opacity": ids.length > 0 ?
                                        d => ids.indexOf(d.identity) >= 0 ? 1.0 : 0.5
                                        : 1.0
                                })
                            })
                    })
                    .on("mouseover", (d) => {
                        let mouse = d3.mouse(this.svg.node());
                        let x = mouse[0];
                        let y = mouse[1];

                        this.host.tooltipService.show({
                            dataItems: d.tooltips,
                            identities: [d.identity],
                            coordinates: [x, y],
                            isTouchEvent: false
                        });
                    });

                bars.exit()
                    .remove();

            }
        }

        private updateSettings(options: VisualUpdateOptions) {
            this.settings.axis.x.show.value = DataViewObjects.getValue(
                options.dataViews[0].metadata.objects, {
                    objectName: "xAxis",
                    propertyName: "show"
                },
                this.settings.axis.x.show.default);
            this.settings.axis.y.show.value = DataViewObjects.getValue(
                options.dataViews[0].metadata.objects, {
                    objectName: "yAxis",
                    propertyName: "show"
                },
                this.settings.axis.y.show.default);
        }

        //Gets data from Power BI and returns it in a viewModel
        private getViewModel(options: VisualUpdateOptions): ViewModel {

            let dv = options.dataViews;
            //Create empty viewModel to return
            let viewModel: ViewModel = {
                dataSeries: [],
                maxValue: 0,
                highlights: false
            };
            //Check that data has been provided
            if (!dv
                || !dv[0]
                || !dv[0].categorical
                || !dv[0].categorical.categories
                || !dv[0].categorical.categories[0].source
                || !dv[0].categorical.values)
                return viewModel;

            let view = dv[0].categorical;
            let categories = view.categories[0];
            let values = view.values;
            let objects = categories.objects;
            let metadata = dv[0].metadata;
            let categoryColumnName = metadata.columns.filter(c => c.roles["Axis"])[0].displayName;
            for (let j = 0, len = Math.max(view.categories.length, values.length); j < len; j++) {
                let highlights = values[j].highlights;
                let valueColumnName = metadata.columns.filter(c => c.roles["Values"])[j].displayName;

                viewModel.dataSeries[j] = {
                    dataPoints: [],
                    colours: objects && objects[j] && DataViewObjects.getFillColor(objects[j], {
                        objectName: "Colours",
                        propertyName: "fill"
                    }, null) || this.host.colorPalette.getColor(<string>categories.values[j]).value,
                    identity: this.host.createSelectionIdBuilder()
                        .withCategory(categories, j)
                        .createSelectionId(),
                    name: <string>valueColumnName
                }

                for (let i = 0, len = Math.max(categories.values.length, values[j].values.length); i < len; i++) {
                    viewModel.dataSeries[j].dataPoints.push({
                        category: <string>categories.values[i],
                        value: <number>values[j].values[i],
                        colour: viewModel.dataSeries[j].colours,

                        identity: this.host.createSelectionIdBuilder()
                            .withCategory(categories, i)
                            .createSelectionId(),
                        highlighted: highlights ? highlights[i] ? true : false : false,

                        tooltips: [{
                            displayName: categoryColumnName,
                            value: <string>categories.values[i]
                        },
                        {
                            displayName: valueColumnName,
                            value: (<number>values[j].values[i]).toFixed(2)
                        }]
                    })
                }

                viewModel.maxValue = d3.max(viewModel.dataSeries[j].dataPoints, d => d.value);
                viewModel.highlights = viewModel.dataSeries[j].dataPoints.filter(d => d.highlighted).length > 0;

            }


            return viewModel;
        }

        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        /** 
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the 
         * objects and properties you want to expose to the users in the property pane.
         * 
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            let propertyGroupName = options.objectName;
            let properties: VisualObjectInstance[] = [];

            switch (propertyGroupName) {
                case "xAxis":
                    properties.push({
                        objectName: propertyGroupName,
                        properties: {
                            show: this.settings.axis.x.show.value
                        },
                        selector: null
                    });
                    break;
                case "yAxis":
                    properties.push({
                        objectName: propertyGroupName,
                        properties: {
                            show: this.settings.axis.y.show.value
                        },
                        selector: null
                    });
                    break;
                case "Colours":
                    if (this.viewModel) {
                        for (let dp of this.viewModel.dataSeries) {
                            properties.push({
                                objectName: propertyGroupName,
                                displayName: dp.name,
                                properties: {
                                    fill: dp.colours
                                },
                                selector: dp.identity.getSelector()
                            })
                        }
                    }
                    break;
            };

            return properties;
        }
    }
}