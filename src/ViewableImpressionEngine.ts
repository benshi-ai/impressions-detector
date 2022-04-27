import { EventEmitter } from 'events'
import BsViewableImpressionObserver, { ImpressionObservedTypes } from './ViewableImpressionObserver'

import { 
    Dataset, 
    IImpression, 
    IImpressionManager, 
    ImpressionEventType, 
    ViewableImpressionOptions
} from './typings';

declare interface ViewableImpressionEngine {
    on<U extends keyof BsViewableImpressionManagerEvents>(
        event: U, listener: BsViewableImpressionManagerEvents[U]
    ): this;

    emit<U extends keyof BsViewableImpressionManagerEvents>(
        event: U, ...args: Parameters<BsViewableImpressionManagerEvents[U]>
    ): boolean;
}

interface BsViewableImpressionManagerEvents {
    [ImpressionEventType.Impression]: (item: Dataset) => void,
}


class ViewableImpressionEngine extends EventEmitter implements IImpressionManager {
    private alreadyVisibleImpressed
    private pendingImpressions: IImpression | {}
    private impressionObserver = null
    private containerClassname
    private itemClassname
    private appData:any = {}
    private options


    // at least one second in the screen
    constructor(impressionObserver: BsViewableImpressionObserver, options: Partial<ViewableImpressionOptions>) {
        super()
        this.alreadyVisibleImpressed = new Set()
        this.pendingImpressions = {}

        this.options = options

        this.impressionObserver = impressionObserver

        this.impressionObserver.on(ImpressionObservedTypes.View, (id, eventData) => {
            this.add(id, eventData)
        })

        this.impressionObserver.on(ImpressionObservedTypes.Hide, id => {
            this.remove(id)
        })

        setInterval(() => this.triggerPendingImpressions(), this.options.triggerInterval)
    }

    triggerPendingImpressions() {
        const currentTimestamp = Date.now()
        const idsToTrigger = []

        for (const [id, { time_in }] of Object.entries(this.pendingImpressions)) {
            // a potential optimization of this would be to sort the 
            // list by date and stop checking when one does not
            // satisfy the time constraint
            if (currentTimestamp - time_in > this.options.keepVisibleTimeout) {
                idsToTrigger.push(id)
            }
        }

        idsToTrigger.forEach(id => {
            this.alreadyVisibleImpressed.add(id)
            this.emit(ImpressionEventType.Impression, this.pendingImpressions[id].data)

            delete this.pendingImpressions[id]
        })
    }

    start(containerClassname, itemClassname, appData) {
        this.appData = appData
        this.containerClassname = containerClassname
        this.itemClassname = itemClassname
        this.impressionObserver.start(containerClassname, itemClassname)
    }

    stop() {
        this.triggerPendingImpressions()

        this.impressionObserver.stop()

        this.alreadyVisibleImpressed.clear()
        this.pendingImpressions = {}
    }

    restart(appData: any) {
        this.triggerPendingImpressions()
        this.appData = appData

        this.alreadyVisibleImpressed.clear()
        this.pendingImpressions = {}

        this.impressionObserver.stop()
        this.impressionObserver.start(this.containerClassname, this.itemClassname)
    }

    add(id, data: Dataset) {

        if (this.alreadyVisibleImpressed.has(id)) {
            // the item has been already tracked
            return
        }

        if (!this.pendingImpressions[id]) {

            this.pendingImpressions[id] = {
                time_in: Date.now(),
                appData: this.appData,
                data
            }
        }
    }

    remove(id) {
        if (!this.pendingImpressions[id]) {
            return
        }

        // this check is needed in case the interval is still sleeping
        if (Date.now() - this.pendingImpressions[id].time_in > this.options.keepVisibleTimeout) {
            this.emit(ImpressionEventType.Impression, this.pendingImpressions[id].data)
        }

        delete this.pendingImpressions[id]
    }
}

export default ViewableImpressionEngine