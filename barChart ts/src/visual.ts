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

module powerbi.extensibility.visual {
    "use strict";

    //Contains data imported from Power BI
    interface DataPoint { 
        category: string;
        value: number;
        colour: string;
        identity: powerbi.visuals.ISelectionId;
        highlighted: boolean;
        tooltips: VisualTooltipDataItem[];
    };

    //Provides a layer between the data collection and the data manipulation/display, to allow for editing one without having to change the other
    interface ViewModel { 
        dataPoints: DataPoint[];
        maxValue: number;
        highlights: boolean;
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
                    },
                    scaling: {
                        default: false,
                        value: true
                    }
                }
            },
            border: {
                top: {
                    default: 10,
                    value: 10
                }
            },
            colouring: {
                active: {
                    default: false,
                    value: false
                },
                thresholds: {
                    first: {
                        default: 0,
                        value: 0
                    },
                    second: {
                        default: 0,
                        value: 0
                    }
                },
                colours: {
                    baseColour: {
                        default: "#FD625E",
                        value: "#FD625E"
                    },
                    colour1: {
                        default: "#F2C80F",
                        value: "#F2C80F"
                    },
                    colour2: {
                        default: "#01B8AA",
                        value: "#01B8AA"
                    }
                }
            },
            outliers: {
                removed: {
                    default: false,
                    value: false
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
            let data = this.viewModel.dataPoints;
            let maxValue = this.viewModel.maxValue;
            //Define width and height of the area used for the widget, and the padding created by drawing the axes
            let width = options.viewport.width;
            let height = options.viewport.height;
            let xAxisPadding = this.settings.axis.x.show.value ? this.settings.axis.x.padding.value : 0;
            let yAxisPadding = this.settings.axis.y.show.value ? this.settings.axis.y.padding.value : 0;
            this.svg.attr({
                width: width,
                height: height
            });

            if (this.settings.outliers.removed.value) {//Calculate outliers based on Standard Deviations
                let total = 0;
                let average = 0;
                let deviation = 0;
                for (let i = 0, len = data.length; i < len; i++) {
                    total = total + data[i].value;
                }
                average = total / data.length;
                total = 0;
                for (let i = 0, len = data.length; i < len; i++) {
                    let temp = data[i].value - average;
                    let variance = temp * temp;
                    total = total + variance;
                }
                deviation = total / data.length;
                deviation = Math.sqrt(deviation);
                for (let i = 0, len = data.length; i < len; i++) {
                    if (data[i].value < (average - (deviation)) || data[i].value > (average + (deviation))) {
                        data.splice(i, 1);
                        i--;
                        len--;
                    }
                }
                let max = 0;
                for (let i = 0, len = data.length; i < len; i++) {
                    if (data[i].value > max) {
                        max = data[i].value;
                        maxValue = max;
                    }
                }
            }
            //Define scaling behavious to map chart co-ordinates to screen co-ordinates, and creating axes
            let yScale = d3.scale.linear()
                .domain([0, maxValue])
                .range([height - xAxisPadding, 0 + this.settings.border.top.value]);
            if (this.settings.axis.y.scaling.value) { //If Dynamic Axis Scaling is enabled, calculate how to change the scale
                let min = 0;
                let max = 0;
                let domainmin = 0;
                let diff = 0;
                for (let i = 0, len = data.length; i < len; i++) {
                    if (i == 0) {
                        min = data[i].value
                    }
                    if (data[i].value < min) {
                        min = data[i].value;
                    }
                    if (data[i].value > max) {
                        max = data[i].value;
                    }
                }
                diff = max - min;
                //If Dynamic Scaling is potentially useful (Here defined as all difference between bars being in top 1/3 of graph), apply scale change
                if (diff < (min / 2)) { 
                    domainmin = min - (diff / 2);
                    yScale = d3.scale.linear()
                        .domain([0 + domainmin, maxValue + (diff / 2)])
                        .range([height - xAxisPadding, 0 + this.settings.border.top.value]);
                }
            }
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
                .domain(data.map(d => d.category))
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
            let bars = this.barGroup
                .selectAll(".bar")
                .data(data);
            bars.enter()
                .append("rect")
                .classed("bar", true);
            if (this.settings.colouring.active.value) { //Apply threshold colouring if setting is enabled
                let colour = "#000000"
                for (let i = 0, len = data.length; i < len; i++) {
                    if (data[i].value > this.settings.colouring.thresholds.second.value) {
                        data[i].colour = this.settings.colouring.colours.colour2.value;
                    } else if (data[i].value > this.settings.colouring.thresholds.first.value) {
                        data[i].colour = this.settings.colouring.colours.colour1.value;
                    } else {
                        data[i].colour = this.settings.colouring.colours.baseColour.value;
                    }
                }
            }
            bars
                .attr({
                    width: xScale.rangeBand(),
                    height: d => height - yScale(d.value) - xAxisPadding,
                    y: d => yScale(d.value),
                    x: d => xScale(d.category)
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

        //Update settings to match user-given values
        private updateSettings(options: VisualUpdateOptions) { 
            this.settings.axis.x.show.value = DataViewObjects.getValue(
                options.dataViews[0].metadata.objects, {
                    objectName: "Axes",
                    propertyName: "xShow"
                },
                this.settings.axis.x.show.default);
            this.settings.axis.y.show.value = DataViewObjects.getValue(
                options.dataViews[0].metadata.objects, {
                    objectName: "Axes",
                    propertyName: "yShow"
                },
                this.settings.axis.y.show.default);
            this.settings.axis.y.scaling.value = DataViewObjects.getValue(
                options.dataViews[0].metadata.objects, {
                    objectName: "Axes",
                    propertyName: "scaling"
                },
                this.settings.axis.y.show.default);
            this.settings.colouring.active.value = DataViewObjects.getValue(
                options.dataViews[0].metadata.objects, {
                    objectName: "ColourSettings",
                    propertyName: "show"
                },
                this.settings.colouring.active.default);
            this.settings.colouring.thresholds.first.value = DataViewObjects.getCommonValue(
                options.dataViews[0].metadata.objects, {
                    objectName: "ColourSettings",
                    propertyName: "threshold1"
                },
                this.settings.colouring.thresholds.first.default);
            this.settings.colouring.thresholds.second.value = DataViewObjects.getCommonValue(
                options.dataViews[0].metadata.objects, {
                    objectName: "ColourSettings",
                    propertyName: "threshold2"
                },
                this.settings.colouring.thresholds.second.default);
            this.settings.colouring.colours.baseColour.value = DataViewObjects.getFillColor(
                options.dataViews[0].metadata.objects, {
                    objectName: "ColourSettings",
                    propertyName: "colour0"
                },
                this.settings.colouring.colours.baseColour.default);
            this.settings.colouring.colours.colour1.value = DataViewObjects.getFillColor(
                options.dataViews[0].metadata.objects, {
                    objectName: "ColourSettings",
                    propertyName: "colour1"
                },
                this.settings.colouring.colours.colour1.default);
            this.settings.colouring.colours.colour2.value = DataViewObjects.getFillColor(
                options.dataViews[0].metadata.objects, {
                    objectName: "ColourSettings",
                    propertyName: "colour2"
                },
                this.settings.colouring.colours.colour2.default);
            this.settings.outliers.removed.value = DataViewObjects.getValue(
                options.dataViews[0].metadata.objects, {
                    objectName: "outliers",
                    propertyName: "show"
                },
                this.settings.colouring.active.default);
        }

        //Gets data from Power BI and returns it in a viewModel
        private getViewModel(options: VisualUpdateOptions): ViewModel {

            let dv = options.dataViews;
            //Create empty viewModel to return
            let viewModel: ViewModel = {
                dataPoints: [],
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
            let values = view.values[0];
            let highlights = values.highlights;
            let objects = categories.objects;
            let metadata = dv[0].metadata;
            let categoryColumnName = metadata.columns.filter(c => c.roles["Axis"])[0].displayName;
            let valueColumnName = metadata.columns.filter(c => c.roles["Values"])[0].displayName;

            for (let i = 0, len = Math.max(categories.values.length, values.values.length); i < len; i++) {
                viewModel.dataPoints.push({
                    category: <string>categories.values[i],
                    value: <number>values.values[i],
                    colour: objects && objects[i] && DataViewObjects.getFillColor(objects[i], {
                        objectName: "Colours",
                        propertyName: "fill"
                    }, null) || this.host.colorPalette.getColor(<string>categories.values[i]).value,

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
                        value: (<number>values.values[i]).toFixed(2)
                    }]
                })
            }

            viewModel.maxValue = d3.max(viewModel.dataPoints, d => d.value);
            viewModel.highlights = viewModel.dataPoints.filter(d => d.highlighted).length > 0;

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
                case "Axes":
                    properties.push({
                        objectName: propertyGroupName,
                        properties: {
                            xShow: this.settings.axis.x.show.value,
                            yShow: this.settings.axis.y.show.value,
                            scaling: this.settings.axis.y.scaling.value
                        },
                        selector: null
                    });
                    break;
                case "ColourSettings":
                    properties.push({
                        objectName: propertyGroupName,
                        properties: {
                            show: this.settings.colouring.active.value,
                            colour0: this.settings.colouring.colours.baseColour.value,
                            threshold1: this.settings.colouring.thresholds.first.value,
                            colour1: this.settings.colouring.colours.colour1.value,
                            threshold2: this.settings.colouring.thresholds.second.value,
                            colour2: this.settings.colouring.colours.colour2.value
                        },
                        selector: null
                    });
                    break;
                case "Colours":
                    if (this.viewModel) {
                        for (let dp of this.viewModel.dataPoints) {
                            properties.push({
                                objectName: propertyGroupName,
                                displayName: dp.category,
                                properties: {
                                    fill: dp.colour
                                },
                                selector: dp.identity.getSelector()
                            })
                        }
                    }
                    break;
                case "outliers":
                    properties.push({
                        objectName: propertyGroupName,
                        properties: {
                            show: this.settings.outliers.removed.value
                        },
                        selector: null
                    });
                    break;
            };

            return properties;
        }
    }
}