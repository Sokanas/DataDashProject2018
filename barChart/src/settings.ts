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
    "use strict";

    import DataViewObjectsParser = powerbi.extensibility.utils.dataview.DataViewObjectsParser;

    export class VisualSettings extends DataViewObjectsParser {
        //public rcv_script: rcv_scriptSettings = new rcv_scriptSettings();
        public ColourSettings: ColourSettings = new ColourSettings();
        public Settings: Settings = new Settings();
    }


    /*export class rcv_scriptSettings {
     // undefined
      public provider     // undefined
      public source
    }*/

    export class ColourSettings {
        public show: boolean = true;
        public fill: string = "#FD625E";
        public thresholdActive: boolean = false;
        public threshold1: number = 40;
        public colour1: string = "#F2C80F";
        public threshold2: number = 70;
        public colour2: string = "#01B8AA";
    }

    export class Settings {
        public fill: string = "#FD625E";
        public legendActive: boolean = true;
        public sliderActive: boolean = true;
        public outlieractive: boolean = false;
    }
}
