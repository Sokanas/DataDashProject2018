module powerbi.extensibility.visual {
    // powerbi.visuals
    import ISelectionId = powerbi.visuals.ISelectionId;
    import ColorUtility = powerbi.extensibility.utils.color;
    import DataViewObjects = powerbi.extensibility.utils.dataview.DataViewObjects;

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
        selectionId: ISelectionId;
    };

    export class DialChart implements IVisual {
        debugger;

        private svg: d3.Selection<SVGElement>;
        private host: IVisualHost;
        private selectionManager: ISelectionManager;
        private dialContainer: d3.Selection<SVGElement>;
        private data: DialViewModel;
        private locale: string;
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
        private Target: number;

        private majorTickClass: string;
        private minorTickClass: string;
        private dialBaseClass: string;
        private dialContainerClass: string;
        private dialEdgeClass: string;
        private dialNeedleClass: string;
        private targetClass: string;
        public static e: HTMLElement;
        private colorPalette: IColorPalette;
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


        private getSettings(): DialChartSettings {
            return this.data && this.data.settings;
        }


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
            this.Target = 80;
            //    DialChart.e.innerHTML = "ctor ok";

            this.colorPalette = this.host.colorPalette;
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
            let viewModel: DialViewModel = this.visualTransform(options, this.host);
            //DialChart.e.innerHTML += "<br/>viewmodel ok";
            this.data = viewModel;
            this.Value = viewModel.measure;
            let c = this.colorPalette;
            //this.Value = this.dialDataPoints.value;

            let width = options.viewport.width;
            let height = options.viewport.height;

            this.svg.attr({
                width: width,
                height: height
            });
            //DialChart.e.innerHTML += "<br/>base attibs and data updated";

            this.minValue = this.data.settings.DialSettings.minimumValue;
            this.maxValue = this.data.settings.DialSettings.maximumValue;
            this.Target = this.data.settings.TargetSettings.targetValue;

            //Clear Everything
            this.svg.selectAll("*").remove();

            //1.    Draw the Background Arcs
            this.drawBackgroundArc();
            //DialChart.e.innerHTML += "<br/>background arc";

            //2.    Draw the Coloured Bands (1,2,3)
            if (this.data.settings.BandOneSettings.showBand == true) {
                this.drawColouredArc("BandOneSettings",
                    this.data.settings.BandOneSettings.bandColor,
                    this.valToPerc(this.data.settings.BandOneSettings.bandStart),
                    this.valToPerc(this.data.settings.BandOneSettings.bandEnd));
                //            DialChart.e.innerHTML += "<br/>band 1 ok";
            }
            if (this.data.settings.BandTwoSettings.showBand == true) {
                this.drawColouredArc("BandTwoSettings",
                    this.data.settings.BandTwoSettings.bandColor,
                    this.valToPerc(this.data.settings.BandTwoSettings.bandStart),
                    this.valToPerc(this.data.settings.BandTwoSettings.bandEnd));
                //        DialChart.e.innerHTML += "<br/>band 2 ok";
            }
            if (this.data.settings.BandThreeSettings.showBand == true) {
                this.drawColouredArc("BandThreeSettings",
                    this.data.settings.BandThreeSettings.bandColor,
                    this.valToPerc(this.data.settings.BandThreeSettings.bandStart),
                    this.valToPerc(this.data.settings.BandThreeSettings.bandEnd));
                //       DialChart.e.innerHTML += "<br/>band 3 ok";
            }
            if (this.data.settings.BandFourSettings.showBand == true) {
                this.drawColouredArc("BandFourSettings",
                    this.data.settings.BandFourSettings.bandColor,
                    this.valToPerc(this.data.settings.BandFourSettings.bandStart),
                    this.valToPerc(this.data.settings.BandFourSettings.bandEnd));
                //        DialChart.e.innerHTML += "<br/>band 4 ok";
            }
            if (this.data.settings.BandFiveSettings.showBand == true) {
                this.drawColouredArc("BandFiveSettings",
                    this.data.settings.BandFiveSettings.bandColor,
                    this.valToPerc(this.data.settings.BandFiveSettings.bandStart),
                    this.valToPerc(this.data.settings.BandFiveSettings.bandEnd));
                //        DialChart.e.innerHTML += "<br/>band 5 ok";
            }

            if (this.data.settings.LabelSettings.showTicks == true) {
                //3.    Major Tick Marks
                var miniTick = this.data.settings.LabelSettings.tickSize;
                var bigTick = miniTick * 2;
                this.drawTick(this.data.settings.LabelSettings.tickColor, 0, bigTick);
                this.drawTick(this.data.settings.LabelSettings.tickColor, 10, bigTick);
                this.drawTick(this.data.settings.LabelSettings.tickColor, 20, bigTick);
                this.drawTick(this.data.settings.LabelSettings.tickColor, 30, bigTick);
                this.drawTick(this.data.settings.LabelSettings.tickColor, 40, bigTick);
                this.drawTick(this.data.settings.LabelSettings.tickColor, 50, bigTick);
                this.drawTick(this.data.settings.LabelSettings.tickColor, 60, bigTick);
                this.drawTick(this.data.settings.LabelSettings.tickColor, 70, bigTick);
                this.drawTick(this.data.settings.LabelSettings.tickColor, 80, bigTick);
                this.drawTick(this.data.settings.LabelSettings.tickColor, 90, bigTick);
                this.drawTick(this.data.settings.LabelSettings.tickColor, 100, bigTick);
                if (this.data.settings.LabelSettings.showMajorTicksOnly != true) {
                    //3.B.  Minor Tick Marks
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 2, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 4, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 6, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 8, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 10, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 12, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 14, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 16, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 18, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 20, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 22, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 24, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 26, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 28, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 30, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 32, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 34, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 36, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 38, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 40, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 42, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 44, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 46, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 48, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 50, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 52, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 54, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 56, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 58, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 60, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 62, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 64, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 66, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 68, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 70, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 72, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 74, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 76, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 78, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 80, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 82, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 84, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 86, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 88, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 90, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 92, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 94, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 96, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 98, miniTick);
                    this.drawShortTick(this.data.settings.LabelSettings.tickColor, 100, miniTick);
                }
            }

            //4. Draw the 'Needle'
            this.drawValueNeedle(this.valToPerc(this.data.measure),
                this.data.settings.DialSettings.dialColor,
                this.data.settings.DialSettings.dialSize,
                this.dialNeedleClass, 20);
            //
            //  Any Other needles would go here - or a function that could push them into here
            //
            this.drawValueNeedleNodule(this.data.settings.DialSettings.dialColor,
                this.dialNeedleClass + "Hub");
            //DialChart.e.innerHTML += "<br/>needle ok";

            //5. Draw Labels
            if (this.data.settings.TargetSettings.showTarget == true) {
                this.drawTargetTick(this.data.settings.TargetSettings.targetColor,
                    this.valToPerc(this.data.settings.TargetSettings.targetValue),
                    this.data.settings.TargetSettings.targetLineSize);
                //       DialChart.e.innerHTML += "<br/>draw target line";
                this.drawTargetLabel(this.valToPerc(this.data.settings.TargetSettings.targetValue));
            }

            if (this.data.settings.LabelSettings.showMinMax == true) {
                this.drawMinMaxLabel();
            }

            this.drawValueLabel();
        }

        /**
         *  drawBackgroundArc
         *  Calculates and draws the background arc
         */
        private drawBackgroundArc() {
            var cscale = d3.scale.linear().domain([0, 100]).range([-120 * (Math.PI / 180), 120 * (Math.PI / 180)]);
            var translate = "translate(250,250)";

            var inner = d3.svg.arc()
                .innerRadius(this.innerRadius)
                .outerRadius(this.outerRadius)
                .startAngle(cscale(0))
                .endAngle(cscale(100));

            var background = d3.svg.arc()
                .innerRadius(this.innerRadius)
                .outerRadius(this.outerRadius + 1)
                .startAngle(cscale(0 - 0.25))
                .endAngle(cscale(100 + 0.25));

            this.svg
                .append("path")
                .attr("d", <any>background)
                .attr("class", "outerArc")
                .style("fill", "#8c8f93")
                .attr("transform", translate);

            this.svg
                .append("path")
                .attr("d", <any>inner)
                .attr("class", "innerArc")
                .style("fill", "#d4d8dd")
                .attr("transform", translate);
        }

        /**
         * Convert a provided value into a percentage based on the min-max range
         * @param value Value to Convert
         */
        private valToPerc(value: number) {
            var v = value;
            if (value <= this.data.settings.DialSettings.minimumValue)
                v = this.data.settings.DialSettings.minimumValue;
            else if (value >= this.data.settings.DialSettings.maximumValue)
                v = this.data.settings.DialSettings.maximumValue;
            else
                v = value;


            var min = this.data.settings.DialSettings.minimumValue;
            var max = this.data.settings.DialSettings.maximumValue;
            var range = max - min;

            var perc = (v / range) * 100;

            return perc;
        }

        /**
         * drawColouredArc
         * @param name  Element Name to Draw
         * @param color Colour of the Arc
         * @param alpha Start Angle
         * @param beta  Stop Angle
         */
        private drawColouredArc(name: string, color: string, alpha: number, beta: number) {
            var cscale = d3.scale.linear().domain([0, 100]).range([-120 * (Math.PI / 180), 120 * (Math.PI / 180)]);
            var translate = "translate(250,250)";

            var idef = this.outerRadius - this.innerRadius;
            idef = (idef * 0.25) + this.innerRadius;

            var aperc = alpha;
            var bperc = beta;

            var inner = d3.svg.arc()
                .innerRadius(idef)
                .outerRadius(this.outerRadius)
                .startAngle(cscale(aperc))
                .endAngle(cscale(bperc));

            this.svg
                .append("path")
                .attr("d", <any>inner)
                .attr("class", name)
                .style("fill", color)
                .attr("transform", translate);
        }

        /**
         * drawMajorTicks
         * @param color     Color of the Major Tick Line
         * @param length    Length of the Major Tick Lines
         * @param num       Number of Major Ticks to Draw
         */
        private drawTick(color: string, position: number, size: number) {
            var cscale = d3.scale.linear().domain([0, 100]).range([-120 * (Math.PI / 180), 120 * (Math.PI / 180)]);
            var v = 0;

            //v = this.valToPerc(v);
            v = position;
            var vrot = 37.5;        //Rotate needle right by 37.5 units
            v += vrot;
            v = cscale(v);

            //Coordinate Calculation
            var cos1Adj = Math.cos(v) * (this.outerRadius - 1);
            var sin1Adj = Math.sin(v) * (this.outerRadius - 1);
            var cos2Adj = Math.cos(v) * (this.innerRadius + 5);
            var sin2Adj = Math.sin(v) * (this.innerRadius + 5);
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
                .style("stroke-width", size)
                .style("stroke", color);
        }

        /**
         * drawShortTick
         * @param color 
         * @param position 
         * @param size 
         */
        private drawShortTick(color: string, position: number, size: number) {
            var cscale = d3.scale.linear().domain([0, 100]).range([-120 * (Math.PI / 180), 120 * (Math.PI / 180)]);
            var v = 0;


            //v = this.valToPerc(position);
            v = position;
            var vrot = 37.5;        //Rotate needle right by 37.5 units
            v += vrot;
            v = cscale(v);

            var cos1Adj = Math.cos(v) * (this.outerRadius - 1);
            var sin1Adj = Math.sin(v) * (this.outerRadius - 1);
            var cos2Adj = Math.cos(v) * (this.innerRadius + 20);
            var sin2Adj = Math.sin(v) * (this.innerRadius + 20);
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
                .style("stroke-width", size)
                .style("stroke", color);
        }


        /**
         * drawValueNeedle - will technically allow as many needles as we want created
         * @param value Needle Value on dial
         * @param color Colour of the Needle
         * @param size Adjust the width of the needle line
         * @param adjLength Adjust the length of the needle
         */
        private drawValueNeedle(value: number, color: string, size: number, name: string, adjLength = 0) {
            var cscale = d3.scale.linear().domain([0, 100]).range([-120 * (Math.PI / 180), 120 * (Math.PI / 180)]);
            var v = value;

            //Constrain to Bounds with needle limited to the range of the graph        
            var vrot = 37.5;        //Rotate needle right by 37.5 units
            v += vrot;

            //Contrain Stroke Size
            if (size <= 1)
                size = 1;
            else if (size >= 10)
                size = 10;

            //Position Coordinates
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

            //Draw Needle
            this.svg.append("path")
                .attr("d", triangle)
                .attr("class", name)
                .style("fill", color)
                .style("stroke-width", size)
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
         * Render the Target Line
         * @param color     COLOR OF THE TICK MARK
         * @param value     VALUE OF TICK POSITION
         * @param size      Size of the Target Line (Thickness)
         */
        private drawTargetTick(color: string, value: number, size: number, name = "targetLine") {
            var cscale = d3.scale.linear().domain([0, 100]).range([-120 * (Math.PI / 180), 120 * (Math.PI / 180)]);
            var v = value;
            var vrot = 37.5;        //Rotate needle right by 37.5 units
            v += vrot;
            v = cscale(v);

            //Position Coordinate Calculation
            var cos1Adj = Math.cos(v) * (this.outerRadius + 15);
            var sin1Adj = Math.sin(v) * (this.outerRadius + 15);
            var cos2Adj = Math.cos(v) * (this.innerRadius - 15);
            var sin2Adj = Math.sin(v) * (this.innerRadius - 15);
            var x1 = 250 + cos1Adj * -1;
            var y1 = 250 + sin1Adj * -1;
            var x2 = 250 + cos2Adj * -1;
            var y2 = 250 + sin2Adj * -1;

            //Draw
            this.svg.append("line")
                .attr("x1", x1)
                .attr("y1", y1)
                .attr("x2", x2)
                .attr("y2", y2)
                .attr("class", name)
                .style("stroke-width", size)
                .style("stroke", color);
        }

        /**
         * Draw Text Label on Target Line
         * @param value  Target Value to draw on the label
         */
        private drawTargetLabel(value: number) {
            var cscale = d3.scale.linear().domain([0, 100]).range([-120 * (Math.PI / 180), 120 * (Math.PI / 180)]);
            var v = 0;

            var vrot = 37.8;        //Rotate needle right by 37.5 units
            var v = value;
            
            v += vrot;
            v = cscale(v);

            //Position Calculation
            var cos1Adj = Math.cos(v) * (this.outerRadius + 30);
            var sin1Adj = Math.sin(v) * (this.outerRadius + 30);
            var x1 = 250 + cos1Adj * -1;
            var y1 = 250 + sin1Adj * -1;

            var fontsize = this.data.settings.TargetSettings.targetTextSize.toString() + "px";

            //Draw
            this.svg.append("text")
                .attr("x", x1)
                .attr("y", y1)
                .attr("font-family", "sans-serif")
                .attr("font-size", fontsize)
                .attr("fill", this.data.settings.TargetSettings.targetColor)
                .text(this.data.settings.TargetSettings.targetValue.toString());
        }

        /**
         *  Draws the Minimum and Maximum Value Label
         */
        private drawMinMaxLabel() {
            var x1 = 79;
            var x2 = 392;
            var y1 = 370;

            var fontsize = this.data.settings.LabelSettings.labelSize.toString() + "px"

            this.svg.append("text")
                .attr("x", x1)
                .attr("y", y1)
                .attr("font-family", "sans-serif")
                .attr("font-size", fontsize)
                .attr("fill", this.data.settings.LabelSettings.labelColor)
                .text(this.minValue);

            this.svg.append("text")
                .attr("x", x2)
                .attr("y", y1)
                .attr("font-family", "sans-serif")
                .attr("font-size", fontsize)
                .attr("fill", this.data.settings.LabelSettings.labelColor)
                .text(this.maxValue);
        }

        /**
         *  Draws the Value Label
         */
        private drawValueLabel() {
            var x = 236;    //Middle X Pos
            var y = 300;    // Want it below the needle, but not by like heaps

            var fontsize = this.data.settings.DialSettings.dialValueSize.toString() + "px";

            this.svg.append("text")
                .attr("x", x)
                .attr("y", y)
                .attr("font-family", "sans-serif")
                .attr("font-size", fontsize)
                .attr("fill", this.data.settings.LabelSettings.labelColor)
                .text(this.Value);
        }


        /**
         * 
         * @param selection 
         * @param selectionIds 
         */
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


        /**
         * 
         * @param selectionIds 
         * @param selectionId 
         */
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
            return DialChartSettings.enumerateObjectInstances(this.data.settings, options);

        }


        /**
         * Destroy runs when the visual is removed. Any cleanup that the visual needs to
         * do should be done here.
         *
         * @function
         */
        public destroy(): void {
            // Perform any cleanup tasks here
            this.svg = null;
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
        private visualTransform(options: VisualUpdateOptions, host: IVisualHost): DialViewModel {
            let dataViews = options.dataViews[0];
            let defaultSettings: DialChartSettings = new DialChartSettings();

            let viewModel: DialViewModel = {
                measure: 0,
                settings: defaultSettings
            };

            let dv = options.dataViews[0];
            viewModel.measure = dv.single.value as number;

            //Update the Settings
            if (this.data === null) {
                return viewModel;
            } else {
                try {
                    let objects = options.dataViews[0].metadata.objects;
                    var settings: DialChartSettings = new DialChartSettings();

                    settings.LabelSettings.labelSize = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "LabelSettings",
                            propertyName: "labelSize"
                        }, defaultSettings.LabelSettings.labelSize
                    );

                    settings.LabelSettings.labelColor = DataViewObjects.getFillColor(
                        options.dataViews[0].metadata.objects, {
                            objectName: "LabelSettings",
                            propertyName: "labelColor"
                        }, defaultSettings.LabelSettings.labelColor
                    );

                    settings.LabelSettings.showMinMax = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "LabelSettings",
                            propertyName: "showMinMax"
                        }, defaultSettings.LabelSettings.showMinMax
                    );

                    settings.LabelSettings.tickColor = DataViewObjects.getFillColor(
                        options.dataViews[0].metadata.objects, {
                            objectName: "LabelSettings",
                            propertyName: "tickColor"
                        }, defaultSettings.LabelSettings.labelColor
                    );

                    settings.LabelSettings.showTicks = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "LabelSettings",
                            propertyName: "showTicks"
                        }, defaultSettings.LabelSettings.showTicks
                    );

                    settings.LabelSettings.showMajorTicksOnly = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "LabelSettings",
                            propertyName: "showMajorTicksOnly"
                        }, defaultSettings.LabelSettings.showTicks
                    );

                    settings.LabelSettings.tickSize = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "LabelSettings",
                            propertyName: "tickSize"
                        }, defaultSettings.LabelSettings.tickSize
                    );

                    settings.TargetSettings.showTarget = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "TargetSettings",
                            propertyName: "showTarget"
                        },
                        defaultSettings.TargetSettings.showTarget
                    );

                    settings.TargetSettings.targetColor = DataViewObjects.getFillColor(
                        options.dataViews[0].metadata.objects, {
                            objectName: "TargetSettings",
                            propertyName: "targetColor"
                        },
                        defaultSettings.TargetSettings.targetColor
                    );

                    settings.TargetSettings.targetLineSize = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "TargetSettings",
                            propertyName: "targetLineSize"
                        },
                        defaultSettings.TargetSettings.targetLineSize
                    );

                    settings.TargetSettings.targetTextSize = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "TargetSettings",
                            propertyName: "targetTextSize"
                        },
                        defaultSettings.TargetSettings.targetTextSize
                    );

                    settings.TargetSettings.targetValue = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "TargetSettings",
                            propertyName: "targetValue"
                        },
                        defaultSettings.TargetSettings.targetValue
                    );


                    settings.DialSettings.dialValueSize = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "DialSettings",
                            propertyName: "dialValueSize"
                        },
                        defaultSettings.DialSettings.dialValueSize
                    );

                    settings.DialSettings.dialColor = DataViewObjects.getFillColor(
                        options.dataViews[0].metadata.objects, {
                            objectName: "DialSettings",
                            propertyName: "dialColor"
                        },
                        defaultSettings.DialSettings.dialColor
                    );

                    settings.DialSettings.dialSize = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "DialSettings",
                            propertyName: "dialSize"
                        },
                        defaultSettings.DialSettings.dialSize
                    );

                    settings.DialSettings.minimumValue = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "DialSettings",
                            propertyName: "minimumValue"
                        },
                        defaultSettings.DialSettings.minimumValue
                    );

                    settings.DialSettings.maximumValue = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "DialSettings",
                            propertyName: "maximumValue"
                        },
                        defaultSettings.DialSettings.maximumValue
                    );


                    ///1
                    settings.BandOneSettings.showBand = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "BandOneSettings",
                            propertyName: "showBand"
                        },
                        defaultSettings.BandOneSettings.showBand
                    );

                    settings.BandOneSettings.bandStart = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "BandOneSettings",
                            propertyName: "bandStart"
                        },
                        defaultSettings.BandOneSettings.bandStart
                    );

                    settings.BandOneSettings.bandEnd = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "BandOneSettings",
                            propertyName: "bandEnd"
                        },
                        defaultSettings.BandOneSettings.bandEnd
                    );

                    settings.BandOneSettings.bandColor = DataViewObjects.getFillColor(
                        options.dataViews[0].metadata.objects, {
                            objectName: "BandOneSettings",
                            propertyName: "bandColor"
                        },
                        defaultSettings.BandOneSettings.bandColor
                    );


                    ///2  
                    settings.BandTwoSettings.showBand = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "BandTwoSettings",
                            propertyName: "showBand"
                        },
                        defaultSettings.BandTwoSettings.showBand
                    );

                    settings.BandTwoSettings.bandStart = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "BandTwoSettings",
                            propertyName: "bandStart"
                        },
                        defaultSettings.BandTwoSettings.bandStart
                    );

                    settings.BandTwoSettings.bandEnd = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "BandTwoSettings",
                            propertyName: "bandEnd"
                        },
                        defaultSettings.BandTwoSettings.bandEnd
                    );

                    settings.BandTwoSettings.bandColor = DataViewObjects.getFillColor(
                        options.dataViews[0].metadata.objects, {
                            objectName: "BandTwoSettings",
                            propertyName: "bandColor"
                        },
                        defaultSettings.BandTwoSettings.bandColor
                    );

                    ///3  
                    settings.BandThreeSettings.showBand = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "BandThreeSettings",
                            propertyName: "showBand"
                        },
                        defaultSettings.BandThreeSettings.showBand
                    );

                    settings.BandThreeSettings.bandStart = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "BandThreeSettings",
                            propertyName: "bandStart"
                        },
                        defaultSettings.BandThreeSettings.bandStart
                    );

                    settings.BandThreeSettings.bandEnd = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "BandThreeSettings",
                            propertyName: "bandEnd"
                        },
                        defaultSettings.BandThreeSettings.bandEnd
                    );

                    settings.BandThreeSettings.bandColor = DataViewObjects.getFillColor(
                        options.dataViews[0].metadata.objects, {
                            objectName: "BandThreeSettings",
                            propertyName: "bandColor"
                        },
                        defaultSettings.BandThreeSettings.bandColor
                    );

                    ///4  
                    settings.BandFourSettings.showBand = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "BandFourSettings",
                            propertyName: "showBand"
                        },
                        defaultSettings.BandFourSettings.showBand
                    );

                    settings.BandFourSettings.bandStart = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "BandFourSettings",
                            propertyName: "bandStart"
                        },
                        defaultSettings.BandFourSettings.bandStart
                    );

                    settings.BandFourSettings.bandEnd = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "BandFourSettings",
                            propertyName: "bandEnd"
                        },
                        defaultSettings.BandFourSettings.bandEnd
                    );

                    settings.BandFourSettings.bandColor = DataViewObjects.getFillColor(
                        options.dataViews[0].metadata.objects, {
                            objectName: "BandFourSettings",
                            propertyName: "bandColor"
                        },
                        defaultSettings.BandFourSettings.bandColor
                    );

                    ///5  
                    settings.BandFiveSettings.showBand = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "BandFiveSettings",
                            propertyName: "showBand"
                        },
                        defaultSettings.BandFiveSettings.showBand
                    );

                    settings.BandFiveSettings.bandStart = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "BandFiveSettings",
                            propertyName: "bandStart"
                        },
                        defaultSettings.BandFiveSettings.bandStart
                    );

                    settings.BandFiveSettings.bandEnd = DataViewObjects.getValue(
                        options.dataViews[0].metadata.objects, {
                            objectName: "BandFiveSettings",
                            propertyName: "bandEnd"
                        },
                        defaultSettings.BandFiveSettings.bandEnd
                    );

                    settings.BandFiveSettings.bandColor = DataViewObjects.getFillColor(
                        options.dataViews[0].metadata.objects, {
                            objectName: "BandFiveSettings",
                            propertyName: "bandColor"
                        },
                        defaultSettings.BandFiveSettings.bandColor
                    );

                    viewModel.settings = settings;

                } catch (error) {
                    console.log(error);
                }
            }
            return viewModel;
        }
    }
}
