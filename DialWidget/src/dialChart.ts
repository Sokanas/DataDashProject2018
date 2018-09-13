module powerbi.extensibility.visual {
    // powerbi.visuals
    import ISelectionId = powerbi.visuals.ISelectionId;

    /**
     * Interface for DialCharts viewmodel.
     *
     * @interface
     * @property {DialChartDataPoint[]} dataPoints - Set of data points the visual will render.
     * @property {number} dataMax                 - Maximum data value in the set of data points.
     */
    interface DialChartViewModel {
        dataPoints: DialChartDataPoint[];
        dataMax: number;
        settings: DialChartSettings;
    };

    /**
     * Interface for BarChart data points.
     *
     * @interface
     * @property {number} value             - Data value for point.
     * @property {string} category          - Corresponding category of data value.
     * @property {string} color             - Color corresponding to data point.
     * @property {ISelectionId} selectionId - Id assigned to data point for cross filtering
     *                                        and visual interaction.
     */
    interface DialChartDataPoint {
        value: any;
        category: string;
        color: string;
        strokeColor: string;
        strokeWidth: number;
        selectionId: ISelectionId;
    };

    interface DialChartBand {
        start: PrimitiveValue;
        end: PrimitiveValue;
        width: PrimitiveValue;
        color: String;
    }
    /**
     * Interface for BarChart settings.
     *
     * @interface
     * @property {{show:boolean}} enableAxis - Object property that allows axis to be enabled.
     * @property {{generalView.opacity:number}} Bars Opacity - Controls opacity of plotted bars, values range between 10 (almost transparent) to 100 (fully opaque, default)
     * @property {{generalView.showHelpLink:boolean}} Show Help Button - When TRUE, the plot displays a button which launch a link to documentation.
     */
    interface DialChartSettings {
        enableAxis: {
            show: boolean;
            fill: string;
        };

        generalView: {
            opacity: number;
        };
    }

    /**
     * Function that converts queried data into a view model that will be used by the visual.
     *
     * @function
     * @param {VisualUpdateOptions} options - Contains references to the size of the container
     *                                        and the dataView which contains all the data
     *                                        the visual had queried.
     * @param {IVisualHost} host            - Contains references to the host which contains services
     */
    function visualTransform(options: VisualUpdateOptions, host: IVisualHost): DialChartViewModel {
        let dataViews = options.dataViews;
        let defaultSettings: DialChartSettings = {
            enableAxis: {
                show: false,
                fill: "#000000",
            },
            generalView: {
                opacity: 100
            }
        };
        let viewModel: DialChartViewModel = {
            dataPoints: [],
            dataMax: 0,
            settings: <DialChartSettings>{}
        };

        if (!dataViews
            || !dataViews[0]
            || !dataViews[0].categorical
            || !dataViews[0].categorical.categories
            || !dataViews[0].categorical.categories[0].source
            || !dataViews[0].categorical.values
        ) {
            return viewModel;
        }

        let categorical = dataViews[0].categorical;
        let category = categorical.categories[0];
        let dataValue = categorical.values[0];

        let dialChartDataPoints: DialChartDataPoint[] = [];
        let dataMax: number;

        let colorPalette: ISandboxExtendedColorPalette = host.colorPalette;
        let objects = dataViews[0].metadata.objects;

        const strokeColor: string = getColumnStrokeColor(colorPalette);

        let dialChartSettings: DialChartSettings = {
            enableAxis: {
                show: getValue<boolean>(objects, 'enableAxis', 'show', defaultSettings.enableAxis.show),
                fill: getAxisTextFillColor(objects, colorPalette, defaultSettings.enableAxis.fill)
            },
            generalView: {
                opacity: getValue<number>(objects, 'generalView', 'opacity', defaultSettings.generalView.opacity)
            }
        };

        const strokeWidth: number = getColumnStrokeWidth(colorPalette.isHighContrast);

        for (let i = 0, len = Math.max(category.values.length, dataValue.values.length); i < len; i++) {
            const color: string = getColumnColorByIndex(category, i, colorPalette);

            const selectionId: ISelectionId = host.createSelectionIdBuilder()
                .withCategory(category, i)
                .createSelectionId();

            dialChartDataPoints.push({
                color,
                strokeColor,
                strokeWidth,
                selectionId,
                value: dataValue.values[i],
                category: `${category.values[i]}`,
            });
        }

        dataMax = <number>dataValue.maxLocal;

        return {
            dataPoints: dialChartDataPoints,
            dataMax: dataMax,
            settings: dialChartSettings,
        };
    }

    function getColumnColorByIndex(
        category: DataViewCategoryColumn,
        index: number,
        colorPalette: ISandboxExtendedColorPalette,
    ): string {
        if (colorPalette.isHighContrast) {
            return colorPalette.background.value;
        }

        const defaultColor: Fill = {
            solid: {
                color: colorPalette.getColor(`${category.values[index]}`).value,
            }
        };

        return getCategoricalObjectValue<Fill>(
            category,
            index,
            'colorSelector',
            'fill',
            defaultColor
        ).solid.color;
    }

    function getColumnStrokeColor(colorPalette: ISandboxExtendedColorPalette): string {
        return colorPalette.isHighContrast
            ? colorPalette.foreground.value
            : null;
    }

    function getColumnStrokeWidth(isHighContrast: boolean): number {
        return isHighContrast
            ? 2
            : 0;
    }

    function getAxisTextFillColor(
        objects: DataViewObjects,
        colorPalette: ISandboxExtendedColorPalette,
        defaultColor: string
    ): string {
        if (colorPalette.isHighContrast) {
            return colorPalette.foreground.value;
        }

        return getValue<Fill>(
            objects,
            "enableAxis",
            "fill",
            {
                solid: {
                    color: defaultColor,
                }
            },
        ).solid.color;
    }

    export class DialChart implements IVisual {
        private svg: d3.Selection<SVGElement>;
        private host: IVisualHost;
        private selectionManager: ISelectionManager;
        private dialContainer: d3.Selection<SVGElement>;
        private xAxis: d3.Selection<SVGElement>;
        private dialDataPoints: DialChartDataPoint[];
        private dialChartSettings: DialChartSettings;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private locale: string;
        private helpLinkElement: d3.Selection<any>;
        private bands: DialChartBand[];

        private innerRadius: number;
        private outerRadius: number;
        private innerOuterRadius: number;
        private outerOuterRadius: number;

        private majorTicks: number[];
        private minorTicks: number[];
        private majorTickLength: number;
        private minorTickLength: number;

        private needleValueTextSize: number;

        private scaleRange: number;
        private maxValue: number;
        private minValue: number;
        private Value: number;

        private majorTickClass: string;
        private minorTickClass: string;
        private dialBaseClass: string;
        private dialContainerClass: string;
        private dialEdgeClass: string;
        private dialNeedleClass: string;
        private targetClass: string;
        public static e: HTMLElement;
        private debugTrace: boolean;

        private dialSelection: d3.selection.Update<DialChartDataPoint>;

        static Config = {
            xScalePadding: 0.1,
            solidOpacity: 1,
            transparentOpacity: 0.4,
            margins: {
                top: 0,
                right: 0,
                bottom: 25,
                left: 30,
            },
            xAxisFontMultiplier: 0.04,
        };

        /**
         * Creates instance of BarChart. This method is only called once.
         *
         * @constructor
         * @param {VisualConstructorOptions} options - Contains references to the element that will
         *                                             contain the visual and a reference to the host
         *                                             which contains services.
         */
        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            DialChart.e = options.element;
            this.debugTrace = true;
            this.selectionManager = options.host.createSelectionManager();
            this.selectionManager.registerOnSelectCallback(() => {
                this.syncSelectionState(this.dialSelection, this.selectionManager.getSelectionIds() as ISelectionId[]);
            });


            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);

            this.dialBaseClass = "dialChartBase";
            this.dialContainerClass = "dialContainer";
            this.dialNeedleClass = "dialNeedle";

            this.svg = d3.select(options.element)
                .append('svg')
                .classed(this.dialBaseClass, true);

            this.locale = options.host.locale;

            this.dialContainer = this.svg
                .append('g')
                .classed(this.dialContainerClass, true);


            //const helpLinkElement: Element = this.createHelpLinkElement();
            //options.element.appendChild(helpLinkElement);

            //Dynamic Scaling
            this.svg
                .attr("viewBox", "0 0 500 500")
                .attr("preserveAspectRatio", "xMinYMin meet");

            this.minValue = 0;
            this.maxValue = 100;

            this.innerRadius = 180;
            this.outerRadius = 210;
            this.majorTickLength = 25;
            this.minorTickLength = 12.5;

            this.Value = 66;    //Pull this from bound data!!!
        }




        /**
         * Updates the state of the visual. Every sequential databinding and resize will call update.
         *
         * @function
         * @param {VisualUpdateOptions} options - Contains references to the size of the container
         *                                        and the dataView which contains all the data
         *                                        the visual had queried.
         */
        public update(options: VisualUpdateOptions) {
            /*this.clear();
            this.dialContainer = this.svg
                .append('g')
                .classed(this.dialContainerClass, true);
            */
            // DialChart.e.innerHTML += "UPDATE";
            let viewModel: DialChartViewModel = visualTransform(options, this.host);
            let settings = this.dialChartSettings = viewModel.settings;
            this.dialDataPoints = viewModel.dataPoints;


            let width = options.viewport.width;
            let height = options.viewport.height;

            this.svg.attr({
                width: width,
                height: height
            });


            //Clear Everything
            this.svg.selectAll("*").remove();

            //1.    Draw the Background Arcs
            this.drawBackgroundArc();

            //2.    Draw the Coloured Bands (1,2,3)
            this.drawColouredArc("cArc1", "red", 0, 25);
            this.drawColouredArc("cArc2", "orange", 25, 65);
            this.drawColouredArc("cArc3", "yellow", 65, 75);
            this.drawColouredArc("cArc4", "green", 75, 100);

            //3.    Major Tick Marks

            //3.B.  Minor Tick Marks

            //4. Draw the 'Needle'
            this.drawValueNeedle(this.Value, "orange", 3.5, this.dialNeedleClass, 20);
            //
            //  Any Other needles would go here - or a function that could push them into here
            //
            this.drawValueNeedleNodule("orange", this.dialNeedleClass + "Hub");

            //5. Draw the Value Text

            //6. Draw the Target Line
            this.drawTargetTick("red", 80, 4);
            //7. Draw the Target Text Label

            //8. MinMax Text Label

        }

        /**
         *  drawBackgroundArc()
         *  Calculates and draws the background arc
         */
        private drawBackgroundArc() {
            var cscale = d3.scale.linear().domain([this.minValue, this.maxValue]).range([-120 * (Math.PI / 180), 120 * (Math.PI / 180)]);
            var translate = "translate(250,250)";

            var inner = d3.svg.arc()
                .innerRadius(this.innerRadius)
                .outerRadius(this.outerRadius)
                .startAngle(cscale(this.minValue))
                .endAngle(cscale(this.maxValue));

            var background = d3.svg.arc()
                .innerRadius(this.innerRadius)
                .outerRadius(this.outerRadius + 1)
                .startAngle(cscale(this.minValue - 0.25))
                .endAngle(cscale(this.maxValue + 0.25));

            this.svg
                .append("path")
                .attr("d", <any>background)
                .attr("class", "outerArc")
                .attr("fill", "#8c8f93")
                .attr("transform", translate);

            this.svg
                .append("path")
                .attr("d", <any>inner)
                .attr("class", "innerArc")
                .attr("fill", "#d4d8dd")
                .attr("transform", translate);
        }

        /**
         * drawColouredArc()
         * @param name  Element Name to Draw
         * @param color Colour of the Arc
         * @param alpha Start Angle
         * @param beta  Stop Angle
         */
        private drawColouredArc(name: string, color: string, alpha: number, beta: number) {
            var cscale = d3.scale.linear().domain([this.minValue, this.maxValue]).range([-120 * (Math.PI / 180), 120 * (Math.PI / 180)]);
            var translate = "translate(250,250)";

            var idef = this.outerRadius - this.innerRadius;
            idef = (idef * 0.25) + this.innerRadius;

            var inner = d3.svg.arc()
                .innerRadius(idef)
                .outerRadius(this.outerRadius)
                .startAngle(cscale(alpha))
                .endAngle(cscale(beta));

            this.svg
                .append("path")
                .attr("d", <any>inner)
                .attr("class", name)
                .attr("fill", color)
                .attr("transform", translate);
        }

        /**
         * drawMajorTicks()
         * @param color     Color of the Major Tick Line
         * @param length    Length of the Major Tick Lines
         * @param num       Number of Major Ticks to Draw
         */
        private drawMajorTicks(color: string, length: number, num: number) {
            var cscale = d3.scale.linear().domain([this.minValue, this.maxValue]).range([-120 * (Math.PI / 180), 120 * (Math.PI / 180)]);
            var x1, x2, y1, y2;

            x1 = 250; y1 = 250;
        }


        private drawMinorTicks(color: string, length: number, num: number, start: number, end: number) {
            var cscale = d3.scale.linear().domain([this.minValue, this.maxValue]).range([-120 * (Math.PI / 180), 120 * (Math.PI / 180)]);
            var x1, x2, y1, y2;

            x1 = 250; y1 = 250;   //center points
            //x2 = 250 + this.innerRadius * (cscale(value));
            // y2 = 250 + this.innerRadius * (cscale(value));

            this.svg.append("line")
        }

        /**
         * drawValueNeedle - will technically allow as many needles as we want created
         * @param value 
         * @param color 
         * @param size 
         * @param adjLength
         */
        private drawValueNeedle(value: number, color: string, size: number, name: string, adjLength = 0) {
            var cscale = d3.scale.linear().domain([this.minValue, this.maxValue]).range([-120 * (Math.PI / 180), 120 * (Math.PI / 180)]);
            var v = 0;

            //Constrain to Bounds with needle limited to the range of the graph
            if (value <= this.minValue)
                v = this.minValue;
            else if (value >= this.maxValue)
                v = this.maxValue;
            else
                v = value;
            var vrot = 37.5;        //Rotate needle right by 37.5 units
            v += vrot;
            //Contrain Stroke Size
            if (size <= 1)
                size = 1;
            else if (size >= 4)
                size = 4;

            var thetaRad = cscale(v);
            var needleLength = this.innerRadius + adjLength;
            var center = 250;
            var needleRadius = (500 * 2.5) / 300;
            var topX = center - needleLength * Math.cos(thetaRad);
            var topY = center - needleLength * Math.sin(thetaRad);
            var leftX = center - needleRadius * Math.cos(thetaRad - Math.PI / 2);
            var leftY = center - needleRadius * Math.sin(thetaRad - Math.PI / 2);
            var rightX = center - needleRadius * Math.cos(thetaRad + Math.PI / 2);
            var rightY = center - needleRadius * Math.sin(thetaRad + Math.PI / 2);
            var triangle = "M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY;
            this.svg.append("path")
                .attr("d", triangle)
                .attr("class", name)
                .style("fill", color)
                .style("stoke-with", size)
                .style("stroke", color);
        }

        /**
         * 
         * @param color     Color of the Hub
         * @param name      Name of the Hub
         * @param circleHub Size of the Hub
         */
        private drawValueNeedleNodule(color: string, name: string, circleHub = 12) {
            if (circleHub <= 6)
                circleHub = 6;

            var circleRadius = (250 * circleHub) / 300;

            var center = 250;
            this.svg.append("circle")
                .attr("r", circleRadius)
                .attr("cy", center)
                .attr("cx", center)
                .attr("fill", color)
                .attr("class", name);
        }

        /**
         * 
         * @param color     COLOR OF THE TICK MARK
         * @param value     VALUE OF TICK POSITION
         * @param size      Size of the Target Line (Thickness)
         */
        private drawTargetTick(color: string, value: number, size: number, name = "targetLine") {
            var cscale = d3.scale.linear().domain([this.minValue, this.maxValue]).range([-120 * (Math.PI / 180), 120 * (Math.PI / 180)]);
            var v = 0;

            //Constrain to Bounds with needle limited to the range of the graph
            if (value <= this.minValue)
                v = this.minValue;
            else if (value >= this.maxValue)
                v = this.maxValue;
            else
                v = value;
            var vrot = 37.5;        //Rotate needle right by 37.5 units
            v += vrot;
            v = cscale(v);

            var cos1Adj = Math.cos(v) * (this.outerRadius + 15);
            var sin1Adj = Math.sin(v) * (this.outerRadius + 15);
            var cos2Adj = Math.cos(v) * (this.innerRadius - 15);
            var sin2Adj = Math.sin(v) * (this.innerRadius - 15);
            var x1 = 250 + cos1Adj * -1;
            var y1 = 250 + sin1Adj * -1;
            var x2 = 250 + cos2Adj * -1;
            var y2 = 250 + sin2Adj * -1;

            this.svg.append("line")
                .attr("x1", x1)
                .attr("y1", y1)
                .attr("x2", x2)
                .attr("y2", y2)
                .attr("class", name)
                .style("stoke-with", size)
                .style("stroke", color);
        }










        private syncSelectionState(
            selection: d3.Selection<DialChartDataPoint>,
            selectionIds: ISelectionId[]
        ): void {
            if (!selection || !selectionIds) {
                return;
            }

            if (!selectionIds.length) {
                selection.style({
                    "fill-opacity": null,
                    "stroke-opacity": null,
                });

                return;
            }

            const self: this = this;

            selection.each(function (barDataPoint: DialChartDataPoint) {
                const isSelected: boolean = self.isSelectionIdInArray(selectionIds, barDataPoint.selectionId);

                const opacity: number = isSelected
                    ? DialChart.Config.solidOpacity
                    : DialChart.Config.transparentOpacity;

                d3.select(this).style({
                    "fill-opacity": opacity,
                    "stroke-opacity": opacity,
                });
            });
        }

        private isSelectionIdInArray(selectionIds: ISelectionId[], selectionId: ISelectionId): boolean {
            if (!selectionIds || !selectionId) {
                return false;
            }

            return selectionIds.some((currentSelectionId: ISelectionId) => {
                return currentSelectionId.includes(selectionId);
            });
        }

        /**
         * Enumerates through the objects defined in the capabilities and adds the properties to the format pane
         *
         * @function
         * @param {EnumerateVisualObjectInstancesOptions} options - Map of defined objects
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let objectName = options.objectName;
            let objectEnumeration: VisualObjectInstance[] = [];

            switch (objectName) {
                case 'enableAxis':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: this.dialChartSettings.enableAxis.show,
                            fill: this.dialChartSettings.enableAxis.fill,
                        },
                        selector: null
                    });
                    break;
                case 'colorSelector':
                    for (let barDataPoint of this.dialDataPoints) {
                        objectEnumeration.push({
                            objectName: objectName,
                            displayName: barDataPoint.category,
                            properties: {
                                fill: {
                                    solid: {
                                        color: barDataPoint.color
                                    }
                                }
                            },
                            selector: barDataPoint.selectionId.getSelector()
                        });
                    }
                    break;
                case 'generalView':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            opacity: this.dialChartSettings.generalView.opacity
                        },
                        validValues: {
                            opacity: {
                                numberRange: {
                                    min: 10,
                                    max: 100
                                }
                            }
                        },
                        selector: null
                    });
                    break;
            };

            return objectEnumeration;
        }

        /**
         * Destroy runs when the visual is removed. Any cleanup that the visual needs to
         * do should be done here.
         *
         * @function
         */
        public destroy(): void {
            // Perform any cleanup tasks here
        }

        private getTooltipData(value: any): VisualTooltipDataItem[] {
            let language = getLocalizedString(this.locale, "LanguageKey");
            return [{
                displayName: value.category,
                value: value.value.toString(),
                color: value.color,
                header: language && "displayed language " + language
            }];
        }

        private createHelpLinkElement(): Element {
            let linkElement = document.createElement("a");
            linkElement.textContent = "?";
            linkElement.setAttribute("title", "Open documentation");
            linkElement.setAttribute("class", "helpLink");
            linkElement.addEventListener("click", () => {
                this.host.launchUrl("https://github.com/Microsoft/PowerBI-visuals/blob/master/Readme.md#developing-your-first-powerbi-visual");
            });
            return linkElement;
        };
    }
}
