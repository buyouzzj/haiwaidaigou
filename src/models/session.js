import { message } from 'antd';
import { backendCfg, routerCfg, setNavigation, originalNavigation } from '../constants';
import fetch from '../utils/request';

const login = ({ payload }) => fetch.post('/haierp1/haiLogin/login', { data: payload }).catch(e => e);
const logout = ({ payload }) => fetch.post('/haierp1/logout', { data: payload }).catch(e => e);
const queryPermissions = () => fetch.post('/haierp1/user/resCodes').catch(e => e);

export default {
  namespace: 'session',
  state: {
    username: localStorage.getItem('HAIERP_LAST_USERNAME'),
    dataSource: [],
  },
  reducers: {
    updateUsername(state, { payload }) {
      return { ...state, username: payload };
    },
  },
  effects: {
    * logout(payload, { call }) {
      yield call(logout, payload);
    },
    * login(payload, { call, put }) {
      const data = yield call(login, payload);
      if (data.success) {
        const permissionData = yield call(queryPermissions);
        // 先处理权限
        if (permissionData.success) {
          const permissions = [...permissionData.data, routerCfg.OVERVIEW];
          const newNavigation = [];
          originalNavigation.forEach((el) => {
            if (permissions.indexOf(backendCfg[el.key]) === -1) {
              return;
            }
            if (!el.child || el.child.length === 0) {
              newNavigation.push(el);
              return;
            }
            // 有子代的，还要判断子代
            const child = el.child;
            const newChild = [];
            child.forEach((c) => {
              if (permissions.indexOf(backendCfg[c.key]) >= 0) {
                newChild.push(c);
              }
            });
            const newEl = { ...el, child: newChild };
            newNavigation.push(newEl);
          });

          setNavigation(newNavigation);

          localStorage.setItem('HAIERP_LAST_LOGIN', new Date().getTime());
          localStorage.setItem('HAIERP_LAST_PERMISSION', JSON.stringify(newNavigation));
          localStorage.setItem('HAIERP_LAST_USERNAME', payload.payload.username);

          // 更新用户名
          yield put({ type: 'updateUsername', payload: payload.payload.username });

          window.redirector(`/${routerCfg.OVERVIEW}`);
        }
      } else message.error(data.data);
    },
  },
  subscriptions: {
    setup({ history }) {
      return history.listen(({ pathname }) => {
        if (pathname === `/${routerCfg.LOGIN}`) {
          localStorage.removeItem('HAIERP_LAST_LOGIN');
        }
      });
    },
  },
};
