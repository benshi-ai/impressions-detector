import { EventEmitter } from 'events'

import BsViewableImpressionObserver from "./ViewableImpressionObserver"

import { 
    Dataset, 
    IImpressionManager, 
    ImpressionEventType 
} from "./typings"

import ViewableImpressionEngine from "./ViewableImpressionEngine"

class ImpressionsDetector extends EventEmitter implements IImpressionManager {
    private impressionEngine

    constructor() {
        super()
        this.impressionEngine = new ViewableImpressionEngine(new BsViewableImpressionObserver())

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