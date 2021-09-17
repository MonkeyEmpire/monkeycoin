const interval = 5000;
import AvalancheToBscBridge from "./bridge/AvalancheToBSCBridge"
import BSCToAvalancheBridge from "./bridge/BSCToAvalancheBridge"

const avalancheToBscBridge = new AvalancheToBscBridge(interval)
const bscToAvalancheBridge = new BSCToAvalancheBridge(interval)

avalancheToBscBridge.start()

// timeout of half an interval so both listeners don't run at the same time
setTimeout(
    () => {
        bscToAvalancheBridge.start()
    }, interval / 2
)
