/**
 * @jest-environment jsdom
 */
import ViewableImpressionManager from "./ViewableImpressionEngine"
import { ImpressionEventType } from "./typings"

// time, in millis, to be sure that the "expect" is not called at the same time than the timeout
const delta = 100 

describe('ViewableImpressionManager', () => {
    it('Should trigger an impression event when a item has been detected - just one time', async () => {
        let mockObserver = {
            on: jest.fn(),
        }

        let hideCallback, showCallback;
        let impressionCallback = jest.fn()

        mockObserver.on.mockImplementation((event, cb) => {
            if (event === 'hide') {
                hideCallback = cb
            } else {
                showCallback = cb
            }
        })

        const config = {
            triggerInterval: 200,
            keepVisibleTimeout: 100
        }

        const impressionManager = new ViewableImpressionManager(mockObserver as any, config)

        impressionManager.on(ImpressionEventType.Impression, impressionCallback)

        const eventData = {
            id: '12',
            currency: 'EUR',
            price: 100,
            quantity: 2,
            stock_status: 'in_stock'
        }

        // emulates the ImpressionObserver
        showCallback('12', eventData)

        // timeout to wait for the triggerInterval
        await new Promise((r) => setTimeout(r, config.triggerInterval + delta));

        expect(impressionCallback).toBeCalledTimes(1)
        expect(impressionCallback).toBeCalledWith(eventData)
    })

    it('Should not trigger an impression event when a item has been detected and removed before one second', async () => {
        let mockObserver = {
            on: jest.fn(),
        }

        let hideCallback, showCallback;
        let impressionCallback = jest.fn()

        mockObserver.on.mockImplementation((event, cb) => {
            if (event === 'hide') {
                hideCallback = cb
            } else {
                showCallback = cb
            }
        })

        const config = {
            triggerInterval: 200,
            keepVisibleTimeout: 100
        }

        const impressionManager = new ViewableImpressionManager(mockObserver as any, config)

        impressionManager.on(ImpressionEventType.Impression, impressionCallback)

        const eventData = {
            id: '12',
            currency: 'EUR',
            price: 100,
            quantity: 2,
            stock_status: 'in_stock'
        }

        // emulates the ImpressionObserver
        showCallback('12', eventData)
        hideCallback('12')

        await new Promise((r) => setTimeout(r, config.triggerInterval + 100)); // wait to be sure than the interval check has been fired

        expect(impressionCallback).toBeCalledTimes(0)
    })

    it('Should trigger an impression event with only one item even it appears several times', async () => {
        let mockObserver = {
            on: jest.fn(),
        }

        let hideCallback, showCallback;
        let impressionCallback = jest.fn()

        mockObserver.on.mockImplementation((event, cb) => {
            if (event === 'hide') {
                hideCallback = cb
            } else {
                showCallback = cb
            }
        })
        const config = {
            triggerInterval: 200,
            keepVisibleTimeout: 100
        }
        const impressionManager = new ViewableImpressionManager(mockObserver as any, config)

        impressionManager.on(ImpressionEventType.Impression, impressionCallback)

        const eventData = {
            id: '12',
            currency: 'EUR',
            price: 100,
            quantity: 2,
            stock_status: 'in_stock'
        }

        // emulates the ImpressionObserver
        showCallback('12', eventData)

        await new Promise((r) => setTimeout(r, config.keepVisibleTimeout + delta));
        hideCallback('12')
        showCallback('12', eventData)
        await new Promise((r) => setTimeout(r, config.keepVisibleTimeout + delta));

        expect(impressionCallback).toBeCalledTimes(1)
        expect(impressionCallback).toBeCalledWith(eventData)
    }, 10000)


    it('Should trigger an impression event when it has been removed from screen but the checking interval not fired yet', async () => {
        let mockObserver = {
            on: jest.fn(),
        }

        let hideCallback, showCallback;
        let impressionCallback = jest.fn()

        mockObserver.on.mockImplementation((event, cb) => {
            if (event === 'hide') {
                hideCallback = cb
            } else {
                showCallback = cb
            }
        })

        const config = {
            triggerInterval: 200,
            keepVisibleTimeout: 100
        }
        const impressionManager = new ViewableImpressionManager(mockObserver as any, config)

        impressionManager.on(ImpressionEventType.Impression, impressionCallback)

        const eventData = {
            id: '12',
            currency: 'EUR',
            price: 100,
            quantity: 2,
            stock_status: 'in_stock'
        }

        // emulates the ImpressionObserver
        showCallback('12', eventData)

        await new Promise((r) => setTimeout(r, config.keepVisibleTimeout + delta));  // a bit more than a second, which is the time to consider it as impression
        hideCallback('12')

        expect(impressionCallback).toBeCalledTimes(1)
        expect(impressionCallback).toBeCalledWith(eventData)
    }, 10000)

    it('Should trigger again same IDs after restarting', async () => {
        let mockObserver = {
            on: jest.fn(),
            start: jest.fn(),
            stop: jest.fn()
        }

        let hideCallback, showCallback;
        let impressionCallback = jest.fn()

        mockObserver.on.mockImplementation((event, cb) => {
            if (event === 'hide') {
                hideCallback = cb
            } else {
                showCallback = cb
            }
        })

        const config = {
            triggerInterval: 200,
            keepVisibleTimeout: 100
        }

        const impressionManager = new ViewableImpressionManager(mockObserver as any, config)

        impressionManager.on(ImpressionEventType.Impression, impressionCallback)

        impressionManager.start('aaa', 'bb', 'searchId-1')

        const eventData = {
            id: '12',
            currency: 'EUR',
            price: 100,
            quantity: 2,
            stock_status: 'in_stock'
        }

        // emulates the ImpressionObserver
        showCallback('12', eventData)

        await new Promise((r) => setTimeout(r, config.keepVisibleTimeout + delta));

        impressionManager.restart('searchId-2')

        showCallback('12', eventData)

        await new Promise((r) => setTimeout(r, config.triggerInterval + delta));

        expect(impressionCallback).toBeCalledTimes(2)
    })
})

