import { message } from 'antd';
import qs from 'querystring';
import fetch from '../utils/request';

const addOrder = ({ payload }) => fetch.post('/haierp1/outerOrder/add', { data: payload }).catch(e => e);
const updateOrder = ({ payload }) => fetch.post('/haierp1/outerOrder/update', { data: payload }).catch(e => e);
const deleteOrder = ({ payload }) => fetch.post('/haierp1/outerOrder/delete', { data: payload }).catch(e => e);
const queryOrderList = ({ payload }) => fetch.post('/haierp1/outerOrder/queryOuterOrderList', { data: payload }).catch(e => e);
const queryOrder = ({ payload }) => fetch.post('/haierp1/outerOrder/query', { data: payload }).catch(e => e);
const queryOrderDetail = ({ payload }) => fetch.post('/haierp1/outerOrder/erpStockup', { data: payload }).catch(e => e);
const closeOrder = ({ payload }) => fetch.post('/haierp1/outerOrder/close', { data: payload }).catch(e => e);
const outerOrderReview = ({ payload }) => fetch.post('/haierp1/outerOrder/outerOrderReview', { data: payload }).catch(e => e);
// erp
const queryErpOrderList = ({ payload }) => fetch.post('/haierp1/erpOrder/query', { data: payload }).catch(e => e);
// erp订单查询
const queryErpOrder = ({ payload }) => fetch.post('/haierp1/erpOrder/queryById', { data: payload }).catch(e => e);
// erp订单修改
const updateErpOrder = ({ payload }) => fetch.post('/haierp1/erpOrder/update', { data: payload }).catch(e => e);
// 订单关闭
const closeErpOrder = ({ payload }) => fetch.post('/haierp1/erpOrder/close', { data: payload }).catch(e => e);
// 订单拆分
const splitOrder = ({ payload }) => fetch.post('/haierp1/erpOrder/splitErpOrder', { data: payload }).catch(e => e);
// 重分配库存
const replayAssign = ({ payload }) => fetch.post('/haierp1/erpOrder/replayAssign', { data: payload }).catch(e => e);
// 检查一个人最近7天发的包裹数
const checkManyTimesDelivery = ({ payload }) => fetch.post('/haierp1/shippingOrder/checkManyTimesDelivery', { data: payload }).catch(e => e);
// 合单发货
const mergeDelivery = ({ payload }) => fetch.post('/haierp1/shippingOrder/multiDelivery', { data: payload }).catch(e => e);
// 批量发货
const batchDelivery = ({ payload }) => fetch.post('/haierp1/shippingOrder/batchDelivery', { data: payload }).catch(e => e);
// 批量发货表单
const batchDeliveryForm = ({ payload }) => fetch.post('/haierp1/shippingOrder/batchDeliveryForm', { data: payload }).catch(e => e);
// 发货单查询
const queryShippingOrderList = ({ payload }) => fetch.post('/haierp1/shippingOrder/query', { data: payload }).catch(e => e);
// 预出库
const prepareShipping = ({ payload }) => fetch.post('/haierp1/shippingOrder/prepareShipping', { data: payload }).catch(e => e);
// 发货单修改
const updateShippingOrder = ({ payload }) => fetch.post('/haierp1/shippingOrder/update', { data: payload }).catch(e => e);
// 发货单详情表单查询
const multiDeliveryForm = ({ payload }) => fetch.post('/haierp1/shippingOrder/multiDeliveryForm', { data: payload }).catch(e => e);
const queryShippingOrderDetail = ({ payload }) => fetch.post('/haierp1/shippingOrder/queryShippingOrderDetail', { data: payload }).catch(e => e);
const queryShippingTrack = ({ payload }) => fetch.post('/haierp1/shippingOrder/getShippingTrackDetail', { data: payload }).catch(e => e);
// 查询物流公司
const queryDeliveryCompanyList = ({ payload }) => fetch.post('/haierp1/shippingOrder/queryLogisticCompany', { data: payload }).catch(e => e);
// 查询代理商
const queryAgentManList = ({ payload }) => fetch.post('/haierp1/shippingOrder/queryAgentMan', { data: payload }).catch(e => e);
// 分配库存
const lockErpOrder = ({ payload }) => fetch.post('/haierp1/erpOrder/lockErpOrder', { data: payload }).catch(e => e);
// 释放库存
const releaseInventory = ({ payload }) => fetch.post('/haierp1/erpOrder/releaseInventory', { data: payload }).catch(e => e);
// 退单管理
const queryReturnOrderById = ({ payload }) => fetch.post('/haierp1/erpReturnOrder/queryById', { data: payload }).catch(e => e);
const updateReturnOrder = ({ payload }) => fetch.post('/haierp1/erpReturnOrder/update', { data: payload }).catch(e => e);
const addReturnOrder = ({ payload }) => fetch.post('/haierp1/erpReturnOrder/add', { data: payload }).catch(e => e);
const queryReturnOrderList = ({ payload }) => fetch.post('/haierp1/erpReturnOrder/query', { data: payload }).catch(e => e);

