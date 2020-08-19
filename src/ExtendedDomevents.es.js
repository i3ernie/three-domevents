import DomEvents from "./Domevents.es.js";
import DomeventDrag from "./domevents/DomeventDrag.es.js";


DomEvents.extend( DomeventDrag );

const ExtendedDomEvents = DomEvents;


export default ExtendedDomEvents;
export { DomEvents, ExtendedDomEvents };