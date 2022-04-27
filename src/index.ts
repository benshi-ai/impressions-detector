import { EventEmitter } from 'events'

import BsViewableImpressionObserver from "./ViewableImpressionObserver"

import { 
    Dataset, 
    IImpressionManager, 
    ImpressionEventType, 
    ViewableImpressionOptions
} from "./typings"

import ViewableImpressionEngine from "./ViewableImpressionEngine"

class ImpressionsDetector extends EventEmitter implements IImpressionManager {
    private impressionEngine

    private options: ViewableImpressionOptions = {
        triggerInterval: 2000,
        keepVisibleTimeout: 1000,
        intersectionThreshold: 0.9
    }

    constructor(options?: Partial<ViewableImpressionOptions>) {
        super()

        if (options) {
            this.options = Object.assign(this.options, options)
        }

        if (this.options.intersectionThreshold > 1) {
            this.options.intersectionThreshold = 1
        } else if (this.options.intersectionThreshold < 0.1) {
            this.options.intersectionThreshold = 0.1
        }

        this.impressionEngine = new ViewableImpressionEngine(
            new BsViewableImpressionObserver(this.options.intersectionThreshold), 
            this.options)

        this.impressionEngine.on(ImpressionEventType.Impression, data => {
            this.emit(ImpressionEventType.Impression, data)
        })
    }

    start(containerClassname: string, itemClassname: string, appData: Dataset) {
        this.impressionEngine.start(containerClassname, itemClassname, appData)
    }

    stop() {
        this.impressionEngine.stop()
    }

}

export default ImpressionsDetector