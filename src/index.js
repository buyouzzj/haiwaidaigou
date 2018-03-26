import dva from 'dva';
import { hashHistory } from 'dva/router';
import { message, Modal } from 'antd';
import moment from 'moment';
import 'moment/locale/zh-cn';
import models from './models';
import fetch from './utils/request';
import utilRegister from './utils';
import { setNavigation } from './constants';
import './index.html';
import './index.less';

moment.locale('zh-cn');

// 开启ajax格式验证
fetch.onError((err) => {
  message.error(err.errorMsg || '请求失败');
  if (err.errorCode === 'SESSION_TIMEOUT') {
    location.reload();
  }
  if (err.errorCode === 'NO_PERMISSION') {
    Modal.error({
      title: '权限不足',
      content: '权限不足',
    });
  }
});

message.config({
  duration: 3,
});

// 注册辅助方法
utilRegister();

// 获取权限缓存
const permissionCache = localStorage.getItem('HAIERP_LAST_PERMISSION');
if (permissionCache) {
  setNavigation(JSON.parse(permissionCache));
}

// 1. Initialize
const app = dva({
  history: hashHistory,
  // onError(e) {
  //   message.error(e.message, ERROR_MSG_DURATION);
  // },
});

// 2. Plugins

// 3. Model
Object.keys(models).forEach((key) => {
  app.model(models[key]);
});

// 4. Router
app.router(require('./router'));

// 5. Start
app.start('#root');

window.redirector = (url) => {
  location.href = `#${url}`;
};
