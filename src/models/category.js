import { message } from 'antd';
import fetch from '../utils/request';

const addCate = ({ payload }) => fetch.post('/haierp1/category/add', { data: payload }).catch(e => e);
const queryCateList = ({ payload }) => fetch.post('/haierp1/category/queryList', { data: payload }).catch(e => e);
const queryCate = ({ payload }) => fetch.post('/haierp1/category/query', { data: payload }).catch(e => e);
const updateCate = ({ payload }) => fetch.post('/haierp1/category/update', { data: payload }).catch(e => e);
const deleteCate = ({ payload }) => fetch.post('/haierp1/category/delete', { data: payload }).catch(e => e);


export default {
  namespace: 'cate',
  state: {
    cateList: [],
    cate: {},
  },
  reducers: {
    saveCateList(state, { payload }) {
      return { ...state, cateList: payload.data };
    },
    saveCate(state, { payload }) {
      return { ...state, cate: payload };
    },
  },
  effects: {
    * addCate({ payload }, { call, put }) { // 新建SKU
      const data = yield call(addCate, { payload });
      if (data.success) {
        message.success('新增类目成功');
        yield put({
          type: 'queryCateList',
          payload: {},
        });
      }
    },
    * queryCate({ payload }, { call, put }) {
      const data = yield call(queryCate, { payload });
      if (data.success) {
        yield put({
          type: 'saveCate',
          payload: data,
        });
      }
    },
    * updateCate({ payload }, { call, put }) {
      const data = yield call(updateCate, { payload });
      if (data.success) {
        message.success('修改类目成功');
        yield put({
          type: 'queryCateList',
          payload: {},
        });
      }
    },
    * queryCateList({ payload }, { call, put }) { // 类目管理列表
      const data = yield call(queryCateList, { payload });
      if (data.success) {
        yield put({
          type: 'saveCateList',
          payload: data,
        });
      }
    },
    * deleteCate({ payload }, { call, put }) {
      const data = yield call(deleteCate, { payload });
      if (data.success) {
        message.success('删除类目成功');
        yield put({
          type: 'queryCateList',
          payload: {},
        });
      }
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === '/products/cateList' && !window.existCacheState('/products/cateList')) {
          setTimeout(() => {
            dispatch({ type: 'queryCateList', payload: query });
          }, 0);
        }
      });
    },
  },
};
