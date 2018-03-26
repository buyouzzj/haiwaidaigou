import { message } from 'antd';
import fetch from '../utils/request';

// 采购入库相关接口
const queryPurchaseStorageList = ({ payload }) => fetch.post('/haierp1/purchaseStorage/queryPurStorages', { data: payload }).catch(e => e);
const queryBuyerTaskList = ({ payload }) => fetch.post('/haierp1/purchase/queryBuyerTaskList', { data: payload }).catch(e => e);
const addStorage = ({ payload }) => fetch.post('/haierp1/purchaseStorage/add', { data: payload }).catch(e => e);
const updateStorage = ({ payload }) => fetch.post('/haierp1/purchaseStorage/update', { data: payload }).catch(e => e);
const confirmStorage = ({ payload }) => fetch.post('/haierp1/purchaseStorage/confirm', { data: payload }).catch(e => e);
const deleteStorage = ({ payload }) => fetch.post('/haierp1/purchaseStorage/delete', { data: payload }).catch(e => e);
const queryPurchaseStorage = ({ payload }) => fetch.post('/haierp1/purchaseStorage/query', { data: payload }).catch(e => e);
const multiConfirmStorage = ({ payload }) => fetch.post('/haierp1/purchaseStorage/multiConfirm', { data: payload }).catch(e => e);

const mergePurchaseStorage = ({ payload }) => fetch.post('/haierp1/purchaseStorage/mergePurchaseStorage', { data: payload }).catch(e => e);//小程序合并入库
const queryBuyers = ({ payload }) => fetch.post('/haierp1/purchase/queryBuyers', { data: payload }).catch(e => e);

export default {
  namespace: 'purchaseStorage',
  state: {
    list: [],
    total: '',
    currentPage: 1,
    purchaseValues: {},
    buyer: [],
    // 修改的状态
    buyerTaskList: [],
    showModal: false,
    editInfo: {},
    showBarcodeModal: false,
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (pathname === '/purchase/purchaseStorage' && !window.existCacheState('/purchase/purchaseStorage')) {
          setTimeout(() => {
            dispatch({ type: 'queryPurchaseStorageList', payload: {} });
            dispatch({ type: 'queryBuyers', payload: {} });
            dispatch({ type: 'inventory/queryWareList', payload: {} });
          }, 0);
        }
      });
    },
  },
  effects: {
    * queryPurchaseStorageList({ payload }, { call, put, select }) {
      let pageIndex = yield select(({ purchaseStorage }) => purchaseStorage.currentPage);
      if (payload && payload.pageIndex) {
        pageIndex = payload.pageIndex;
        yield put({ type: 'saveCurrentPage', payload });
      }
      const data = yield call(queryPurchaseStorageList, { payload: { ...payload, pageIndex } });
      if (typeof data.success !== 'undefined') {
        yield put({ type: 'updatePurchaseStorageList', payload: data });
      }
    },
    * queryBuyers({ payload }, { call, put }) {
      const data = yield call(queryBuyers, { payload });
      if (data.success) {
        yield put({ type: 'updateBuyers', payload: data });
      }
    },
    * queryBuyerTaskList({ payload }, { call, put }) {
      const data = yield call(queryBuyerTaskList, { payload });
      if (data.success) {
        yield put({ type: 'updateBuyerTaskList', payload: data });
      }
    },
    * addStorage({ payload, cb }, { call }) {
      const data = yield call(addStorage, { payload: payload.fieldsValue });
      if (data.success) {
        message.success('添加入库单成功');
        if (cb) cb();
      }
    },
    * updateStorage({ payload, cb }, { call }) {
      const data = yield call(updateStorage, { payload: payload.fieldsValue });
      if (data.success) {
        message.success('修改入库单成功');
        if (cb) cb();
      }
    },
    * confirmStorage({ payload, cb }, { call }) {
      const data = yield call(confirmStorage, { payload: payload.fieldsValue });
      if (data.success) {
        message.success('确认入库成功');
        if (cb) cb();
      }
    },
    * queryStorage({ payload, cb }, { call, put }) {
      const data = yield call(queryPurchaseStorage, { payload });
      if (data.success) {
        if (cb) {
          cb(data.data);
        }
        yield put({ type: 'saveStorage', payload: data });
      }
    },
    * deleteStorage({ payload, cb }, { call }) {
      const data = yield call(deleteStorage, { payload });
      if (data.success) {
        message.success('删除入库单成功');
        cb();
      }
    },
    * multiConfirmStorage({ payload, cb }, { call }) {
      const data = yield call(multiConfirmStorage, { payload });
      if (data.success) {
        message.success('批量入库成功');
        cb();
      }
    },
    * mergePurchaseStorage({ payload, cb }, { call }) {
      const data = yield call(mergePurchaseStorage, { payload });
      if (data.success) {
        message.success('合并入库成功');
        cb();
      }
    },
    exportDetail({ payload }) {
      window.open(`http://${location.host}/haierp1/purchaseStorage/purchaseExport?id=${payload.id}`);
    },
  },
  reducers: {
    // 修改的状态
    toggleShowModal(state) { return { ...state, showModal: !state.showModal }; },
    toggleBarcodeModal(state) { return { ...state, showBarcodeModal: !state.showBarcodeModal }; },
    clearEditInfo(state) { return { ...state, editInfo: {} }; },
    updateEditInfo(state, { payload }) { return { ...state, editInfo: { ...state.editInfo, ...payload } }; },
    updatePurchaseStorageList(state, { payload }) {
      return { ...state, list: payload.data, total: payload.totalCount };
    },
    updateBuyers(state, { payload }) {
      return { ...state, buyer: payload.data };
    },
    updateBuyerTaskList(state, { payload }) {
      return { ...state, buyerTaskList: payload.data };
    },
    saveStorage(state, { payload }) {
      return { ...state, editInfo: payload.data };
    },
    saveCurrentPage(state, { payload }) {
      return { ...state, currentPage: payload.pageIndex };
    },
  },
};
