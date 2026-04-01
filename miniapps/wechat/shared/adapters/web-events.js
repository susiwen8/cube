var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var web_events_exports = {};
__export(web_events_exports, {
  getWebTouchPoint: () => getWebTouchPoint
});
module.exports = __toCommonJS(web_events_exports);
function getWebTouchPoint(event = {}) {
  const touch = event.changedTouches && event.changedTouches[0] || event.touches && event.touches[0] || event;
  return {
    x: touch.clientX ?? touch.pageX ?? touch.x ?? 0,
    y: touch.clientY ?? touch.pageY ?? touch.y ?? 0
  };
}
