const { createMiniappPage } = require('../../shared/adapters/miniapp-page.js');

Page(
  createMiniappPage({
    storageBackend: {
      getItem(key) {
        const result = my.getStorageSync({ key });
        return result && result.data;
      },
      setItem(key, value) {
        my.setStorageSync({ key, data: value });
      },
    },
    createCanvasContext() {
      return my.createCanvasContext('cubeCanvas');
    },
    measureElementRect(_page, selector, callback) {
      my.createSelectorQuery()
        .select(selector)
        .boundingClientRect()
        .exec((result) => {
          callback(result && result[0]);
        });
    },
    getTouchPoint(event) {
      const touches = event.changedTouches || event.touches || [];
      const touch = touches[0] || { pageX: 0, pageY: 0 };

      return {
        x: touch.pageX || touch.clientX || touch.x || 0,
        y: touch.pageY || touch.clientY || touch.y || 0,
      };
    },
  }),
);
