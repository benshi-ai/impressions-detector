import BsViewableImpressionObserver from "../BsViewableImpressionObserver"
import { Dataset, IImpressionManager } from "../typings"
import ViewableImpressionEngine from "../ViewableImpressionEngine"

class ImpressionsDetector implements IImpressionManager {
    private impressionEngine

    constructor() {
        this.impressionEngine = new ViewableImpressionEngine(new BsViewableImpressionObserver())
    }

    start(containerClassname: string, itemClassname: string, appData: Dataset) {
        console.log('¡¡¡Starting impressions from wrapper!!!')
        this.impressionEngine.start(containerClassname, itemClassname, appData)
    }

    stop() {
        this.impressionEngine.stop()
    }
}

export default ImpressionsDetector