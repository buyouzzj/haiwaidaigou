import { message } from 'antd';
import fetch from '../utils/request';

const fileManageSaleList = ({ payload }) => fetch.post('/haierp1/fileManage/queryFile', { data: payload }).catch(e => e);
const queryPackageScales = () => fetch.post('/haierp1/freight/getPackageScaleList').catch(e => e);
const queryOrgList = ({ payload }) => fetch.post('/haierp1/organizationHai/queryList', { data: payload }).catch(e => e);
const deleteFileManageSale = ({ payload }) => fetch.post('/haierp1/fileManage/deleteFile', { data: payload }).catch(e => e);
const addFileManageSale = ({ payload }) => fetch.post('/haierp1/fileManage/addFile', { data: payload }).catch(e => e);
const updateFileManageSale = ({ payload }) => fetch.post('/haierp1/fileManage/modifyFile', { data: payload }).catch(e => e);
const fileManageDownload = ({ payload }) => fetch.post('/haierp1/fileManage/queryFileById', { data: payload }).catch(e => e);
const queryInventoryCreater = ({ payload }) => fetch.post('/haierp1/inventory/queryCreaterList', { data: payload }).catch(e => e)

export default {
  namespace: 'fileManageSale',
  state: {
    saleFileList: [],
    saleFilePageSize: 20,
    saleFileTotal: 0,
    fileData: {},
    currentPage: 1,
    currentPageFileIndex: 1,
    pageSize: 20,
    packageScales: [],
    fileValues: {}, // 修改上传文件的值
    orgList: [],
    orgTotal: 1,
    orgCurrentPage: 1,
    userCurrent: 1,
    userCreaterList:[],//操作人员
  },
  reducers: {
    saveFileManageSale(state, { payload }) {
      return { ...state, fileData: payload };
    },
    saveSaleFilePageSize(state, { payload }) {
      return { ...state, saleFilePageSize: payload.pageSize };
    },
    saveSaleFileList(state, { payload }) {
      return { ...state, saleFileList: payload.data, saleFileTotal: payload.totalCount };
    },
    saveCurrentPage(state, { payload }) {
      return { ...state, currentPage: payload.pageIndex };
    },
    saveCurrentPageFileIndex(state, { payload }) {
      return { ...state, currentPageFileIndex: payload.pageIndex };
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
    saveFilesValue(state, { payload }) {
      return { ...state, fileValues: payload };
    },
    updateOrgList(state, { payload }) {
      return { ...state, orgList: payload.data, orgTotal: payload.totalCount };
    },
    saveOrgCurrentPage(state, { payload }) {
      return { ...state, orgCurrentPage: payload.pageIndex };
    },
    saveUserCurrent(state, { payload }) {
      return { ...state, userCurrent: payload.pageIndex };
    },
    updateCreateUserList(state, { payload }) {
      return { ...state, userCreaterList: payload.data };
    },

  },
  effects: {
    * addFileManageSale({ payload, cb }, { call }) { 
      const data = yield call(addFileManageSale, { payload });
      if (data.success) {
        message.success('添加文件成功');
        cb();
      }
    },
    * updateFileManageSale({ payload, cb }, { call }) {
      const data = yield call(updateFileManageSale, { payload });
      if (data.success) {
        message.success('添加文件成功');
        cb();
      }
    },
    * queryFileManageDownload({ payload, cb }, { call }) {
      const data = yield call(fileManageDownload, { payload });
      if (data.success) {
	        if (cb) {
          cb(data.data);
       }
      }
    },
    * fileManageSaleList({ payload = {} }, { call, put, select }) { // SKU管理列表
      // let pageIndex = yield select(({ sku }) => sku.currentPage);
      let pageSize = yield select(({ fileManageSale }) => fileManageSale.saleFilePageSize);
      if (payload.pageIndex) {
        yield put({ type: 'saveCurrentPageFileIndex', payload });
      }
      if (payload.pageSize) {
        pageSize = payload.pageSize;
        yield put({ type: 'saveSaleFilePageSize', payload });
      }
      const data = yield call(fileManageSaleList, { payload: { ...payload, pageSize } });
      if (data.success) {
        yield put({
          type: 'saveSaleFileList',
          payload: data,
        });
      }
    },
    * deleteFileManageSale({ payload, cb }, { call }) {
      const data = yield call(deleteFileManageSale, { payload });
      if (data.success) {
        message.success('删除文件成功');
        cb();
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
    // 创建者管理
    * queryInventoryCreater({ payload }, { call, put, select }) {
      let pageIndex = yield select(({ inventory }) => inventory.userCurrent);
      if (payload && payload.pageIndex) {
        pageIndex = payload.pageIndex;
        yield put({ type: 'saveUserCurrent', payload });
      }
      const data = yield call(queryInventoryCreater, { payload: { ...payload, pageIndex } });
      if (data.success) {
        yield put({ type: 'updateCreateUserList', payload: data });
      }
    },
    
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === '/fileManage/fileManageSale' && !window.existCacheState('/fileManage/fileManageSale')) {
          setTimeout(() => {
            dispatch({ type: 'queryOrgList', payload: query });
            dispatch({ type: 'fileManageSaleList', payload: query });
            dispatch({ type: 'queryInventoryCreater',payload: { pageIndex: 1 } });
          }, 0);
        }
      });
    },
  },
};
