import { message } from 'antd';

import fetch from '../utils/request';

const queryResourceList = ({ payload }) => fetch.post('/haierp1/resourceHai/queryTree', { data: payload }).catch(e => e); // queryList
const addResource = ({ payload }) => fetch.post('/haierp1/resourceHai/add', { data: payload }).catch(e => e);
const updateResource = ({ payload }) => fetch.post('/haierp1/resourceHai/update', { data: payload }).catch(e => e);
const deleteResource = ({ payload }) => fetch.post('/haierp1/resourceHai/delete', { data: payload }).catch(e => e);
const queryResource = ({ payload }) => fetch.post('/haierp1/resourceHai/query', { data: payload }).catch(e => e);
const queryRoleList = ({ payload }) => fetch.post('/haierp1/roleHai/queryList', { data: payload }).catch(e => e);
const addRole = ({ payload }) => fetch.post('/haierp1/roleHai/add', { data: payload }).catch(e => e);
const updateRole = ({ payload }) => fetch.post('/haierp1/roleHai/update', { data: payload }).catch(e => e);
const deleteRole = ({ payload }) => fetch.post('/haierp1/roleHai/delete', { data: payload }).catch(e => e);
const queryRole = ({ payload }) => fetch.post('/haierp1/roleHai/query', { data: payload }).catch(e => e);
const queryUserList = ({ payload }) => fetch.post('/haierp1/userHai/queryList', { data: payload }).catch(e => e);
const addUser = ({ payload }) => fetch.post('/haierp1/userHai/add', { data: payload }).catch(e => e);
const updateUser = ({ payload }) => fetch.post('/haierp1/userHai/update', { data: payload }).catch(e => e);
const deleteUser = ({ payload }) => fetch.post('/haierp1/userHai/delete', { data: payload }).catch(e => e);
const queryUser = ({ payload }) => fetch.post('/haierp1/userHai/query', { data: payload }).catch(e => e);
const queryOrgList = ({ payload }) => fetch.post('/haierp1/organizationHai/queryList', { data: payload }).catch(e => e);
const addOrg = ({ payload }) => fetch.post('/haierp1/organizationHai/add', { data: payload }).catch(e => e);
const updateOrg = ({ payload }) => fetch.post('/haierp1/organizationHai/update', { data: payload }).catch(e => e);
const deleteOrg = ({ payload }) => fetch.post('/haierp1/organizationHai/delete', { data: payload }).catch(e => e);
const queryOrg = ({ payload }) => fetch.post('/haierp1/organizationHai/query', { data: payload }).catch(e => e);
// 角色授权
const authRole = ({ payload }) => fetch.post('/haierp1/roleHai/updateGrant', { data: payload }).catch(e => e);

