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
    import DataViewObjectsParser = powerbi.extensibility.utils.dataview.DataViewObjectsParser;

    export class LineChartSettings extends DataViewObjectsParser {
        public isCounterDateTime: CounterDateTime = new CounterDateTime();
        public lineoptions: LineSettings = new LineSettings();
        public dotoptions: DotSettings = new DotSettings();
        public counteroptions: CounterSettings = new CounterSettings();
    //    public misc: MiscSettings = new MiscSettings();
        public xAxis: AxisSettings = new AxisSettings();
        public yAxis: YAxisSettings = new YAxisSettings();
    }

    export class AxisSettings {
        public show: boolean = true;
        public color: string = "black";
        public textSize: number = 8;
    }

    export class YAxisSettings extends AxisSettings {
        public isDuplicated: boolean = true;
        public dynamicScaling: boolean = true;
        public yscalemaxin: number = null;
        public yscaleminin: number = null;
    }

    export class LineSettings {
        public fill: string = "rgb(102, 212, 204)";
        public lineThickness: number = 3;
        public lineThreshold: boolean = false;
        
        //public lineThresholdLine: boolean = false;
        //public lineMinorThresholdColor: string = "black";
        public lineThresholdColor: string = "red";
        public lineThresholdColor2: string = "green";
        //public lineMinorThreshold: number = -1;
        public lineThresholdValue2: number = null;
        public lineThresholdValue: number = null;        
        public lineThresholdBar: boolean = true;
    }

    export class DotSettings {
        public color: string = "#005c55";
        public dotSizeMin: number = 7;
        // Opacity
        public percentile: number = 100;
    }

    export class CounterSettings {
        public counterTitle: string = null;
    }

    /*export class MiscSettings {
        public isAnimated: boolean = true;
        public isStopped: boolean = true;
        public duration: number = 20;
    }*/

    export class CounterDateTime {
        public isCounterDateTime: boolean = true;
    }
}