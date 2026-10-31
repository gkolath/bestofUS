// Tailwind build config. Colours and fonts come from js/theme.js so there is one source of truth.
global.window = global.window || {};
require('./js/theme.js');
module.exports = {
  content: ['./index.html', './js/*.js'],
  theme: { extend: global.window.USTWO_THEME }
};
