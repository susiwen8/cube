const { createMiniappPage } = require('../../shared/adapters/miniapp-page.js');

Page(
  createMiniappPage({
    storageBackend: {
      getItem(key) {
        return wx.getStorageSync(key);
      },
      setItem(key, value) {
        wx.setStorageSync(key, value);
      },
    },
    createCanvasContext(page) {
      return wx.createCanvasContext('cubeCanvas', page);
    },
    measureElementRect(page, selector, callback) {
      wx.createSelectorQuery()
        .in(page)
        .select(selector)
        .boundingClientRect((rect) => {
          callback(rect);
        })
        .exec();
    },
    getTouchPoint(event) {
      const touch =
        (event.changedTouches && event.changedTouches[0]) ||
        (event.touches && event.touches[0]) ||
        { pageX: 0, pageY: 0 };

      return {
        x: touch.pageX ?? touch.clientX ?? touch.x ?? 0,
        y: touch.pageY ?? touch.clientY ?? touch.y ?? 0,
      };
    },
  }),
);
