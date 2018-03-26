import { message } from 'antd';
import fetch from '../utils/request';

const addPurchase = ({ payload }) => fetch.post('/haierp1/purchase/add', { data: payload }).catch(e => e);
const updatePurchase = ({ payload }) => fetch.post('/haierp1/purchase/update', { data: payload }).catch(e => e);
const queryPurchaseList = ({ payload }) => fetch.post('/haierp1/purchase/queryTaskDailyList', { data: payload }).catch(e => e);
const queryPurchase = ({ payload }) => fetch.post('/haierp1/purchase/query', { data: payload }).catch(e => e);
const queryBuyers = ({ payload }) => fetch.post('/haierp1/purchase/queryBuyers', { data: payload }).catch(e => e);
const deletePurchase = ({ payload }) => fetch.post('/haierp1/purchase/delete', { data: payload }).catch(e => e);
// 取消采购
const closeTaskDaily = ({ payload }) => fetch.post('/haierp1/purchase/closeTaskDaily', { data: payload }).catch(e => e);
// 完成采购
const finishTaskDaily = ({ payload }) => fetch.post('/haierp1/purchase/finishTaskDaily', { data: payload }).catch(e => e);
// 根据当前订单生成采购任务
const createByOrder = () => fetch.get('/haierp1/purchase/autoAddByOrder').catch(e => e);
//采购小票
const purchaseReceiptList = ({ payload }) => fetch.post('/haierp1/receipt/queryReceipt', { data: payload }).catch(e => e);
//采购小票明细
const purchaseReceiptTaskList = ({ payload }) => fetch.post('/haierp1/receipt/queryTaskReceipt', { data: payload }).catch(e => e);
//采购未完成时间
const purchaseNoCompleteTimeList = ({ payload }) => fetch.post('/haierp1/purchase/nocompleteTaskDailyOrderTime', { data: payload }).catch(e => e);
//采购未完成详情
const purchaseNoCompleteDateil = ({ payload }) => fetch.post('/haierp1/purchase/nocompleteTaskDaily', { data: payload }).catch(e => e);
//新建未备的sku 和子订单
const erpNoNeedtoPurchaseSku = ({ payload }) => fetch.post('/haierp1/purchase/queryNoStockSku', { data: payload }).catch(e => e);
//采购操作退单sku
const addReturnErpOrderIds = ({ payload }) => fetch.post('/haierp1/purchase/addReturnErpOrderIds', { data: payload }).catch(e => e);
export default {
  namespace: 'purchase',
  state: {
    list: [],
    total: '',
    currentPage: 1,
    currentPageSize: 20,
    purchaseValues: {},
    editInfo: {},
    buyer: [],
    receiptList: [],
    receiptcurrentPage: 1,
    receiptcurrentPageSize: 20,
    receiptTotal: 1,
    receiptTaskList: [],
    receiptTaskPage: 1,
    receiptTaskPageSize: 20,
    receiptTaskTotal: 1,
    uncompleteTaskDailyOrder: [],
    noCompleteTimePage: 1,
    noCompleteTimePageSize: 20,
    noCompleteTimeTotal: 1,
    skutoSellerList: [],
    skucurrentPage: 1,
    skucurrentPageSize: 20,
    skuTotal: 1,
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (pathname === '/purchase/purchaseList' && !window.existCacheState('/purchase/purchaseList')) {
          setTimeout(() => {
            dispatch({ type: 'queryPurchaseList', payload: {} });
            dispatch({ type: 'queryBuyers', payload: {} });
          }, 0);
        }
        if (pathname === '/purchase/preStock' && !window.existCacheState('/purchase/preStock')) {
          setTimeout(() => {
            dispatch({ type: 'queryPurchaseList', payload: {} });
            dispatch({ type: 'queryBuyers', payload: {} });
          }, 0);
        }
        if (pathname === '/purchase/receiptList' && !window.existCacheState('/purchase/receiptList')){
          setTimeout(() => {
            dispatch({ type: 'purchaseReceiptList', payload: {} });
          }, 0);
        }
        if (pathname === '/purchase/receiptTaskList' && !window.existCacheState('/purchase/receiptTaskList')){
          setTimeout(() => {
            dispatch({ type: 'purchaseReceiptTaskList', payload: {} });
          }, 0);
        }
        if (pathname === '/purchase/uncompleteTaskDailyOrder' && !window.existCacheState('/purchase/uncompleteTaskDailyOrder')){
          setTimeout(() => {
            dispatch({ type: 'purchaseNoCompleteTimeList', payload: {} });
          }, 0);
        }
        if (pathname === '/purchase/noneedtoPurchaseSku' && !window.existCacheState('/purchase/noneedtoPurchaseSku')){
          setTimeout(() => {
            dispatch({ type: 'erpNoNeedtoPurchaseSku', payload: {} });
          }, 0);
        }
      });
    },
  },
  effects: {
    * queryPurchaseList({ payload }, { call, put, select }) {
      let pageIndex = yield select(({ purchase }) => purchase.currentPage);
      let pageSize = yield select(({ purchase }) => purchase.currentPageSize);
      if (payload && payload.pageIndex) {
        pageIndex = payload.pageIndex;
        yield put({ type: 'saveCurrentPage', payload });
      }
      if (payload && payload.pageSize) {
        pageSize = payload.pageSize;
        yield put({ type: 'saveCurrentPageSize', payload });
      }
      const data = yield call(queryPurchaseList, { payload: { ...payload, pageIndex, pageSize } });
      if (data.success) {
        yield put({ type: 'updatePurchaseList', payload: data });
      }
    },
    * addPurchase({ payload, cb }, { call }) {
      const data = yield call(addPurchase, { payload });
      if (data.success) {
        message.success('新增采购成功');
        cb();
      }
    },
    * updatePurchase({ payload, cb }, { call }) {
      const data = yield call(updatePurchase, { payload });
      if (data.success) {
        message.success('修改采购成功');
        cb();
      }
    },
    * queryPurchase({ payload }, { call, put }) {
      const newPayload = { ...payload };
      delete newPayload.type;
      const data = yield call(queryPurchase, { payload: newPayload });
      if (data.success) {
        yield put({
          type: 'savePurchase',
          payload: data,
        });
      }
    },
    * queryBuyers({ payload }, { call, put }) {
      const data = yield call(queryBuyers, { payload });
      if (data.success) {
        yield put({ type: 'updateBuyers', payload: data });
      }
    },
    * deletePurchase({ payload, cb }, { call }) {
      const data = yield call(deletePurchase, { payload });
      if (data.success) cb();
    },
    * createByOrder({ payload, cb }, { call }) {
      const data = yield call(createByOrder);
      if (data.success) {
        message.success('生产采购任务成功');
        cb();
      }
    },
    * exportPurchase({ payload }, { put }) {
      window.open(`http://${location.host}/haierp1/purchase/taskDailyExport?id=${payload.id}`);
      yield put({ type: 'queryPurchaseList', payload: {} });
    },
    * exportNoCompleteDetail({ payload }) {
      window.open(`http://${location.host}/haierp1/purchase/noCompleteExport?currentlyDate=${payload.currentlyDate}`);
    },
    * finishTaskDaily({ payload, cb }, { call }) {
      const data = yield call(finishTaskDaily, { payload });
      if (data.success) {
        message.success('完成采购成功');
        if (cb) cb();
      }
    },
    * closeTaskDaily({ payload, cb }, { call }) {
      const data = yield call(closeTaskDaily, { payload });
      if (data.success) {
        message.success('取消采购成功');
        if (cb) cb();
      }
    },
    //小票管理
    *purchaseReceiptList({ payload },{call, put, select}) {
      let pageIndex = yield select(({ inventory }) => inventory.receiptcurrentPage);
      if (payload && payload.pageIndex) {
        pageIndex = payload.pageIndex;
        yield put({ type: 'saveReceiptcurrentPage', payload });
      }
      if (payload && payload.pageSize) {
        pageSize = payload.pageSize;
        yield put({ type: 'saveReceiptcurrentPageSize', payload });
      }
      const data = yield call(purchaseReceiptList, { payload: { ...payload, pageIndex } });
      if (data.success) {
        yield put({
          type: 'updateReceiptList',
          payload: data,
        });
      }  
    },
    //小票明细
    *purchaseReceiptTaskList({ payload },{call, put, select}) {
      let pageIndex = yield select(({ inventory }) => inventory.receiptTaskPage);
      if (payload && payload.pageIndex) {
        pageIndex = payload.pageIndex;
        yield put({ type: 'saveReceiptTaskPage', payload });
      }
      if (payload && payload.pageSize) {
        pageSize = payload.pageSize;
        yield put({ type: 'saveReceiptTaskPageSize', payload });
      }
      const data = yield call(purchaseReceiptTaskList, { payload: { ...payload, pageIndex } });
      if (data.success) {
        yield put({
          type: 'updateReceiptTaskList',
          payload: data,
        });
      }  
    },
    //未完成时间
    *purchaseNoCompleteTimeList({ payload },{call, put, select}) {
      let pageIndex = yield select(({ purchase }) => purchase.noCompleteTimePage);
      if (payload && payload.pageIndex) {
        pageIndex = payload.pageIndex;
        yield put({ type: 'saveNoCompleteTimePage', payload });
      }
      if (payload && payload.pageSize) {
        pageSize = payload.pageSize;
        yield put({ type: 'saveNoCompleteTimePageSize', payload });
      }
      const data = yield call(purchaseNoCompleteTimeList, { payload: { ...payload, pageIndex } });
      if (data.success) {
        yield put({
          type: 'updateNoCompleteTimeList',
          payload: data,
        });
      }  
    },
    * purchaseNoCompleteDateil({ payload, cb }, { call }) {
      const data = yield call(purchaseNoCompleteDateil, { payload });
      if (data.success) {
      	if (cb) {
          cb(data.data);
       }
      }
    },
    //未备货sku集合
    *erpNoNeedtoPurchaseSku({ payload },{call, put, select}) {
      let pageIndex = yield select(({ inventory }) => inventory.skucurrentPage);
      if (payload && payload.pageIndex) {
        pageIndex = payload.pageIndex;
        yield put({ type: 'saveSkucurrentPage', payload });
      }
      if (payload && payload.pageSize) {
        pageSize = payload.pageSize;
        yield put({ type: 'saveSkucurrentPageSize', payload });
      }
      const data = yield call(erpNoNeedtoPurchaseSku, { payload: { ...payload, pageIndex } });
      if (data.success) {
        yield put({
          type: 'updateNoStockSkuList',
          payload: data,
        });
      }  
    },
      * addReturnErpOrderIds({ payload, cb }, { call }) { 
      const data = yield call(addReturnErpOrderIds, { payload });
      if (data.success) {
        message.success('已经分发给各个销售，请在子订单中查看订单采购状态中筛选SKU采购异常的订单！');
        cb();
      }
    },
  },
  reducers: {
    updatePurchaseList(state, { payload }) {
      return { ...state, list: payload.data, total: payload.totalCount, loginRoler:payload.agentRoler };
    },
    saveCurrentPage(state, { payload }) {
      return { ...state, currentPage: payload.pageIndex };
    },
    saveCurrentPageSize(state, { payload }) {
      return { ...state, currentPageSize: payload.pageSize };
    },
    saveReceiptcurrentPage(state,{ payload }) {
      return { ...state, receiptcurrentPage: payload.pageIndex };  
    },
    saveReceiptcurrentPageSize(state, { payload }) {
      return { ...state, receiptTaskPageSize: payload.pageSize };
    },
    savePurchase(state, { payload }) {
      return { ...state, purchaseValues: payload };
    },
    updateBuyers(state, { payload }) {
      return { ...state, buyer: payload.data };
    },
    updateReceiptList(state, { payload }) {
      return { ...state, receiptList: payload.data, receiptTotal: payload.totalCount };
    },
    updateReceiptTaskList(state, { payload }) {
      return { ...state, receiptTaskList: payload.data, receiptTaskTotal: payload.totalCount };
    },
    saveReceiptTaskPage(state,{ payload }) {
      return { ...state, receiptTaskPage: payload.pageIndex };  
    },
    saveReceiptTaskPageSize(state, { payload }) {
      return { ...state, receiptTaskPageSize: payload.pageSize };
    },
    saveNoCompleteTimePage(state,{ payload }) {
      return { ...state, noCompleteTimePage: payload.pageIndex };  
    },
    saveNoCompleteTimePageSize(state, { payload }) {
      return { ...state, noCompleteTimePageSize: payload.pageSize };
    },
    updateNoCompleteTimeList(state, { payload }) {
      return { ...state, uncompleteTaskDailyOrder: payload.data, noCompleteTimeTotal: payload.totalCount };
    },
    clearEditInfo(state) { return { ...state, editInfo: {} }; },
    
    saveSkucurrentPage(state,{ payload }) {
      return { ...state, skucurrentPage: payload.pageIndex };  
    },
    saveSkucurrentPageSize(state, { payload }) {
      return { ...state, receiptTaskPageSize: payload.pageSize };
    },
    updateNoStockSkuList(state, { payload }) {
      return { ...state, skutoSellerList: payload.data, skuTotal: payload.totalCount };
    },
  },
};
