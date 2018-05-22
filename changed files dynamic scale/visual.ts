/*
 *  Power BI Visualizations
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

module powerbi.extensibility.visual {
    import ClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.ClassAndSelector;
    import createClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.createClassAndSelector;
    import DataViewObjectPropertyTypeDescriptor = powerbi.DataViewPropertyValue;
    import SelectableDataPoint = powerbi.extensibility.utils.interactivity.SelectableDataPoint;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import IInteractivityService = powerbi.extensibility.utils.interactivity.IInteractivityService;
    import IMargin = powerbi.extensibility.utils.chart.axis.IMargin;
    import IInteractiveBehavior = powerbi.extensibility.utils.interactivity.IInteractiveBehavior;
    import ISelectionHandler = powerbi.extensibility.utils.interactivity.ISelectionHandler;
    import appendClearCatcher = powerbi.extensibility.utils.interactivity.appendClearCatcher;
    import createInteractivityService = powerbi.extensibility.utils.interactivity.createInteractivityService;
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import IAxisProperties = powerbi.extensibility.utils.chart.axis.IAxisProperties;
    import IVisualHost = powerbi.extensibility.visual.IVisualHost;
    import SVGUtil = powerbi.extensibility.utils.svg;
    import AxisHelper = powerbi.extensibility.utils.chart.axis;
    import TextMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    import IColorPalette = powerbi.extensibility.IColorPalette;
    import valueType = utils.type.ValueType;
    import DataViewObjectsParser = utils.dataview.DataViewObjectsParser;
    import PrimitiveValue = powerbi.PrimitiveValue;

    // powerbi.extensibility.utils.type
    import convertToPx = powerbi.extensibility.utils.type.PixelConverter.toString;
    import convertToPt = powerbi.extensibility.utils.type.PixelConverter.fromPoint;
    import fromPointToPixel = powerbi.extensibility.utils.type.PixelConverter.fromPointToPixel;

    // powerbi.extensibility.utils.chart
    import axisScale = powerbi.extensibility.utils.chart.axis.scale;

    // powerbi.extensibility.utils.tooltip
    import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;
    import ITooltipServiceWrapper = powerbi.extensibility.utils.tooltip.ITooltipServiceWrapper;
    import createTooltipServiceWrapper = powerbi.extensibility.utils.tooltip.createTooltipServiceWrapper;

    export interface LineChartDataRoles<T> {
        Date?: T;
        Values?: T;
    }

    export class LineChart implements IVisual {
        private static Identity: ClassAndSelector = createClassAndSelector("LineChart");
        private static Axes: ClassAndSelector = createClassAndSelector("axes");
        private static Axis: ClassAndSelector = createClassAndSelector("axis");
        private static Legends: ClassAndSelector = createClassAndSelector("legends");
        private static Legend: ClassAndSelector = createClassAndSelector("legend");
        private static Line: ClassAndSelector = createClassAndSelector("line");
        private static LegendSize: number = 50;
        private static AxisSize: number = 30;

        private static defaultSettingsRange: LineChartDefaultSettingsRange = {
            dotSize: {
                min: 0,
                max: 100
            },
            lineThickness: {
                min: 0,
                max: 50,
            }/*,
            animationDuration: {
                min: 0,
                max: 1000,
            }*/
        };

        private root: d3.Selection<any>;
        private main: d3.Selection<any>;
        private axes: d3.Selection<any>;
        private scale;
        private axisX: d3.Selection<any>;
        private axisY: d3.Selection<any>;
        private axisY2: d3.Selection<any>;
        private legends: d3.Selection<any>;
        private line: d3.Selection<any>;
        private colors: IColorPalette;
        private xAxisProperties: IAxisProperties;
        private yAxisProperties: IAxisProperties;
        private yAxis2Properties: IAxisProperties;
        private layout: VisualLayout;
        private interactivityService: IInteractivityService;
        private behavior: IInteractiveBehavior;
        private hostService: IVisualHost;
        private localizationManager: ILocalizationManager;

        /**
         *  ENABLE OF DISABLE DEBG OUTPUT (TEXT) FROM BELOW
         * 
         * 
         * 
        */
        


        private static debugMode: boolean = false;
        private static target: HTMLElement;

        public data: LineChartViewModel;

        private get settings(): LineChartSettings {
            return this.data && this.data.settings;
        }
        private static counterTitleDefaultKey: string = "Visual_CounterTitle";
        private static axesDefaultColor: string = "black";
        private static axesDefaultfontSize: number = 10.5;
        private static viewportMargins = {
            top: 10,
            right: 30,
            bottom: 10,
            left: 10
        };

        private static viewportDimentions: IViewport = {
            width: 150,
            height: 150
        };

        private tooltipServiceWrapper: ITooltipServiceWrapper;
        constructor(options: VisualConstructorOptions) {
            this.tooltipServiceWrapper = createTooltipServiceWrapper(
                options.host.tooltipService,
                options.element);

            this.hostService = options.host;
            this.localizationManager = this.hostService.createLocalizationManager();

            this.layout = new VisualLayout(null, LineChart.viewportMargins);

            this.layout.minViewport = LineChart.viewportDimentions;

            this.interactivityService = createInteractivityService(options.host);
            this.behavior = new LineChartWebBehavior();

            this.root = d3.select(options.element)
                .append('svg')
                .classed(LineChart.Identity.className, true);

            this.main = this.root.append('g');

            this.axes = this.main
                .append('g')
                .classed(LineChart.Axes.className, true);

            this.axisX = this.axes
                .append('g')
                .classed(LineChart.Axis.className, true);

            this.axisY = this.axes
                .append('g')
                .classed(LineChart.Axis.className, true);

            this.axisY2 = this.axes
                .append('g')
                .classed(LineChart.Axis.className, true);

            this.legends = this.main
                .append('g')
                .classed(LineChart.Legends.className, true);

            this.line = this.main
                .append('g')
                .classed(LineChart.Line.className, true);

            this.colors = options.host.colorPalette;

            LineChart.target = options.element;
        }

        public update(options: VisualUpdateOptions) {
            if(LineChart.debugMode == true){
                LineChart.target.innerHTML = "";
            }
            if (!options || !options.dataViews || !options.dataViews[0]) {
                    if(LineChart.debugMode == true){
                    LineChart.target.innerHTML += "<p>Update - No data selected or invalid options</p>";
                    if(!options)
                        LineChart.target.innerHTML += "<br/><p>Update - invalid options</p>";
                    else
                        LineChart.target.innerHTML += "<br/><p>NO data selected or bad data selected</p>";
                }
                return;
            }
            this.layout.viewport = options.viewport;
            let data: LineChartViewModel = LineChart.converter(options.dataViews[0], this.hostService, this.localizationManager);
            if (!data || _.isEmpty(data.dotPoints)) {
                if(LineChart.debugMode == true){
                    LineChart.target.innerHTML += "<p>No selected data points</p>";
                    if(!data){
                        LineChart.target.innerHTML += "The LineChartViewModel is faulty";
                    }else{
                        LineChart.target.innerHTML += "Data Collection is of size 0 [" + _.isEmpty(data.dotPoints) + "]";
                    }
                }
                this.clear();
                return;
            }

            this.data = data;

            if (this.interactivityService) {
                this.interactivityService.applySelectionStateToData(this.data.dotPoints);
            }

            this.resize();
            
            this.calculateAxes();
            
            if(LineChart.debugMode == true){
                LineChart.target.innerHTML += "update->draw";
            }
            this.draw();
        }

        public destroy() {
            this.root = null;
        }

        public onClearSelection(): void {
            if (this.interactivityService) {
                this.interactivityService.clearSelection();
            }
        }

        public clear() {
        /*    if (this.settings && this.settings.misc) {
                this.settings.misc.isAnimated = false;
            }*/

            this.axes.selectAll(LineChart.Axis.selectorName).selectAll("*").remove();
            this.main.selectAll(LineChart.Legends.selectorName).selectAll("*").remove();
            this.main.selectAll(LineChart.Line.selectorName).selectAll("*").remove();
            this.main.selectAll(LineChart.Legend.selectorName).selectAll("*").remove();
            this.line.selectAll(LineChart.textSelector).remove();
            if(LineChart.debugMode == true){
                LineChart.target.innerHTML += "<p>clear() finished</p>";
            }
        }

        /*public setIsStopped(isStopped: Boolean): void {
            let objects: VisualObjectInstancesToPersist = {
                merge: [
                    <VisualObjectInstance>{
                        objectName: "misc",
                        selector: undefined,
                        properties: {
                            "isStopped": isStopped,
                        }
                    }
                ]
            };

            this.hostService.persistProperties(objects);
        }*/

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            return LineChartSettings.enumerateObjectInstances(
                this.settings || LineChartSettings.getDefault(),
                options);
        }

        private clearElement(selection: d3.Selection<any>): void {
            selection
                .selectAll("*")
                .remove();
        }

        private static validateDataValue(value: number, defaultValues: MinMaxValue): number {
            if (value < defaultValues.min) {
                return defaultValues.min;
            } else if (value > defaultValues.max) {
                return defaultValues.max;
            }
            return value;
        }

        private static dateMaxCutter: number = .05;
        private static makeSomeSpaceForCounter: number = .10;
        private static converter(dataView: DataView, visualHost: IVisualHost, localizationManager: ILocalizationManager): LineChartViewModel {
            if(LineChart.debugMode == true){
                LineChart.target.innerHTML += "<p<b>LineChar.Convertor(...)</b></p>";
            }
            let categorical: LineChartColumns<DataViewCategoryColumn & DataViewValueColumn[]>
                = LineChartColumns.getCategoricalColumns(dataView);

            if (!categorical
                || !categorical.Date
                || !categorical.Date.source
                || _.isEmpty(categorical.Date.values)
                || !categorical.Values
                || !categorical.Values[0]
                || !categorical.Values[0].source
                || _.isEmpty(categorical.Values[0].values)) {
                    if(LineChart.debugMode == true){
                        LineChart.target.innerHTML += "<p>The data convertor indicates that: There is no categorical column</p>";
                    } 
                return null;
            }

            let counterValues: PrimitiveValue[] = null;

            for (let i = 0; i < dataView.categorical.values.length; i++) {
                if (dataView.categorical.values[i].source.roles['Counter']) {
                    counterValues = dataView.categorical.values[i].values;
                }
            }

            const valuesColumn: DataViewValueColumn = categorical.Values[0],
                categoryType: valueType = AxisHelper.getCategoryValueType(categorical.Date.source, true);

            const categoricalValues: LineChartColumns<any[]> = LineChartColumns.getCategoricalValues(dataView),
                settings: LineChartSettings = this.parseSettings(dataView, localizationManager);
            if (counterValues && counterValues.length > 0) {
                let fValue: any = counterValues[0];
                settings.isCounterDateTime.isCounterDateTime = fValue.getDate ? true : false;
            }

            let hasHighlights: boolean = !!(categorical.Values.length > 0 && valuesColumn.highlights);

            const dateColumnFormatter = valueFormatter.create({
                format: valueFormatter.getFormatStringByColumn(categorical.Date.source, true) || categorical.Date.source.format,
                cultureSelector: visualHost.locale
            });

            let extentValues: [number, number] = d3.extent(categoricalValues.Values),
                yMinValue: number = extentValues[0],
                yMaxValue: number = extentValues[1],
                dotPoints: LineDotPoint[] = [],
                sumOfValues: number = 0;

            const dateValues: DateValue[] = [],
                isOrdinal: boolean = AxisHelper.isOrdinal(categoryType),
                isDateTime: boolean = AxisHelper.isDateTime(categoryType);

            for (let valueIndex: number = 0, length: number = categoricalValues.Date.length; valueIndex < length; valueIndex++) {
                const value: number = categoricalValues.Values[valueIndex] || 0;
                let dateValue: DateValue = new DateValue(categoricalValues.Date[valueIndex], null);

                if (isDateTime) {
                    dateValue.value = categoricalValues.Date[valueIndex].getTime();
                } else if (!isOrdinal) {
                    dateValue.value = categoricalValues.Date[valueIndex];
                } else {
                    dateValue.value = valueIndex;
                }

                dateValues.push(dateValue);
                sumOfValues += value;

                const selector: ISelectionId = visualHost.createSelectionIdBuilder()
                    .withCategory(categorical.Date, valueIndex)
                    .createSelectionId();

                dotPoints.push({
                    dateValue,
                    value,
                    dot: (yMaxValue - yMinValue)
                        ? (value - yMinValue) / (yMaxValue - yMinValue)
                        : 0,
                    sum: sumOfValues,
                    selected: false,
                    identity: selector,
                    highlight: hasHighlights && !!(valuesColumn.highlights[valueIndex]),
                    opacity: settings.dotoptions.percentile / 100,
                    counter: counterValues ? counterValues[valueIndex] : null
                });
            }

            // make some space for counter + 25%
            sumOfValues = sumOfValues + (sumOfValues - yMinValue) * LineChart.makeSomeSpaceForCounter;

            const columnNames: ColumnNames = {
                category: LineChart.getDisplayName(categorical.Date),
                values: LineChart.getDisplayName(valuesColumn)
            };

            const dataValueFormatter: IValueFormatter = valueFormatter.create({
                format: valueFormatter.getFormatStringByColumn(valuesColumn.source)
            });

            const metadata: DataViewMetadataColumn = categorical.Date.source;

            return {
                columnNames,
                dotPoints,
                settings,
                dataValueFormatter,
                dateColumnFormatter,
                isOrdinal,
                dateValues,
                yMinValue,
                yMaxValue,
                sumOfValues,
                hasHighlights,
                dateMetadataColumn: categorical.Date.source,
                valuesMetadataColumn: valuesColumn.source
            };
        }

        private static getDisplayName(column: DataViewCategoricalColumn): string {
            return (column && column.source && column.source.displayName) || "";
        }

        private static parseSettings(dataView: DataView, localizationManager: ILocalizationManager): LineChartSettings {
            let settings: LineChartSettings = LineChartSettings.parse<LineChartSettings>(dataView);
            let defaultRange: LineChartDefaultSettingsRange = this.defaultSettingsRange;
            if (settings.counteroptions.counterTitle === null) {
                settings.counteroptions.counterTitle = localizationManager.getDisplayName(LineChart.counterTitleDefaultKey);
            }
            settings.dotoptions.dotSizeMin = this.validateDataValue(settings.dotoptions.dotSizeMin, defaultRange.dotSize);
            settings.dotoptions.dotSizeMax = this.validateDataValue(settings.dotoptions.dotSizeMax, {
                min: settings.dotoptions.dotSizeMin,
                max: defaultRange.dotSize.max
            });
            settings.lineoptions.lineThickness = this.validateDataValue(settings.lineoptions.lineThickness, defaultRange.lineThickness);
            //settings.misc.duration = this.validateDataValue(settings.misc.duration, defaultRange.animationDuration);

            return settings;
        }
        private static outerPadding: number = 0;
        private static forcedTickSize: number = 150;
        private static xLabelMaxWidth: number = 160;
        private static xLabelTickSize: number = 3.2;
        private calculateAxes() {
            if(LineChart.debugMode == true){
                LineChart.target.innerHTML += "<p>calculating axes</p>";
            }
            let effectiveWidth: number = Math.max(0, this.layout.viewportIn.width - LineChart.LegendSize - LineChart.AxisSize);
            let effectiveHeight: number = Math.max(0, this.layout.viewportIn.height - LineChart.LegendSize);

            const extentDate: [number, number] = d3.extent(
                this.data.dateValues,
                (dateValue: DateValue) => dateValue.value);

            let minDate: number = extentDate[0],
                maxDate: number = extentDate[1] + (extentDate[1] - extentDate[0]) * LineChart.dateMaxCutter;

            this.xAxisProperties = AxisHelper.createAxis({
                pixelSpan: effectiveWidth,
                dataDomain: !this.data.isOrdinal ? [minDate, maxDate] : this.data.dateValues.map((dateValue: DateValue, index: number) => { return dateValue.value; }),
                metaDataColumn: this.data.dateMetadataColumn,
                formatString: null,
                outerPadding: LineChart.outerPadding,
                useRangePoints: true,
                isCategoryAxis: true,
                isScalar: !this.data.isOrdinal,
                isVertical: false,
                forcedTickCount: Math.max(this.layout.viewport.width / LineChart.forcedTickSize, 0),
                useTickIntervalForDisplayUnits: false,
                shouldClamp: true,
                getValueFn: (index: number, dataType: valueType): any => {
                    if (dataType.dateTime) {
                        return this.data.dateColumnFormatter.format(new Date(index));
                    }
                    else if (dataType.text) {
                        return this.data.dateValues[index].label;
                    }
                    return index;
                }
            });
            this.xAxisProperties.xLabelMaxWidth = Math.min(LineChart.xLabelMaxWidth, this.layout.viewportIn.width / LineChart.xLabelTickSize);

            this.xAxisProperties.formatter = this.data.dateColumnFormatter;
            
            
           if (this.settings.yAxis.dynamicScaling == false){ 

            this.yAxisProperties = AxisHelper.createAxis({
                pixelSpan: effectiveHeight,   
                dataDomain: [this.settings.yAxis.yscaleminin, this.settings.yAxis.yscalemaxin],
                metaDataColumn: this.data.valuesMetadataColumn,
                formatString: null,
                outerPadding: LineChart.outerPadding,
                isCategoryAxis: false,
                isScalar: true,
                isVertical: true,
                useTickIntervalForDisplayUnits: true
            });

            this.yAxis2Properties = AxisHelper.createAxis({
                pixelSpan: effectiveHeight,
                dataDomain: [this.settings.yAxis.yscaleminin, this.settings.yAxis.yscalemaxin],
                metaDataColumn: this.data.valuesMetadataColumn,
                formatString: null,
                outerPadding: LineChart.outerPadding,
                isCategoryAxis: false,
                isScalar: true,
                isVertical: true,
                useTickIntervalForDisplayUnits: true
            });
            this.yAxis2Properties.axis.orient('right');
        } else if (this.settings.yAxis.dynamicScaling == true){
        

            this.yAxisProperties = AxisHelper.createAxis({
                pixelSpan: effectiveHeight,   
                dataDomain: [this.data.yMinValue, this.data.yMaxValue],
                metaDataColumn: this.data.valuesMetadataColumn,
                formatString: null,
                outerPadding: LineChart.outerPadding,
                isCategoryAxis: false,
                isScalar: true,
                isVertical: true,
                useTickIntervalForDisplayUnits: true
            });

            this.yAxis2Properties = AxisHelper.createAxis({
                pixelSpan: effectiveHeight,
                dataDomain: [this.data.yMinValue, this.data.yMaxValue],
                metaDataColumn: this.data.valuesMetadataColumn,
                formatString: null,
                outerPadding: LineChart.outerPadding,
                isCategoryAxis: false,
                isScalar: true,
                isVertical: true,
                useTickIntervalForDisplayUnits: true
        });
        this.yAxis2Properties.axis.orient('right');
    } 
}
    

        private static rotateAngle: number = 270;
        private generateAxisLabels(): Legend[] {
            return [
                {
                    transform: SVGUtil.translate((this.layout.viewportIn.width) / 2, (this.layout.viewportIn.height)),
                    text: "", // xAxisTitle
                    dx: "1em",
                    dy: "-1em"
                }, {
                    transform: SVGUtil.translateAndRotate(0, this.layout.viewportIn.height / 2, 0, 0, LineChart.rotateAngle),
                    text: "", // yAxisTitle
                    dx: "3em"
                }
            ];
        }

        private resize(): void {
            if(LineChart.debugMode == true){
                LineChart.target.innerHTML += "<p>resizing</p>";
            }
            this.root.attr({
                width: this.layout.viewport.width,
                height: this.layout.viewport.height
            });
            this.main.attr('transform', SVGUtil.translate(this.layout.margin.left, this.layout.margin.top));
            this.legends.attr('transform', SVGUtil.translate(this.layout.margin.left, this.layout.margin.top));
            this.line.attr('transform', SVGUtil.translate(this.layout.margin.left + LineChart.LegendSize, 0));
            this.axes.attr('transform', SVGUtil.translate(this.layout.margin.left + LineChart.LegendSize, 0));
            this.axisX.attr('transform', SVGUtil.translate(0, this.layout.viewportIn.height - LineChart.LegendSize));
            this.axisY2.attr('transform', SVGUtil.translate(this.layout.viewportIn.width - LineChart.LegendSize - LineChart.AxisSize, 0));
        }

        private static tickText: string = '.tick text';
        private static dotPointsText: string = "g.path, g.dot-points";
        private static dotPathText: string = "g.path";
        private draw(): void {
            if(LineChart.debugMode == true){
                LineChart.target.innerHTML += "<p>draw start</p>";
            }
        //    this.stopAnimation();
            this.renderLegends();
        //    this.drawPlaybackButtons();

            if (this.settings.xAxis.show === true) {
                this.axisX.call(this.xAxisProperties.axis);
            } else {
                this.clearElement(this.axisX);
            }

            if (this.settings.yAxis.show === true) {
                this.axisY.call(this.yAxisProperties.axis);

                if (this.settings.yAxis.isDuplicated) {
                    this.axisY2.call(this.yAxis2Properties.axis);
                } else {
                    this.clearElement(this.axisY2);
                }
            } else {
                this.clearElement(this.axisY);
                this.clearElement(this.axisY2);
            }

            this.axisX.selectAll(LineChart.tickText).call(
                AxisHelper.LabelLayoutStrategy.clip,
                this.xAxisProperties.xLabelMaxWidth,
                TextMeasurementService.svgEllipsis);

            /*if (this.settings.misc.isAnimated && this.settings.misc.isStopped) {
                this.main.selectAll(LineChart.Line.selectorName).selectAll(LineChart.dotPointsText).remove();
                this.line.selectAll(LineChart.textSelector).remove();

                return;
            }*/

            this.applyAxisSettings();
            let linePathSelection: d3.selection.Update<LineDotPoint[]> = this.line
                .selectAll(LineChart.dotPathText)
                .data([this.data.dotPoints]);
            linePathSelection
                .exit().remove();

        
            if(LineChart.debugMode == true){
                LineChart.target.innerHTML += "<p>draw line</p>";
            }

            this.drawLine(linePathSelection);
            //this.drawClipPath(linePathSelection);

            //this.drawDots();
        }

        public applyAxisSettings(): void {
            let xColor: string = LineChart.axesDefaultColor,
                yColor: string = LineChart.axesDefaultColor,
                xFontSize: string = convertToPt(LineChart.axesDefaultfontSize),
                yFontSize: string = convertToPt(LineChart.axesDefaultfontSize);

            if (this.settings.xAxis.show === true) {
                xColor = this.settings.xAxis.color;
                xFontSize = convertToPt(this.settings.xAxis.textSize);
                this.axisX.selectAll('line').style('stroke', function (d, i) { return xColor; });
                this.axisX.selectAll('path').style('stroke', function (d, i) { return xColor; });
                this.axisX.selectAll('text').style('fill', function (d, i) { return xColor; }).style("font-size", xFontSize);
            }

            if (this.settings.yAxis.show === true) {
                yColor = this.settings.yAxis.color;
                yFontSize = convertToPt(this.settings.yAxis.textSize);
                this.axisY.selectAll('line').style('stroke', function (d, i) { return yColor; });
                this.axisY.selectAll('path').style('stroke', function (d, i) { return yColor; });
                this.axisY.selectAll('text').style('fill', function (d, i) { return yColor; }).style("font-size", yFontSize);

                if (this.settings.yAxis.isDuplicated) {
                    this.axisY2.selectAll('line').style('stroke', function (d, i) { return yColor; });
                    this.axisY2.selectAll('path').style('stroke', function (d, i) { return yColor; });
                    this.axisY2.selectAll('text').style('fill', function (d, i) { return yColor; }).style("font-size", yFontSize);
                }
            }
        }

        private static LineChartPlayBtn: string = "LineChart__playBtn";
        private static LineChartPlayBtnTranslate: string = "LineChartPlayBtnTranslate";
        private static gLineChartPayBtn: string = "g.LineChart__playBtn";
        private static playBtnGroupDiameter: number = 34;
        private static playBtnGroupLineValues: string = "M0 2l10 6-10 6z";
        private static playBtnGroupPlayTranslate: string = "playBtnGroupPlayTranslate";
        private static playBtnGroupPathTranslate: string = "playBtnGroupPathTranslate";
        private static playBtnGroupRectTranslate: string = "playBtnGroupRectTranslate";
        private static playBtnGroupRectWidth: string = "2";
        private static playBtnGroupRectHeight: string = "12";
        private static StopButton: ClassAndSelector = createClassAndSelector("stop");
        /*private drawPlaybackButtons() {
            let playBtn: d3.selection.Update<string> = this.line.selectAll(LineChart.gLineChartPayBtn).data([""]);
            let playBtnGroup: d3.Selection<string> = playBtn.enter()
                .append("g")
                .classed(LineChart.LineChartPlayBtn, true);

            playBtnGroup
                .classed(LineChart.LineChartPlayBtnTranslate, true)
                .append("circle")
                .attr("r", LineChart.playBtnGroupDiameter / 2)
                .on('click', () => this.setIsStopped(!this.settings.misc.isStopped));

            playBtnGroup.append("path")
                .classed("play", true)
                .classed(LineChart.playBtnGroupPlayTranslate, true)
                .attr("d", LineChart.playBtnGroupLineValues)
                .attr('pointer-events', "none");

            playBtnGroup
                .append("path")
                .classed(LineChart.StopButton.className, true)
                .classed(LineChart.playBtnGroupPathTranslate, true)
                .attr("d", LineChart.playBtnGroupLineValues)
                .attr("transform-origin", "center")
                .attr('pointer-events', "none");

            playBtnGroup
                .append("rect")
                .classed(LineChart.StopButton.className, true)
                .classed(LineChart.playBtnGroupRectTranslate, true)
                .attr("width", LineChart.playBtnGroupRectWidth)
                .attr("height", LineChart.playBtnGroupRectHeight)
                .attr('pointer-events', "none");

            playBtn.selectAll("circle").attr("opacity", () => this.settings.misc.isAnimated ? 1 : 0);
            playBtn.selectAll(".play").attr("opacity", () => this.settings.misc.isAnimated && this.settings.misc.isStopped ? 1 : 0);
            playBtn.selectAll(LineChart.StopButton.selectorName).attr("opacity", () => this.settings.misc.isAnimated && !this.settings.misc.isStopped ? 1 : 0);

            playBtn.exit().remove();
        }*/

        private static pathClassName: string = "path";
        private static pathPlotClassName: string = "path.plot";
        private static plotClassName: string = "plot";
        private static lineClip: string = "lineClip";
        public static temp111: number = 0;
        private drawLine(linePathSelection: d3.selection.Update<LineDotPoint[]>) {
            if(LineChart.debugMode == true){
                LineChart.target.innerHTML += "<p>drawline() start</p>";
            }
            linePathSelection.enter().append("g").classed(LineChart.pathClassName, true);

            let pathPlot: d3.selection.Update<LineDotPoint[]> = linePathSelection.selectAll(LineChart.pathPlotClassName).data(d => [d]);
            pathPlot.enter()
                .append('path')
                .classed(LineChart.plotClassName, true);

            // Draw the line
            var temp1111: number = 0; 
            const drawLine: d3.svg.Line<LineDotPoint> = d3.svg.line<LineDotPoint>()
                
                .x((dataPoint: LineDotPoint) => {
                    return this.xAxisProperties.scale(dataPoint.dateValue.value);
                })
                .y((dataPoint: LineDotPoint) => {
                    if (this.settings.yAxis.dynamicScaling == true){
                    return this.yAxisProperties.scale(dataPoint.value);
                    } else {
                        if ((dataPoint.value <= this.settings.yAxis.yscalemaxin) && (dataPoint.value >= this.settings.yAxis.yscaleminin)){

                            return this.yAxisProperties.scale(dataPoint.value);

                        } else {

                            if (dataPoint.value > this.settings.yAxis.yscalemaxin ){

                                return this.yAxisProperties.scale(this.settings.yAxis.yscalemaxin);

                            } else {
                                return this.yAxisProperties.scale(this.settings.yAxis.yscaleminin);
                            }
                            
                        }
                    }
                });
            

            pathPlot
                .attr('stroke', () => this.settings.lineoptions.fill)
                .attr('stroke-width', this.settings.lineoptions.lineThickness)
                .attr('d', drawLine)
                .attr("clip-path", "url(" + location.href + '#' + LineChart.lineClip + ")");
                
                if(LineChart.debugMode == true){
                    LineChart.target.innerHTML += "<p>drawline() complete</p>";
                }
        }

        private static zeroX: number = 0;
        private static zeroY: number = 0;
        private static millisecondsInOneSecond: number = 1000;
        private drawClipPath(linePathSelection: d3.selection.Update<any>) {
            let clipPath: d3.selection.Update<any> = linePathSelection.selectAll("clipPath").data(d => [d]);
            clipPath.enter().append("clipPath")
                .attr("id", LineChart.lineClip)
                .append("rect")
                .attr("x", LineChart.zeroX)
                .attr("y", LineChart.zeroY)
                .attr("height", this.layout.viewportIn.height);

            let line_left: any = this.xAxisProperties.scale(_.first(this.data.dotPoints).dateValue.value);
            let line_right: any = this.xAxisProperties.scale(_.last(this.data.dotPoints).dateValue.value);

            /*if (this.settings.misc.isAnimated) {
                clipPath
                    .selectAll("rect")
                    .attr('x', line_left)
                    .attr('width', 0)
                    .attr("height", this.layout.viewportIn.height)
                    .interrupt()
                    .transition()
                    .ease("linear")
                    .duration(this.animationDuration * LineChart.millisecondsInOneSecond)
                    .attr('width', line_right - line_left);
            } else {
                linePathSelection.selectAll("clipPath").remove();
            }*/
            linePathSelection.selectAll("clipPath").remove();
        }

        private static pointTime: number = 300;
        private static dotPointsClass: string = "dot-points";
        private static pointClassName: string = 'point';
        private static pointScaleValue: number = 0.005;
        private static pointTransformScaleValue: number = 3.4;
        private drawDots() {
            if(LineChart.debugMode == true){
                LineChart.target.innerHTML += "<p>draw dots()</p>";
            }
        //    let point_time: number = this.settings.misc.isAnimated && !this.settings.misc.isStopped ? LineChart.pointTime : 0;

            let hasHighlights: boolean = this.data.hasHighlights;
            let hasSelection: boolean = this.interactivityService && this.interactivityService.hasSelection();
            // Draw the individual data points that will be shown on hover with a tooltip
            let lineTipSelection: d3.selection.Update<LineDotPoint[]> = this.line.selectAll('g.' + LineChart.dotPointsClass)
                .data([this.data.dotPoints]);

            lineTipSelection.enter()
                .append("g")
                .classed(LineChart.dotPointsClass, true);

            let dotsSelection: d3.selection.Update<LineDotPoint> = lineTipSelection
                .selectAll("circle." + LineChart.pointClassName)
                .data(d => d);

            dotsSelection.enter()
                .append('circle')
                .classed(LineChart.pointClassName, true)
                .on('mouseover.point', this.showDataPoint)
                .on('mouseout.point', this.hideDataPoint);

            dotsSelection
                .attr('fill', this.settings.dotoptions.color)
                .style("opacity", (d: LineDotPoint) => {
                    return LineChartUtils.getFillOpacity(d, d.selected, d.highlight, !d.highlight && hasSelection, !d.selected && hasHighlights);
                })
                .attr('r', (d: LineDotPoint) =>
                    this.settings.dotoptions.dotSizeMin + d.dot * (this.settings.dotoptions.dotSizeMax - this.settings.dotoptions.dotSizeMin));

            /*if (this.settings.misc.isAnimated) {
                let maxTextLength: number = Math.min(350, this.xAxisProperties.scale.range()[1] - this.xAxisProperties.scale.range()[0] - 60);
                let lineTextSelection: d3.Selection<any> = this.line.selectAll(LineChart.textSelector);
                let lineText: d3.selection.Update<string> = lineTextSelection.data([""]);
                lineText
                    .enter()
                    .append("text")
                    .attr('text-anchor', "end")
                    .classed("text", true);
                lineText
                    .attr('x', this.layout.viewportIn.width - LineChart.widthMargin)
                    .attr('y', LineChart.yPosition)
                    .call(selection => TextMeasurementService.svgEllipsis(<any>selection.node(), maxTextLength));
                lineText.exit().remove();

                dotsSelection
                    .interrupt()
                    .attr('transform', (dataPoint: LineDotPoint) => {
                        return SVGUtil.translateAndScale(
                            this.xAxisProperties.scale(dataPoint.dateValue.value),
                            this.yAxisProperties.scale(dataPoint.sum),
                            LineChart.pointScaleValue);
                    })
                    .transition()
                    .each("start", (d: LineDotPoint, i: number) => {
                        let text = this.settings.counteroptions.counterTitle + ' ';
                        if (d.counter) {
                            text += this.settings.isCounterDateTime.isCounterDateTime ? this.data.dateColumnFormatter.format(d.counter) : d.counter;
                        } else {
                            text += (i + 1);
                        }
                        this.updateLineText(lineText, text);
                    })
                    .duration(point_time)
                    .delay((d: LineDotPoint, i: number) => this.pointDelay(this.data.dotPoints, i, this.animationDuration))
                    .ease("linear")
                    .attr('transform', (dataPoint: LineDotPoint) => {
                        return SVGUtil.translateAndScale(
                            this.xAxisProperties.scale(dataPoint.dateValue.value),
                            this.yAxisProperties.scale(dataPoint.sum),
                            LineChart.pointTransformScaleValue);
                    })
                    .transition()
                    .duration(point_time)
                    .delay((d: LineDotPoint, i: number) => {
                        return this.pointDelay(this.data.dotPoints, i, this.animationDuration) + point_time;
                    })
                    .ease("elastic")
                    .attr('transform', (dataPoint: LineDotPoint) => {
                        return SVGUtil.translateAndScale(
                            this.xAxisProperties.scale(dataPoint.dateValue.value),
                            this.yAxisProperties.scale(dataPoint.sum),
                            1);
                    });
            } else {*/
            dotsSelection
                .interrupt()
                .attr('transform', (dataPoint: LineDotPoint) => {
                    return SVGUtil.translateAndScale(
                        this.xAxisProperties.scale(dataPoint.dateValue.value),
                        this.yAxisProperties.scale(dataPoint.value),
                        1);
                });

            this.line
                .selectAll(LineChart.textSelector)
                .remove();
            //}

            for (let i: number = 0; i < dotsSelection[0].length; i++) {
                this.addTooltip(dotsSelection[0][i] as Element);
            }

            dotsSelection.exit().remove();
            lineTipSelection.exit().remove();

            if (this.interactivityService) {
                const behaviorOptions: LineChartBehaviorOptions = {
                    selection: dotsSelection,
                    clearCatcher: this.root,
                    interactivityService: this.interactivityService,
                    hasHighlights: hasHighlights
                };

                this.interactivityService.bind(
                    this.data.dotPoints,
                    this.behavior,
                    behaviorOptions);
            }
        }

        /*private get animationDuration(): number {
            if (this.settings && this.settings.misc) {
                return this.settings.misc.duration;
            }
            return 0;
        }

        private stopAnimation(): void {
            this.line.selectAll("*")
                .transition()
                .duration(0)
                .delay(0);

            d3.timer.flush();
        }*/

        private static textSelector: string = "text.text";
        private static widthMargin: number = 85;
        private static yPosition: number = 30;
        private updateLineText(textSelector: d3.Selection<any>, text?: string): void {
            textSelector.text(d => text);
        }

        /*private pointDelay(points: LineDotPoint[], num: number, animation_duration: number): number {
            if (!points.length
                || !points[num]
                || num === 0
                || !this.settings.misc.isAnimated
                || this.settings.misc.isStopped) {

                return 0;
            }

            let time: number = points[num].dateValue.value,
                min: number = points[0].dateValue.value,
                max: number = points[points.length - 1].dateValue.value;

            return animation_duration * 1000 * (time - min) / (max - min);
        }*/

        private static showClassName: string = 'show';
        private showDataPoint(data: LineDotPoint, index: number): void {
            d3.select(<any>this).classed(LineChart.showClassName, true);
        }

        private hideDataPoint(data: LineDotPoint, index: number): void {
            d3.select(<any>this).classed(LineChart.showClassName, false);
        }

        private addTooltip(element: Element): void {
            const selection: d3.Selection<any> = d3.select(element);

            this.tooltipServiceWrapper.addTooltip<LineDotPoint>(
                selection,
                (tooltipEvent: TooltipEventArgs<LineDotPoint>) => {
                    return this.getTooltipDataItems(tooltipEvent.data);
                });
        }

        public getTooltipDataItems(dataPoint: LineDotPoint): VisualTooltipDataItem[] {
            if (!dataPoint) {
                return [];
            }

            const unformattedDate: string | Date | number = dataPoint.dateValue.label
                || dataPoint.dateValue.value;

            const valueFormatterLocalized = valueFormatter.create({cultureSelector: this.hostService.locale}),
                formattedDate: string = this.data.dateColumnFormatter.format(unformattedDate),
                formattedValue: string = this.data.dataValueFormatter.format(valueFormatterLocalized.format(dataPoint.value));

            const columnNames: ColumnNames = this.data.columnNames;

            return [
                {
                    displayName: columnNames.category,
                    value: formattedDate
                },
                {
                    displayName: columnNames.values,
                    value: formattedValue
                }
            ];
        }

        private renderLegends(): void {
            let legends: Legend[] = this.generateAxisLabels();
            let legendSelection: d3.selection.Update<any> = this.legends
                .selectAll(LineChart.Legend.selectorName)
                .data(legends);

            legendSelection
                .enter()
                .append("svg:text");

            legendSelection
                .attr("x", 0)
                .attr("y", 0)
                .attr("dx", (item: Legend) => item.dx)
                .attr("dy", (item: Legend) => item.dy)
                .attr("transform", (item: Legend) => item.transform)
                .text((item: Legend) => item.text)
                .classed(LineChart.Legend.className, true);

            legendSelection
                .exit()
                .remove();
        }
    }

    export module LineChartUtils {
        export let DimmedOpacity: number = 0.4;

        export function getFillOpacity(dot: LineDotPoint, selected: boolean, highlight: boolean, hasSelection: boolean, hasPartialHighlights: boolean): number {
            if ((hasPartialHighlights && !highlight) || (hasSelection && !selected)) {
                let opacity: number = dot.opacity - DimmedOpacity;
                return opacity < 0.1 ? 0.1 : opacity;
            }
            return dot.opacity;
        }
    }
}