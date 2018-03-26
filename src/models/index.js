const context = require.context('./', false, /\.js$/);
const keys = context.keys().filter(item => item !== './index.js');

const reducers = keys.reduce((memo, key) => {
  const newMemo = memo;
  newMemo[key.match(/([^/]+)\.js$/)[1]] = context(key);
  return newMemo;
}, {});

export default reducers;
