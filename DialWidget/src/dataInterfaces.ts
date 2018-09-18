module powerbi.extensibility.visual{
    
    /**
     * Interface for DialCharts viewmodel.
     *
     * @interface
     * @property {DialChartDataPoint[]} dataPoints - Set of data points the visual will render.
     * @property {number} dataMax                 - Maximum data value in the set of data points.
     */
    export interface DialViewModel
    {
        measure: number;
        settings: DialChartSettings;
    }
}