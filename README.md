# ImpressionsDetector
This library tracks `viewable impressions`. According to the Interactive Advertising Bureau (IAB) and Media Rating Council (MRC), an screen element is counted as viewable when at least 50% of its area is visible on the screen for at least one second.

The implementation is based in latest web APIs, like `MutationObserver` and `IntersectionObserver`. It trigger an event for those elements that are detected as `viewable impression`, with next constraints:

* during a session (between `start` and `restart`/`close`), elements are only reported once. If the user scrolls the view and then come back to the original position, the elements won't be triggered again.
* screen time is not cumulative (if an element appears several times in the screen, but none of them the time is higher than the minimum required to be considered `viewable`, it won't trigger an event even if the sum of times is higher)

## Usage
The library triggers an event whenever an item is detected as `viewable impression`. 

Given an HTML structure like this:
```html

    <div class="container">
        <div 
            class="item-element"
            data-log-id='unique-element-id'
            data-key1="value11"
            data-key2="value21">
        </div>

        <div 
            class="item-element" 
            data-log-id='unique-element-id'
            data-key1="value12"
            data-key2="value22">
        </div>
    </div>
```


```js
import ImpressionsDetector, { ImpressionEventType } from "@benshi.ai/impressions-detector";

const impressionsDetector = new ImpressionsDetector()

const yourData = {
    anyKey: "anyValue"
}

impressionsDetector.start("container", "item-element", yourData)

impressionsDetector.on(ImpressionEventType.Impression, (dataset, yourData) => { /* ... */}
```

Note the callbacks parameters `dataset` and `appData`:
* `dataset` contains all the elements within the HTML element dataset. For example, for the first `div` it will contain:
    ```js 
    {
        "id": "unique-element-id"
        "key1": "value11"
        "key2": "value21"
    }
    ```
* `yourData` is an arbitrary object. Depending on the application use case it may be interesting to share information between the code that initializes the `impressionDetector` and the code that receives the events

> **note that the key `log-id` is mandatory**

## Configuration
Some parameters may be adapted to the application needs. The configuration options accepted by `ImpressionsDetector` are:

```js

const options = {
        triggerInterval: 2000,
        keepVisibleTimeout: 1000,
        intersectionThreshold: 0.9
    }
}

const impressionsDetector = new ImpressionsDetector(options)
```

where:

* `triggerInterval` [__default: 2000_] The library triggers events each `triggerInterval` milliseconds.
* `keepVisibleTimeout` [__default: 1000_] Time that an item must remain visible to trigger an event. Time 
* `intersectionThreshold` [__default:0.9_] Porcentage of visible area to be considered an impression.

## API

* `start(containerClassname, itemClassname, applicationData)`. The container defined by `containerClassname` must exist at the time of calling this function. `itemClassname` refers to any child element, regardless it exists or not at the moment of calling this function.
* `restart(applicationData)`. The session is restarted, that is, items that have been already triggered will be triggered again if they remain the needed time in the screen. You can pass the same `applicationData` or other.
* `close`. Close the session. No events will be triggered from this moment.