export default {
  namespace: 'permission',
  state: {
    resourceList: [],
    resourceTotal: 1,
    resourceCurrentPage: 1,
    resourceExpandedKeys: [],
    resourceModal: {},
    roleList: [],
    roleTotal: 1,
    roleCurrentPage: 1,
    roleModal: {},
    userList: [],
    userTotal: 1,
    userCurrentPage: 1,
    userModal: {},
    orgList: [],
    orgTotal: 1,
    orgCurrentPage: 1,
    orgModal: {},
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (pathname === '/permission/resource' && !window.existCacheState('/permission/resource')) {
          setTimeout(() => {
            dispatch({ type: 'queryResourceList', payload: {} });
          }, 0);
        }
        if (pathname === '/permission/role' && !window.existCacheState('/permission/role')) {
          setTimeout(() => {
            dispatch({ type: 'queryRoleList', payload: {} });
          }, 0);
        }
        if (pathname === '/permission/user' && !window.existCacheState('/permission/user')) {
          setTimeout(() => {
            dispatch({ type: 'queryUserList', payload: {} });
            dispatch({ type: 'queryOrgList', payload: {} });
            dispatch({ type: 'queryRoleList', payload: {} });
          }, 0);
        }
        if (pathname === '/permission/organization' && !window.existCacheState('/permission/organization')) {
          setTimeout(() => {
            dispatch({ type: 'queryOrgList', payload: {} });
          }, 0);
        }
      });
    },
  },
  effects: {
    * queryResourceList({ payload }, { call, put, select }) {
      let pageIndex = yield select(({ permission }) => permission.resourceCurrentPage);
      if (payload && payload.pageIndex) {
        pageIndex = payload.pageIndex;
        yield put({ type: 'saveResourceCurrentPage', payload });
      }
      const data = yield call(queryResourceList, { payload: { ...payload, pageIndex } });
      if (data.success) {
        yield put({
          type: 'updateResourceList',
          payload: data,
        });
      }
    },
    * queryResource({ payload }, { call, put }) { // 类目管理列表
      const data = yield call(queryResource, { payload });
      if (data.success) {
        yield put({
          type: 'saveResource',
          payload: data,
        });
      }
    },
    * addResource({ payload }, { call, put }) {
      const data = yield call(addResource, { payload });
      if (data.success) {
        message.success('新增资源成功');
        yield put({
          type: 'queryResourceList',
          payload: {},
        });
      }
    },
    * deleteResource({ payload }, { call, put, select }) {
      const data = yield call(deleteResource, { payload });
      if (data.success) {
        message.success('删除资源成功');
        const resource = yield select(model => model.permission);
        if (resource.resourceList.length < 2 && resource.resourceCurrentPage > 1) {
          yield put({
            type: 'queryResourceList',
            payload: { payload: resource.resourceCurrentPage - 1 },
          });
          return;
        }
        yield put({
          type: 'queryResourceList',
          payload: {},
        });
      }
    },
    * updateResource({ payload }, { call, put }) {
      const data = yield call(updateResource, { payload });
      if (data.success) {
        message.success('修改资源成功');
        yield put({
          type: 'queryResourceList',
          payload: {},
        });
      }
    },
    * queryRoleList({ payload }, { call, put, select }) {
      let pageIndex = yield select(({ permission }) => permission.roleCurrentPage);
      if (payload && payload.pageIndex) {
        pageIndex = payload.pageIndex;
        yield put({ type: 'saveRoleCurrentPage', payload });
      }
      const data = yield call(queryRoleList, { payload: { ...payload, pageIndex } });
      if (data.success) {
        yield put({
          type: 'updateRoleList',
          payload: data,
        });
      }
    },
    * queryRole({ payload }, { call, put }) { // 类目管理列表
      const data = yield call(queryRole, { payload });
      if (data.success) {
        yield put({
          type: 'saveRole',
          payload: data,
        });
      }
    },
    * addRole({ payload }, { call, put }) {
      const data = yield call(addRole, { payload });
      if (data.success) {
        message.success('新增角色成功');
        yield put({
          type: 'queryRoleList',
          payload: {},
        });
      }
    },
    * deleteRole({ payload }, { call, put, select }) {
      const data = yield call(deleteRole, { payload });
      if (data.success) {
        message.success('删除角色成功');
        const role = yield select(model => model.permission);
        if (role.roleList.length < 2 && role.roleCurrentPage > 1) {
          yield put({
            type: 'queryRoleList',
            payload: { payload: role.roleCurrentPage - 1 },
          });
          return;
        }
        yield put({
          type: 'queryRoleList',
          payload: {},
        });
      }
    },
    * updateRole({ payload }, { call, put }) {
      const data = yield call(updateRole, { payload });
      if (data.success) {
        message.success('修改角色成功');
        yield put({
          type: 'queryRoleList',
          payload: {},
        });
      }
    },
    * authRole({ payload }, { call, put }) {
      const data = yield call(authRole, { payload });
      if (data.success) {
        message.success('授权成功');
        yield put({
          type: 'queryRoleList',
          payload: {},
        });
      }
    },
    * queryUserList({ payload }, { call, put, select }) {
      let pageIndex = yield select(({ permission }) => permission.resourceCurrentPage);
      if (payload && payload.pageIndex) {
        pageIndex = payload.pageIndex;
        yield put({ type: 'saveUserCurrentPage', payload });
      }
      const data = yield call(queryUserList, { payload: { ...payload, pageIndex } });
      if (data.success) {
        yield put({
          type: 'updateUserList',
          payload: data,
        });
      }
    },
    * queryUser({ payload }, { call, put }) { // 类目管理列表
      const data = yield call(queryUser, { payload });
      if (data.success) {
        yield put({
          type: 'saveUser',
          payload: data,
        });
      }
    },
    * addUser({ payload }, { call, put }) {
      const data = yield call(addUser, { payload });
      if (data.success) {
        message.success('新增用户成功');
        yield put({
          type: 'queryUserList',
          payload: {},
        });
      }
    },
    * deleteUser({ payload }, { call, put, select }) {
      const data = yield call(deleteUser, { payload });
      if (data.success) {
        message.success('删除用户成功');
        const resource = yield select(model => model.permission);
        if (resource.resourceList.length < 2 && resource.resourceCurrentPage > 1) {
          yield put({
            type: 'queryUserList',
            payload: { payload: resource.resourceCurrentPage - 1 },
          });
          return;
        }
        yield put({
          type: 'queryUserList',
          payload: {},
        });
      }
    },
    * updateUser({ payload }, { call, put }) {
      const data = yield call(updateUser, { payload });
      if (data.success) {
        message.success('修改用户成功');
        yield put({
          type: 'queryUserList',
          payload: {},
        });
      }
    },
    * queryOrgList({ payload }, { call, put, select }) {
      let pageIndex = yield select(({ permission }) => permission.roleCurrentPage);
      if (payload && payload.pageIndex) {
        pageIndex = payload.pageIndex;
        yield put({ type: 'saveOrgCurrentPage', payload });
      }
      const data = yield call(queryOrgList, { payload: { ...payload, pageIndex } });
      if (data.success) {
        yield put({
          type: 'updateOrgList',
          payload: data,
        });
      }
    },
    * queryOrg({ payload }, { call, put }) { // 类目管理列表
      const data = yield call(queryOrg, { payload });
      if (data.success) {
        yield put({
          type: 'saveOrg',
          payload: data,
        });
      }
    },
    * addOrg({ payload }, { call, put }) {
      const data = yield call(addOrg, { payload });
      if (data.success) {
        message.success('新增机构成功');
        yield put({
          type: 'queryOrgList',
          payload: {},
        });
      }
    },
    * deleteOrg({ payload }, { call, put, select }) {
      const data = yield call(deleteOrg, { payload });
      if (data.success) {
        message.success('删除机构成功');
        const role = yield select(model => model.permission);
        if (role.roleList.length < 2 && role.roleCurrentPage > 1) {
          yield put({
            type: 'queryOrgList',
            payload: { payload: role.roleCurrentPage - 1 },
          });
          return;
        }
        yield put({
          type: 'queryOrgList',
          payload: {},
        });
      }
    },
    * updateOrg({ payload }, { call, put }) {
      const data = yield call(updateOrg, { payload });
      if (data.success) {
        message.success('修改机构成功');
        yield put({
          type: 'queryOrgList',
          payload: {},
        });
      }
    },
  },
  reducers: {
    updateResourceList(state, { payload }) {
      const expandedKeys = [];
      function iter(list) {
        list.forEach((el) => {
          expandedKeys.push(el.id);
          if (el.childList && el.childList.length > 0) {
            el.children = el.childList;
            iter(el.children);
          }
          delete el.childList;
        });
      }
      iter(payload.data);
      return { ...state, resourceList: payload.data, resourceExpandedKeys: expandedKeys, resourceTotal: payload.totalCount };
    },
    saveResourceCurrentPage(state, { payload }) {
      return { ...state, resourceCurrentPage: payload.pageIndex };
    },
    saveResource(state, { payload }) {
      return { ...state, resourceModal: payload.data };
    },
    updateRoleList(state, { payload }) {
      return { ...state, roleList: payload.data, roleTotal: payload.totalCount };
    },
    saveRoleCurrentPage(state, { payload }) {
      return { ...state, roleCurrentPage: payload.pageIndex };
    },
    saveRole(state, { payload }) {
      return { ...state, roleModal: payload.data };
    },
    updateUserList(state, { payload }) {
      return { ...state, userList: payload.data, userTotal: payload.totalCount };
    },
    saveUserCurrentPage(state, { payload }) {
      return { ...state, userCurrentPage: payload.pageIndex };
    },
    saveUser(state, { payload }) {
      return { ...state, userModal: payload.data };
    },
    updateOrgList(state, { payload }) {
      return { ...state, orgList: payload.data, orgTotal: payload.totalCount };
    },
    saveOrgCurrentPage(state, { payload }) {
      return { ...state, orgCurrentPage: payload.pageIndex };
    },
    saveOrg(state, { payload }) {
      return { ...state, orgModal: payload.data };
    },
  },
};
