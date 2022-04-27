export interface Dataset {
    [key: string]: string
}

export interface IImpression {
    time_in: number
    data: Dataset
}

export interface ViewableImpressionOptions {
    triggerInterval: number,
    keepVisibleTimeout: number
}

export interface IImpressionManager {
    start(containerClassname: string, itemClassname: string, appData: Dataset);
    stop()
}

export enum ImpressionEventType  {
    Impression = "impression"
}