export default {
  namespace: 'order',
  state: {
    orderList: [],
    orderDetailList: [],
    orderTotal: 1,
    currentPage: 1,
    currentPageSize: 20,
    orderValues: {},
    // erp
    erpOrderList: [],
    erpCurrentPage: 1,
    erpCurrentPageSize: 20,
    erpOrderTotal: 1,
    erpOrderDetail: {},
    erpOrderValues: {},
    // 发货单
    shippingOrderList: [],
    shippingCurrentPage: 1,
    shippingCurrentPageSize: 20,
    shippingOrderTotal: 1,
    // 物流公司列表
    deliveryCompanyList: [],
    // 代理商列表
    agentManList: [],
    
    // 退单
    returnOrderList: [],
    returnCurrentPage: 1,
    returnOrderTotal: 1,
    returnOrderValues: {},
    loginRoler:false,//默认普通人员
  },
  reducers: {
    saveOrderList(state, { payload }) {
      return { ...state, orderList: payload.data, orderTotal: payload.totalCount, loginRoler:payload.agentRoler };
    },
    saveCurrentPage(state, { payload }) {
      return { ...state, currentPage: payload.pageIndex };
    },
    saveCurrentPageSize(state, { payload }) {
      return { ...state, currentPageSize: payload.pageSize };
    },
    saveOrder(state, { payload }) {
      return { ...state, orderValues: payload };
    },
    saveOrderDetail(state, { payload }) {
      return { ...state, orderDetailList: payload.data };
    },
    // erp
    saveErpCurrentPage(state, { payload }) {
      return { ...state, erpCurrentPage: payload.pageIndex };
    },
    saveErpCurrentPageSize(state, { payload }) {
      return { ...state, erpCurrentPageSize: payload.pageSize };
    },
    saveErpOrderList(state, { payload }) {
      return { ...state, erpOrderList: payload.data, erpOrderTotal: payload.totalCount, loginRoler:payload.agentRoler };
    },
    saveErpOrder(state, { payload }) {
      return { ...state, erpOrderValues: payload };
    },
    saveErpOrderDetail(state, { payload }) {
      return { ...state, erpOrderDetail: payload.data || {} };
    },
    // 发货单
    saveShippingCurrentPage(state, { payload }) {
      return { ...state, shippingCurrentPage: payload.pageIndex };
    },
    saveShippingCurrentPageSize(state, { payload }) {
      return { ...state, shippingCurrentPageSize: payload.pageSize };
    },
    saveShippingOrderList(state, { payload }) {
      return { ...state, shippingOrderList: payload.data, shippingOrderTotal: payload.totalCount, loginRoler:payload.agentRoler };
    },
    saveDeliveryCompanyList(state, { payload }) {
      return { ...state, deliveryCompanyList: payload.data };
    },
    saveAgentManList(state, { payload }) {
      return { ...state, agentManList: payload.data };
    },
    // 退货单
    saveReturnCurrentPage(state, { payload }) {
      return { ...state, returnCurrentPage: payload.pageIndex };
    },
    saveReturnOrderList(state, { payload }) {
      return { ...state, returnOrderList: payload.data, returnOrderTotal: payload.totalCount };
    },
    saveReturnValues(state, { payload }) {
      return { ...state, returnOrderValues: payload.data };
    },
  },
  effects: {
    // 主订单
    * addOrder({ payload }, { call }) {
      if (payload.orderTime) {
        payload.orderTime = payload.orderTime.format('YYYY-MM-DD HH:mm:ss');
      }
      const data = yield call(addOrder, { payload });
      if (data.success) {
        message.success('增加订单成功');
      }
    },
    * updateOrder({ payload }, { call }) {
      if (payload.orderTime) { payload.orderTime = payload.orderTime.format('YYYY-MM-DD HH:mm:ss'); }
      const data = yield call(updateOrder, { payload });
      if (data.success) {
        message.success('更新订单成功');
      }
    },
    * deleteOrder({ payload, cb }, { call }) {
      const data = yield call(deleteOrder, { payload });
      if (data.success) {
        message.success('删除订单成功');
        cb();
      }
    },
    * queryOrder({ payload }, { call, put }) {
      const newPayload = { ...payload };
      const data = yield call(queryOrder, { payload: newPayload });
      if (data.success) {
        yield put({
          type: 'saveOrder',
          payload: data,
        });
      }
    },
    * queryOrderDetail({ payload }, { call, put }) {
      const data = yield call(queryOrderDetail, { payload });
      if (data.success) {
        yield put({
          type: 'saveOrderDetail',
          payload: data,
        });
      }
    },
    * queryOrderList({ payload }, { call, put, select }) { // 订单管理列表
      let pageIndex = yield select(({ order }) => order.currentPage);
      let pageSize = yield select(({ order }) => order.currentPageSize);
      if (payload && payload.pageIndex) {
        pageIndex = payload.pageIndex;
        yield put({ type: 'saveCurrentPage', payload });
      }
      if (payload && payload.pageSize) {
        pageSize = payload.pageSize;
        yield put({ type: 'saveCurrentPageSize', payload });
      }
      if (payload.startGmt) payload.startGmt = payload.startGmt.format('YYYY-MM-DD');
      if (payload.endGmt) payload.endGmt = payload.endGmt.format('YYYY-MM-DD');
      if (!payload.status) payload.status = 10;
      const data = yield call(queryOrderList, { payload: { ...payload, pageIndex, pageSize } });
      if (data.success) {
        yield put({
          type: 'saveOrderList',
          payload: data,
        });
      }
    },
    * closeOrder({ payload, cb }, { call }) {
      const data = yield call(closeOrder, { payload });
      if (data.success) {
        message.success('订单关闭完成');
        cb();
      }
    },
    * outerOrderReview({ payload, cb }, { call }) {
    		const data = yield call(outerOrderReview, { payload });
    		if (data.success) {
	        message.success('微信录单确认完成');
	        cb();
	    }
    },
    // 子订单
    * queryErpOrderList({ payload }, { call, put, select }) {
      let pageIndex = yield select(({ order }) => order.erpCurrentPage);
      let pageSize = yield select(({ order }) => order.erpCurrentPageSize);
      if (payload && payload.pageIndex) {
        pageIndex = payload.pageIndex;
        yield put({ type: 'saveErpCurrentPage', payload });
      }
      if (payload && payload.pageSize) {
        pageSize = payload.pageSize;
        yield put({ type: 'saveErpCurrentPageSize', payload });
      }
      const data = yield call(queryErpOrderList, { payload: { ...payload, pageIndex, pageSize } });
      if (data.success) {
        yield put({
          type: 'saveErpOrderList',
          payload: data,
        });
      }
    },
    * queryErpOrder({ payload }, { call, put }) {
      const data = yield call(queryErpOrder, { payload });
      if (data.success) {
        yield put({
          type: 'saveErpOrder',
          payload: data,
        });
      }
    },
    * updateErpOrder({ payload }, { call }) {
      const data = yield call(updateErpOrder, { payload });
      if (data.success) {
        message.success('修改成功');
      }
    },
    * replayAssign({ payload }, { call }) {
      const data = yield call(replayAssign, { payload: { orderIds: payload.orderIds } });
      if (data.success) {
        message.success('重新分配库存成功');
        if (payload.callback) payload.callback();
      }
    },
    * closeErpOrder({ payload = {} }, { call }) {
      const { closeReason, orderIds } = payload;
      const data = yield call(closeErpOrder, { payload: { orderIds, closeReason } });
      if (data.success) {
        message.success('关闭成功');
        if (payload.callback) payload.callback();
      }
    },
    * prepareShipping({ payload, cb }, { call }) {
      const data = yield call(prepareShipping, { payload });
      if (data.success) {
        message.success('预出库成功');
        cb();
      }
    },
    * queryErpOrderDetail({ payload }, { call, put }) {
      const data = yield call(multiDeliveryForm, { payload: { erpOrderId: JSON.stringify(payload.erpOrderId) } });
      if (data.success) {
        yield put({
          type: 'saveErpOrderDetail',
          payload: data,
        });
        if (payload.callback) payload.callback();
      }
    },
    * checkManyTimesDelivery({ payload, cb }, { call }) {
      const data = yield call(checkManyTimesDelivery, { payload });
    },
    * mergeDelivery({ payload, cb }, { call }) {
      const data = yield call(mergeDelivery, { payload });
      if (data.success) {
        message.success('合单发货完成');
        if (cb) cb();
      }
    },
    * batchDelivery({ payload, callback }, { call }) {
      const data = yield call(batchDelivery, { payload });
      if (data.success) {
        message.success('批量发货完成');
        if (callback) callback();
      }
    },
    * batchDeliveryForm({ payload, callback }, { call }) {
      const data = yield call(batchDeliveryForm, { payload });
      if (data.success) callback(data);
      else {
        message.destroy();
        callback(data);
      }
    },
    * splitOrder({ payload, cb }, { call }) {
      const data = yield call(splitOrder, { payload });
      if (data.success) {
        message.success('订单拆分成功');
        cb();
      }
    },
    * lockErpOrder({ payload, cb }, { call }) {
      const data = yield call(lockErpOrder, { payload });
      if (data.success) {
        message.success('分配库存成功');
        cb();
      }
    },
    * releaseInventory({ payload, cb }, { call }) {
      const data = yield call(releaseInventory, { payload });
      if (data.success) {
        message.success('释放库存成功');
        cb();
      }
    },
    // 发货单
    * queryShippingOrderList({ payload }, { call, put, select }) {
      let pageIndex = yield select(({ order }) => order.shippingCurrentPage);
      let pageSize = yield select(({ order }) => order.shippingCurrentPageSize);
      if (payload && payload.pageIndex) {
        pageIndex = payload.pageIndex;
        yield put({ type: 'saveShippingCurrentPage', payload });
      }
      if (payload && payload.pageSize) {
        pageSize = payload.pageSize;
        yield put({ type: 'saveShippingCurrentPageSize', payload });
      }
      const data = yield call(queryShippingOrderList, { payload: { ...payload, pageIndex, pageSize } });
      if (data.success) {
        yield put({
          type: 'saveShippingOrderList',
          payload: data,
        });
      }
    },
    * queryShippingOrderDetail({ payload, cb }, { call }) {
      const data = yield call(queryShippingOrderDetail, { payload });
      if (data.success) {
        if (cb) cb(data.data);
      }
    },
     * queryShippingTrack({ payload, cb }, { call }) {
      const data = yield call(queryShippingTrack, { payload });
      if (data.success) {
        if (cb) cb(data.data);
      }
    },
    * updateShippingOrder({ payload, callback }, { call }) {
      const data = yield call(updateShippingOrder, { payload });
      if (data.success) {
        message.success('修改发货单完成');
        if (callback) callback();
      }
    },
    * queryDeliveryCompanyList(params, { call, put }) {
      const data = yield call(queryDeliveryCompanyList, {});
      if (data.success) {
        yield put({
          type: 'saveDeliveryCompanyList',
          payload: data,
        });
      }
    },
    * queryAgentManList(params, { call, put }) {
      const data = yield call(queryAgentManList, {});
      if (data.success) {
        yield put({
          type: 'saveAgentManList',
          payload: data,
        });
      }
    },
    // 退单管理
    * queryReturnOrderList({ payload }, { call, put, select }) {
      let pageIndex = yield select(({ order }) => order.returnCurrentPage);
      if (payload && payload.pageIndex) {
        pageIndex = payload.pageIndex;
        yield put({ type: 'saveReturnCurrentPage', payload });
      }
      const data = yield call(queryReturnOrderList, { payload: { ...payload, pageIndex } });
      if (data.success) {
        yield put({
          type: 'saveReturnOrderList',
          payload: data,
        });
      }
    },
    * queryReturnOrderById({ payload, cb }, { call, put }) {
      const data = yield call(queryReturnOrderById, { payload });
      if (data.success) {
        yield put({
          type: 'saveReturnValues',
          payload: data,
        });
      }
    },
    * addReturnOrder({ payload, cb }, { call }) {
      const data = yield call(addReturnOrder, { payload });
      if (data.success) {
        message.success('退单增加完成');
        if (cb) cb();
      }
    },
    * updateReturnOrder({ payload, cb }, { call }) {
      const data = yield call(updateReturnOrder, { payload });
      if (data.success) {
        message.success('修改退单完成');
        if (cb) cb();
      }
    },
    exportPdf({ payload, success }) {
      window.open(`http://${location.host}/haierp1/shippingOrder/shippingOrderExportPdf?shippingOrderIds=${payload}`);
      if (success) {
        setTimeout(() => { success(); }, 1000);
      }
    },
    exportOrderDetail({ payload }) {
      window.open(`http://${location.host}/haierp1/shippingOrder/shippingOrderExportExcel?startOrderTime=${payload.startOrderTime}&endOrderTime=${payload.endOrderTime}&logisticCompany=${payload.logisticCompany}`);
    },
    exportOrderDetailPackage({ payload }) {
      window.open(`http://${location.host}/haierp1/shippingOrder/shippingOrderPackageExportExcel?startOrderTime=${payload.startOrderTime}&endOrderTime=${payload.endOrderTime}&logisticCompany=${payload.logisticCompany}`);
    },
    exportMainOrder({ payload }) {
      const param = qs.stringify(payload);
      window.open(`http://${location.host}/haierp1/outerOrder/OuterOrderExportExcel?${param}`);
    },
    exportErpOrder({ payload }) {
      const param = qs.stringify(payload);
      window.open(`http://${location.host}/haierp1/erpOrder/erpOrderExport?${param}`);
    },
    exportReturnOrder({ payload }) {
      const param = qs.stringify(payload);
      window.open(`http://${location.host}/haierp1/erpReturnOrder/erpReturnOrderExport?${param}`);
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === '/sale/orderList' && !window.existCacheState('/sale/orderList')) {
          setTimeout(() => {
            dispatch({ type: 'queryOrderList', payload: query });
            dispatch({ type: 'agency/queryAgencyList', payload: query });
          }, 0);
        }
        if (pathname === '/sale/erpOrder' && !window.existCacheState('/sale/erpOrder')) {
          setTimeout(() => {
            dispatch({ type: 'queryErpOrderList', payload: query });
            dispatch({ type: 'agency/queryAgencyList', payload: query });
            dispatch({ type: 'queryDeliveryCompanyList', payload: query });
            dispatch({ type: 'queryAgentManList', payload: query });//查询代理
            dispatch({ type: 'inventory/queryWareList', payload: {} });
          }, 0);
        }
        if (pathname === '/sale/shippingOrder' && !window.existCacheState('/sale/shippingOrder')) {
          setTimeout(() => {
            dispatch({ type: 'queryShippingOrderList', payload: query });
            dispatch({ type: 'queryDeliveryCompanyList', payload: query });
            dispatch({ type: 'queryAgentManList', payload: query });//查询代理
          }, 0);
        }
        if (pathname === '/sale/returnOrder' && !window.existCacheState('/sale/returnOrder')) {
          setTimeout(() => {
            dispatch({ type: 'queryReturnOrderList', payload: query });
            dispatch({ type: 'agency/queryAgencyList', payload: query });
          }, 0);
        }
      });
    },
  },
};
