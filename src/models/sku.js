import { message } from 'antd';
import fetch from '../utils/request';

const addSku = ({ payload }) => fetch.post('/haierp1/itemSku/add', { data: payload }).catch(e => e);
const updateSku = ({ payload }) => fetch.post('/haierp1/itemSku/update', { data: payload }).catch(e => e);
const querySku = ({ payload }) => fetch.post('/haierp1/itemSku/query', { data: payload }).catch(e => e);
const querySkuList = ({ payload }) => fetch.post('/haierp1/itemSku/queryItemSkuList', { data: payload }).catch(e => e);
const querySkuList2 = ({ payload }) => fetch.post('/haierp1/purchase/queryItemSkuList', { data: payload }).catch(e => e);
const deleteSku = ({ payload }) => fetch.post('/haierp1/itemSku/delete', { data: payload }).catch(e => e);
const queryPackageScales = () => fetch.post('/haierp1/freight/getPackageScaleList').catch(e => e);
const queryScaleTypes = () => fetch.post('/haierp1/itemSku/scaleTypeList').catch(e => e);
const queryItemList = ({ payload }) => fetch.post('/haierp1/item/queryItemList', { data: payload }).catch(e => e);
const lockVirtualInv = ({ payload }) => fetch.post('/haierp1/itemSku/lockedVirtualInv', { data: payload }).catch(e => e);

export default {
  namespace: 'sku',
  state: {
    skuList: [],
    skuPageSize: 20,
    skuTotal: 0,
    skuData: {},
    currentPage: 1,
    currentPageSkuIndex: 1,
    pageSize: 20,
    packageScales: [],
    scaleTypes: [],
  },
  reducers: {
    saveSku(state, { payload }) {
      return { ...state, skuData: payload };
    },
    saveSkuPageSize(state, { payload }) {
      return { ...state, skuPageSize: payload.pageSize };
    },
    saveItemSkuList(state, { payload }) {
      return { ...state, skuList: payload.data, skuTotal: payload.totalCount };
    },
    saveCurrentPage(state, { payload }) {
      return { ...state, currentPage: payload.pageIndex };
    },
    saveCurrentPageSkuIndex(state, { payload }) {
      return { ...state, currentPageSkuIndex: payload.pageIndex };
    },
    savePageSize(state, { payload }) {
      return { ...state, pageSize: payload.pageSize };
    },
    savePackageScales(state, { payload }) {
      // 预处理数据
      return {
        ...state,
        packageScales: payload.data.data.map((el) => {
          el.label = el.name;
          el.value = el.id;
          el.children = el.packageLevels;
          el.children.forEach((child) => {
            child.label = child.name;
            child.value = child.id;
          });
          return el;
        }),
      };
    },
    saveScaleTypes(state, { payload }) {
      return { ...state, scaleTypes: payload.data.data };
    },
  },
  effects: {
    * lockVirtualInv({ payload, cb }, { call }) { // 新建SKU
      const data = yield call(lockVirtualInv, { payload });
      if (data.success) {
        message.success('锁定库存成功');
        cb();
      }
    },
    * addSku({ payload, cb }, { call }) { // 新建SKU
      const data = yield call(addSku, { payload });
      if (data.success) {
        message.success('新增SKU成功');
        cb();
      }
    },
    * updateSku({ payload, cb }, { call }) {
      const data = yield call(updateSku, { payload });
      if (data.success) {
        message.success('更新SKU成功');
        cb();
      }
    },
    * querySku({ payload }, { call, put }) {
      const data = yield call(querySku, { payload });
      if (data.success) {
        try {
          data.data.mainPic = JSON.parse(decodeURIComponent(data.data.mainPic).replace(/&quot;/g, '"'));
        } catch (e) {
          data.data.mainPic = {};
        }
        yield put({
          type: 'saveSku',
          payload: data,
        });
      }
    },
    * querySkuList({ payload = {} }, { call, put, select }) { // SKU管理列表
      // let pageIndex = yield select(({ sku }) => sku.currentPage);
      let pageSize = yield select(({ sku }) => sku.skuPageSize);
      if (payload.pageIndex) {
        yield put({ type: 'saveCurrentPageSkuIndex', payload });
      }
      if (payload.pageSize) {
        pageSize = payload.pageSize;
        yield put({ type: 'saveSkuPageSize', payload });
      }
      const data = yield call(querySkuList, { payload: { ...payload, pageSize } });
      if (data.success) {
        yield put({
          type: 'saveItemSkuList',
          payload: data,
        });
      }
    },
    * querySkuList2({ payload = {} }, { call, put, select }) { // SKU管理列表
      let pageIndex = yield select(({ sku }) => sku.currentPage);
      let pageSize = yield select(({ sku }) => sku.pageSize);
      if (payload.pageIndex) {
        pageIndex = payload.pageIndex;
        yield put({ type: 'saveCurrentPage', payload });
      }
      if (payload.pageSize) {
        pageSize = payload.pageSize;
        yield put({ type: 'savePageSize', payload });
      }
      const data = yield call(querySkuList2, { payload: { ...payload, pageIndex, pageSize } });
      // if (data.success) {
      yield put({
        type: 'saveItemSkuList',
        payload: data,
      });
      // }
    },
    * deleteSku({ payload, cb }, { call }) {
      const data = yield call(deleteSku, { payload });
      if (data.success) {
        message.success('删除SKU成功');
        cb();
      }
    },
    * searchProducts({ payload }, { call }) {
      const data = yield call(queryItemList, { payload: { name: payload.keyword } });
      payload.callback(data.success ? data : 'ERROR');
    },
    * queryPackageScales(param, { call, put }) {
      const data = yield call(queryPackageScales);
      if (data.success) {
        yield put({
          type: 'savePackageScales',
          payload: { data },
        });
      }
    },
    * queryScaleTypes(param, { call, put }) {
      const data = yield call(queryScaleTypes);
      if (data.success) {
        yield put({
          type: 'saveScaleTypes',
          payload: { data },
        });
      }
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === '/products/skuList' && !window.existCacheState('/products/skuList')) {
          setTimeout(() => {
            dispatch({ type: 'querySkuList', payload: query });
            dispatch({ type: 'products/queryCatesTree', payload: query });
            dispatch({ type: 'products/queryBrands', payload: {} });
            dispatch({ type: 'products/queryItemList', payload: {} });
          }, 0);
        }
      });
    },
  },
};
