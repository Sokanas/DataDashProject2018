module powerbi.extensibility.visual
{
    import IVisual = powerbi.extensibility.IVisual;
    import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
    import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
    import DataViewObjectsParser = powerbi.extensibility.utils.dataview.DataViewObjectsParser;
    import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;   

    export class LabelSettings{
        labelSize: number = 10;
        labelColor: string = "black";
        showMinMax: boolean = true;
        tickSize: number = 2;
        showTicks: boolean = true;
        tickColor: string = "white";
    }

    export class TargetSettings{
        targetTextSize: number = 10;
        targetColor: string = "red";
        showTarget: boolean = true;
        targetLineSize: number = 10;
        targetValue: number = 80;
    }

    export class DialSettings{
        dialValueSize: number = 10;
        dialColor: string = "orange";
        dialSize: number = 8;
        minimumValue: number = 0;
        maximumValue: number = 100;
    }

    export class BandOneSettings{
        showBand: boolean = true;
        bandColor: string = "red";
        bandStart: number = 0;
        bandEnd: number = 20;
    }

    export class BandTwoSettings{
        showBand: boolean = true;
        bandColor: string = "orange";
        bandStart: number = 20;
        bandEnd: number = 60;
    }

    export class BandThreeSettings{
        showBand: boolean = true;
        bandColor: string = "yellow";
        bandStart: number = 60;
        bandEnd: number = 80;
    }

    export class BandFourSettings{
        showBand: boolean = true;
        bandColor: string = "green";
        bandStart: number = 80;
        bandEnd: number = 100;
    }

    export class BandFiveSettings{
        showBand: boolean = false;
        bandColor: string = "white";
        bandStart: number = 0;
        bandEnd: number = 0;
    }



    export class DialChartSettings extends DataViewObjectsParser
    {
        public LabelSettings: LabelSettings = new LabelSettings();
        public TargetSettings: TargetSettings = new TargetSettings();
        public DialSettings: DialSettings = new DialSettings();
        public BandOneSettings: BandOneSettings = new BandOneSettings();
        public BandTwoSettings: BandTwoSettings = new BandTwoSettings();
        public BandThreeSettings: BandThreeSettings = new BandThreeSettings();
        public BandFourSettings: BandFourSettings = new BandFourSettings();
        public BandFiveSettings: BandFiveSettings = new BandFiveSettings();
    }
}