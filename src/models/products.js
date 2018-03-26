import { message } from 'antd';
import fetch from '../utils/request';

const queryItemList = ({ payload }) => fetch.post('/haierp1/item/queryItemList', { data: payload }).catch(e => e);
const queryProduct = ({ payload }) => fetch.post('/haierp1/item/query', { data: payload }).catch(e => e);
const updateProducts = ({ payload }) => fetch.post('/haierp1/item/update', { data: payload }).catch(e => e);
const addProducts = ({ payload }) => fetch.post('/haierp1/item/add', { data: payload }).catch(e => e);
const queryCatesTree = () => fetch.post('/haierp1/category/tree').catch(e => e);
// 批量同步
const batchSynItemYouzan = ({ payload }) => fetch.post('/haierp1/youzanSyn/batchSynItemYouzan', { data: payload }).catch(e => e);
// 批量上架
const batchListingYouzan = ({ payload }) => fetch.post('/haierp1/youzanSyn/batchListingYouzan', { data: payload }).catch(e => e);
// 批量下架
const batchDelistingYouzan = ({ payload }) => fetch.post('/haierp1/youzanSyn/batchDelistingYouzan', { data: payload }).catch(e => e);
// 品牌
const queryAllBrand = () => fetch.post('/haierp1/item/brand/queryAllBrand').catch(e => e);
const queryBrands = ({ payload }) => fetch.post('/haierp1/item/brand/queryBrands', { data: payload }).catch(e => e);
const addBrand = ({ payload }) => fetch.post('/haierp1/item/brand/add', { data: payload }).catch(e => e);
const updateBrand = ({ payload }) => fetch.post('/haierp1/item/brand/update', { data: payload }).catch(e => e);
const queryBrand = ({ payload }) => fetch.post('/haierp1/item/brand/query', { data: payload }).catch(e => e);
const deleteBrand = ({ payload }) => fetch.post('/haierp1/item/brand/delete', { data: payload }).catch(e => e);
const updateVirtualInvByItemId = ({ payload }) => fetch.post('/haierp1/item/updateVirtualInvByItemId', { data: payload }).catch(e => e);
const getDimensionCodeUtil = ({ payload }) => fetch.post('/haierp1/item/getDimensionCodeUtil', { data: payload }).catch(e => e);
//采购商品
const queryFindProductList = ({ payload }) => fetch.post('/haierp1/item/finditem/queryFindItemList', { data: payload }).catch(e => e);
const queryFindProduct = ({ payload }) => fetch.post('/haierp1/item/finditem/passOrRefuse', { data: payload }).catch(e => e);
export default {
  namespace: 'products',
  state: {
    productsList: [],
    productsTotal: 0,
    productsValues: {}, // 修改商品时的值
    currentPage: 1, // 默认页码
    currentPageSize: 20,
    tree: [], // 类目树
    brandList: [], // 品牌
    allBrands: [],
    brandValue: {},
    brandTotal: 1,
    findItemTotal:0, // 采购商品总数
    findItemList: [], // 采购商品数据
    currentPageone: 1, // 默认采购页码
    currentPageSizeone: 20,//默认
    loginRoler:false,//默认普通人员
  },
  reducers: {
    saveCatesTree(state, { payload }) {
      return { ...state, tree: payload.data };
    },
    saveItemList(state, { payload }) {
      return { ...state, productsList: payload.rows, productsTotal: payload.total,loginRoler:payload.productRoler };
    },
    saveAllBrands(state, { payload }) {
      return { ...state, allBrands: payload.data };
    },
    saveBrands(state, { payload }) { // 保存品牌
      return { ...state, brandList: payload.data, brandTotal: payload.totalCount };
    },
    saveProductsValue(state, { payload }) {
      return { ...state, productsValues: payload };
    },
    saveCurrentPage(state, { payload }) {
      return { ...state, currentPage: payload.pageIndex };
    },
    saveCurrentPageSize(state, { payload }) {
      return { ...state, currentPageSize: payload.pageSize };
    },
     saveCurrentPageone(state, { payload }) {
      return { ...state, currentPageone: payload.pageIndex };
    },
    saveCurrentPageSizeone(state, { payload }) {
      return { ...state, currentPageSizeone: payload.pageSize };
    },
    saveBrand(state, { payload }) {
      return { ...state, brandValue: payload };
    },
    saveFindItems(state, { payload }) { // 保存采购商品
      return { ...state, findItemList: payload.rows, findItemTotal: payload.total };
    },
  },
  effects: {
    * addProducts({ payload, cb }, { call }) { // 新建商品
      const data = yield call(addProducts, { payload });
      if (data.success) {
        message.success('新增商品成功');
        cb();
      }
    },
    * queryProduct({ payload }, { call, put }) { // 修改商品
      const data = yield call(queryProduct, { payload });
      if (data.success) {
        // 处理图片缩略图
        if (data.data.mainPic && data.data.mainPic !== '0') {
          const picStr = decodeURIComponent(data.data.mainPic).replace(/&quot;/g, '"');
          const picObj = JSON.parse(picStr);
          picObj.picList.forEach((el) => {
            el.thumbUrl = `${el.url}?x-oss-process=image/resize,w_200,limit_0`;
          });
          // 写回去
          data.data.mainPic = JSON.stringify(picObj);
        }
        yield put({
          type: 'saveProductsValue',
          payload: data,
        });
      }
    },
    * updateProducts({ payload, cb }, { call }) { // 修改商品
      const data = yield call(updateProducts, { payload });
      if (data.success) {
        message.success('修改商品成功');
        cb();
      }
    },
    * updateVirtualInvByItemId({ payload, cb }, { call }) { // 清除商品虚拟库存
      const data = yield call(updateVirtualInvByItemId, { payload });
      if (data.success) {
        message.success('清除商品虚拟库存成功');
        cb();
      }
    },
    * getDimensionCodeUtil({ payload, cb }, { call }) { // 二维码生成成功
      const data = yield call(getDimensionCodeUtil, { payload });
      if (data.success) {
        message.success('商品对应二维码生成成功');
        cb();
      }
    },
    * queryItemList({ payload = {} }, { call, put, select }) { // 商品管理列表
      let pageIndex = yield select(({ products }) => products.currentPage);
      let pageSize = yield select(({ products }) => products.currentPageSize);
      if (payload && payload.pageIndex) {
        pageIndex = payload.pageIndex;
        yield put({ type: 'saveCurrentPage', payload });
      }
      if (payload && payload.pageSize) {
        pageSize = payload.pageSize;
        yield put({ type: 'saveCurrentPageSize', payload });
      }
      const data = yield call(queryItemList, { payload: { ...payload, pageIndex, pageSize } });
      if (data.success) {
        yield put({
          type: 'saveItemList',
          payload: data,
        });
      }
    },
    //采购商品管理
    * queryFindProductList({ payload }, { call, put, select}) { 
    	let pageIndex = yield select(({ products }) => products.currentPageone);
      let pageSize = yield select(({ products }) => products.currentPageSizeone);
      if (payload && payload.pageIndex) {
        pageIndex = payload.pageIndex;
        yield put({ type: 'saveCurrentPageone', payload });
      }
      if (payload && payload.pageSize) {
        pageSize = payload.pageSize;
        yield put({ type: 'saveCurrentPageSizeone', payload });
      }
      const data = yield call(queryFindProductList, { ...payload, pageIndex, pageSize });
      if (data.success) {
        yield put({
          type: 'saveFindItems',
          payload: data,
        });
      }
    },
     * queryFindProduct({ payload, cb }, { call }) { // 二维码生成成功
      const data = yield call(queryFindProduct, { payload });
      if (data.success) {
        message.success('采购商品审核成功！');
        cb();
      }
    },
    // 品牌管理
    * queryAllBrand(param, { call, put }) {
      const data = yield call(queryAllBrand);
      if (data.success) {
        yield put({
          type: 'saveAllBrands',
          payload: data,
        });
      }
    },
    * queryBrands({ payload }, { call, put }) { // 获取品牌
      const data = yield call(queryBrands, { payload });
      if (data.success) {
        yield put({
          type: 'saveBrands',
          payload: data,
        });
      }
    },
    * queryBrand({ payload }, { call, put }) {
      const data = yield call(queryBrand, { payload });
      if (data.success) {
        yield put({
          type: 'saveBrand',
          payload: data.data,
        });
      }
    },
    * updateBrand({ payload, cb }, { call }) {
      const data = yield call(updateBrand, { payload });
      if (data.success) {
        message.success('修改品牌成功');
        cb();
      }
    },
    * addBrand({ payload, cb }, { call }) {
      const data = yield call(addBrand, { payload });
      if (data.success) {
        message.success('新增品牌成功');
        cb();
      }
    },
    * deleteBrand({ payload, cb }, { call }) {
      const data = yield call(deleteBrand, { payload });
      if (data.success) cb();
    },
    * queryCatesTree(param, { call, put }) {
      const data = yield call(queryCatesTree);
      if (data.success) {
        yield put({
          type: 'saveCatesTree',
          payload: data,
        });
      }
    },
    * batchDelistingYouzan({ payload, cb }, { call }) {
      const data = yield call(batchDelistingYouzan, { payload });
      if (data.success) {
        message.success('批量下架成功');
        cb();
      }
    },
    * batchListingYouzan({ payload, cb }, { call }) {
      const data = yield call(batchListingYouzan, { payload });
      if (data.success) {
        message.success('批量上架成功');
        cb();
      }
    },
    * batchSynItemYouzan({ payload, cb }, { call }) {
      const data = yield call(batchSynItemYouzan, { payload });
      if (data.success) {
        message.success('批量同步成功');
        cb();
      }
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === '/products/productsList' && !window.existCacheState('/products/productsList')) {
          setTimeout(() => {
            dispatch({ type: 'queryItemList', payload: { pageIndex: 1 } });
            dispatch({ type: 'queryAllBrand', payload: query });
            dispatch({ type: 'queryCatesTree', payload: query });
          }, 0);
        }
        if ((pathname === '/products/productsList' && !window.existCacheState('/products/productsList')) || (pathname === '/products/skuList' && !window.existCacheState('/products/skuList'))) {
          setTimeout(() => {
            dispatch({ type: 'sku/queryPackageScales', payload: query });
            dispatch({ type: 'sku/queryScaleTypes', payload: query });
          }, 0);
        }
        if (pathname === '/products/brandList' && !window.existCacheState('/products/brandList')) {
          setTimeout(() => {
            dispatch({ type: 'queryBrands', payload: query });
          }, 0);
        }
        if (pathname === '/products/finditemList') {
          setTimeout(() => {
            dispatch({ type: 'queryFindProductList', payload: query });
          }, 0);
        }
      });
    },
  },
};
