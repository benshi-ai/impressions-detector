import { EventEmitter } from 'events';

import { Dataset } from './typings'

export enum ImpressionObservedTypes {
    View = 'view',
    Hide = 'hide'
}

declare interface BsViewableImpressionObserver {
    on<U extends keyof BsViewableImpressionObserverEvents>(
        event: U, listener: BsViewableImpressionObserverEvents[U]
    ): this;

    emit<U extends keyof BsViewableImpressionObserverEvents>(
        event: U, ...args: Parameters<BsViewableImpressionObserverEvents[U]>
    ): boolean;
}

interface BsViewableImpressionObserverEvents {
    [ImpressionObservedTypes.View]: (id: string, item: Dataset) => void,
    [ImpressionObservedTypes.Hide]: (id: string) => void
}

class BsViewableImpressionObserver extends EventEmitter {
    private mutationObserver = null
    private intersectionObserver = null
    private containerSelector = ''
    private itemSelector = ''

    constructor() {
        super()

        let intersectionObserverOptions = {
            root: null,
            rootMargin: "0px",
            threshold: 1
        };
        this.intersectionObserver = new IntersectionObserver(
            (entries, observer) => this.intersectionHandler(entries, observer),
            intersectionObserverOptions
        );
    }

    intersectionHandler(entries, observer) {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                this.emit(ImpressionObservedTypes.View, entry.target.dataset.logId, entry.target.dataset)
            } else {
                this.emit(ImpressionObservedTypes.Hide, entry.target.dataset.logId)
            }
        })
    }

    start(containerClassname, itemClassname) {
        this.containerSelector = `.${containerClassname}`
        this.itemSelector = `.${itemClassname}`

        const addItemsToIntersectionObserver = () => {
            document.querySelectorAll(`${this.containerSelector} ${this.itemSelector}`)
                .forEach(element => {
                    this.intersectionObserver.observe(element)
                })
        }

        const target = document.querySelector(this.containerSelector);

        if (target === null) {
            throw new Error('container-does-not-exist')
        }

        // if the items are already there when this function is called, they will not
        // be added to intersection observer, so we need to do it manually
        addItemsToIntersectionObserver()

        this.mutationObserver = new MutationObserver(mutations => {

            // we don't care specific changes per mutation,
            // just know what are the new items
            this.intersectionObserver.disconnect() // to avoid having more than one observer per item

            // within the container we are only interested in those child elements
            // that matches the itemSelector
            addItemsToIntersectionObserver()

        });

        const config = {
            attributes: true,
            childList: true,
            characterData: true
        };

        this.mutationObserver.observe(target, config);
    }

    stop() {
        this.mutationObserver.disconnect();

        document.querySelectorAll(`${this.containerSelector} ${this.itemSelector}`)
            .forEach(element => this.intersectionObserver.unobserve(element))

    }
}

export default BsViewableImpressionObserver