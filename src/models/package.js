import { message } from 'antd';
import fetch from '../utils/request';

const queryPackageScaleList = ({ payload }) => fetch.post('/haierp1/packageScale/queryPackageScaleList', { data: payload }).catch(e => e);
const queryPackageScale = ({ payload }) => fetch.post('/haierp1/packageScale/query', { data: payload }).catch(e => e);
const deletePackageScale = ({ payload }) => fetch.post('/haierp1/packageScale/delete', { data: payload }).catch(e => e);
const updatePackageScale = ({ payload }) => fetch.post('/haierp1/packageScale/update', { data: payload }).catch(e => e);
const addPackageScale = ({ payload }) => fetch.post('/haierp1/packageScale/add', { data: payload }).catch(e => e);
const queryPackageLevelList = ({ payload }) => fetch.post('/haierp1/packageLevel/queryPackageLevelList', { data: payload }).catch(e => e);
const queryPackageLevel = ({ payload }) => fetch.post('/haierp1/packageLevel/query', { data: payload }).catch(e => e);
const deletePackageLevel = ({ payload }) => fetch.post('/haierp1/packageLevel/delete', { data: payload }).catch(e => e);
const updatePackageLevel = ({ payload }) => fetch.post('/haierp1/packageLevel/update', { data: payload }).catch(e => e);
const addPackageLevel = ({ payload }) => fetch.post('/haierp1/packageLevel/add', { data: payload }).catch(e => e);

export default {
  namespace: 'pack',
  state: {
    levelList: [],
    scaleList: [],
    scaleValues: {},
    levelValues: {},
    scaleTotal: 1,
    levelTotal: 1,
    scaleCurrent: 1,
    levelCurrent: 1,
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(({ pathname }) => {
        if (pathname === '/products/packageLevel' && !window.existCacheState('/products/packageLevel')) {
          dispatch({ type: 'queryPackageLevelList', payload: { pageIndex: 1 } });
          dispatch({ type: 'queryPackageScaleList', payload: { pageIndex: 1 } });
        }
        if (pathname === '/products/packageScale' && !window.existCacheState('/products/packageScale')) {
          dispatch({ type: 'queryPackageScaleList', payload: { pageIndex: 1 } });
        }
      });
    },
  },
  effects: {
    * queryPackageScaleList({ payload }, { call, put, select }) {
      let pageIndex = yield select(({ pack }) => pack.scaleList);
      if (payload && payload.pageIndex) {
        pageIndex = payload.pageIndex;
        yield put({ type: 'saveScalePage', payload });
      }
      const data = yield call(queryPackageScaleList, { payload: { ...payload, pageIndex } });
      if (data.success) {
        yield put({ type: 'updateScaleList', payload: data });
      }
    },
    * queryPackageScale({ payload }, { call, put }) { // 类目管理列表
      const data = yield call(queryPackageScale, { payload });
      if (data.success) {
        yield put({
          type: 'saveScale',
          payload: data,
        });
      }
    },
    * addPackageScale({ payload }, { call, put }) {
      const data = yield call(addPackageScale, { payload });
      if (data.success) {
        message.success('新增类别成功');
        yield put({
          type: 'queryPackageScaleList',
          payload: { pageIndex: 1 },
        });
      }
    },
    * deletePackageScale({ payload }, { call, put, select }) {
      const data = yield call(deletePackageScale, { payload });
      if (data.success) {
        message.success('删除类目成功');
        const pack = yield select(model => model.pack);
        if (pack.scaleList.length < 2 && pack.scaleCurrent > 1) {
          yield put({
            type: 'queryPackageScaleList',
            payload: { payload: pack.scaleCurrent - 1 },
          });
          return;
        }
        yield put({
          type: 'queryPackageScaleList',
          payload: { pageIndex: 1 },
        });
      }
    },
    * updatePackageScale({ payload }, { call, put }) {
      const data = yield call(updatePackageScale, { payload });
      if (data.success) {
        message.success('修改类目成功');
        yield put({
          type: 'queryPackageScaleList',
          payload: {},
        });
      }
    },
    * queryPackageLevelList({ payload }, { call, put, select }) {
      let pageIndex = yield select(({ pack }) => pack.levelCurrent);
      if (payload && payload.pageIndex) {
        pageIndex = payload.pageIndex;
        yield put({ type: 'saveLevelPage', payload });
      }
      const data = yield call(queryPackageLevelList, { payload: { ...payload, pageIndex } });
      if (data.success) {
        yield put({ type: 'updateLevelList', payload: data });
      }
    },
    * queryPackageLevel({ payload }, { call, put }) { // 类目管理列表
      const data = yield call(queryPackageLevel, { payload });
      if (data.success) {
        yield put({
          type: 'saveLevel',
          payload: data,
        });
      }
    },
    * addPackageLevel({ payload }, { call, put }) {
      const data = yield call(addPackageLevel, { payload });
      if (data.success) {
        message.success('新增类别成功');
        yield put({
          type: 'queryPackageLevelList',
          payload: { pageIndex: 1 },
        });
      }
    },
    * deletePackageLevel({ payload }, { call, put, select }) {
      const data = yield call(deletePackageLevel, { payload });
      if (data.success) {
        message.success('删除类目成功');
        const pack = yield select(model => model.pack);
        if (pack.levelList.length < 2 && pack.levelCurrent > 1) {
          yield put({
            type: 'queryPackageLevelList',
            payload: { pageIndex: pack.levelCurrent - 1 },
          });
          return;
        }
        yield put({
          type: 'queryPackageLevelList',
          payload: { pageIndex: 1 },
        });
      }
    },
    * updatePackageLevel({ payload }, { call, put }) {
      const data = yield call(updatePackageLevel, { payload });
      if (data.success) {
        message.success('修改类目成功');
        yield put({
          type: 'queryPackageLevelList',
          payload: { pageIndex: 1 },
        });
      }
    },
  },
  reducers: {
    updateScaleList(state, { payload }) {
      return { ...state, scaleList: payload.data, scaleTotal: payload.totalCount };
    },
    saveScale(state, { payload }) {
      return { ...state, scaleValues: payload };
    },
    saveScalePage(state, { payload }) {
      return { ...state, scaleCurrent: payload.pageIndex };
    },
    updateLevelList(state, { payload }) {
      return { ...state, levelList: payload.data, levelTotal: payload.totalCount };
    },
    saveLevel(state, { payload }) {
      return { ...state, levelValues: payload };
    },
    saveLevelPage(state, { payload }) {
      return { ...state, levelCurrent: payload.pageIndex };
    },
  },
};
