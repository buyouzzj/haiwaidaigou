import fetch from '../utils/request';

const queryJournalList = ({ payload }) => fetch.post('/haierp1/taskPurchase/queryTaskPurchaseList', { data: payload }).catch(e => e);
const comfirmJournal = ({ payload }) => fetch.post('/haierp1/taskPurchase/confirm', { data: payload }).catch(e => e);
const queryJournal = ({ payload }) => fetch.post('/haierp1/taskPurchase/query', { data: payload }).catch(e => e);
const createReceipt = ({ payload }) => fetch.post('/haierp1/taskPurchase/createReceipt', { data: payload }).catch(e => e);
const queryReceiptList = ({ payload }) => fetch.post('/haierp1/receipt/queryReceiptList', { data: payload }).catch(e => e);
const confirmPreStock = ({ payload }) => fetch.post('/haierp1/receipt/confirm', { data: payload }).catch(e => e);

export default {
  namespace: 'check',
  state: {
    checkedList: [],
    unCheckedList: [],
    receiptList: [],
    modalValues: {},
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (pathname === '/purchase/check/journal' && !window.existCacheState('/purchase/check/journal')) {
          setTimeout(() => {
            dispatch({ type: 'queryJournalList', payload: { status: 0 } });
            dispatch({ type: 'queryJournalList', payload: { status: 1 } });
          }, 0);
        }
        if (pathname === '/purchase/check/receipt' && !window.existCacheState('/purchase/check/receipt')) {
          setTimeout(() => {
            dispatch({ type: 'queryReceiptList', payload: {} });
          }, 0);
        }
      });
    },
  },
  effects: {
    * queryJournalList({ payload }, { call, put }) {
      const data = yield call(queryJournalList, { payload });
      if (data.success) {
        if (payload.status === 1) {
          yield put({ type: 'updateCheckedList', payload: data });
        } else yield put({ type: 'updateUnCheckedList', payload: data });
      }
    },
    * comfirmJournal({ payload }, { call, put }) {
      const data = yield call(comfirmJournal, { payload });
      if (data.success) {
        yield put({ type: 'queryJournalList', payload: { status: 0 } });
      }
    },
    * queryJournal({ payload }, { call, put }) {
      const data = yield call(queryJournal, { payload });
      if (data.success) {
        yield put({ type: 'updateJournal', payload: data });
      }
    },
    * createReceipt({ payload }, { call, put }) {
      const data = yield call(createReceipt, { payload });
      if (data.success) {
        yield put({ type: 'queryJournalList', payload: { status: 0 } });
      }
    },
    * queryReceiptList({ payload }, { call, put }) {
      const data = yield call(queryReceiptList, { payload });
      if (data.success) {
        yield put({ type: 'updateReceiptList', payload: data });
      }
    },
    * confirmPreStock({ payload }, { call, put }) {
      const data = yield call(confirmPreStock, { payload });
      if (data.success) {
        yield put({
          type: 'queryReceiptList',
          payload: {},
        });
      }
    },
  },
  reducers: {
    updateCheckedList(state, { payload }) {
      return { ...state, checkedList: payload.data };
    },
    updateUnCheckedList(state, { payload }) {
      return { ...state, unCheckedList: payload.data };
    },
    updateJournal(state, { payload }) {
      return { ...state, modalValues: payload.data };
    },
    updateReceiptList(state, { payload }) {
      return { ...state, receiptList: payload.data };
    },
  },
};
