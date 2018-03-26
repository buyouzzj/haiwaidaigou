/* eslint-disable object-property-newline */
export const API_URL = 'http://118.178.126.143/haierp1/haiLogin';

// 后端权限码映射
export const backendCfg = {
  products: 'item',
  productsList: 'item_list',
  finditemList:'finditem_list',//采购商品列表
  brandList: 'item_brand',
  skuList: 'item_skulist',
  packageScale: 'item_scale',
  packageLevel: 'item_level',
  category: 'category',
  sale: 'sale',
  orderList: 'sale_outerorder',
  erpOrder: 'sale_erporder',
  shippingOrder: 'sale_shippingorder',
  returnOrder: 'sale_erpreturnorder',
  purchase: 'purchase',
  purchaseList: 'purchase_task',
  purchaseStorage: 'purchase_storage',
  uncompleteTaskDailyOrder: 'uncomplete_task_daily_order',
  person: 'seller',
  agencyType: 'seller_type',
  agencyList: 'seller_list',
  inventory: 'inventory',
  inventoryList: 'inventory_list',
  warehouse: 'inventory_warehouse',
  stockwarehouse: 'inventory_stockwarehouse',//备货仓库管理
  inout: 'inventory_inout',
  out: 'inventory_out',
  report: 'report',
  reportSaleByDay: 'report_sale_byday',
  reportSaleByCategory: 'report_sale_bycategory',
  reportSaleByBrand: 'report_sale_bybrand',
  reportItemListing: 'report_item_listing',
  reportShippingByDay: 'report_shipping_byday',
  reportDeliveryByDate: 'report_delivery_bydate',
  reportSaleRefund: 'report_sale_refund',
  reportFreightByDay: 'report_freight_byday',
  reportPurchaseBySku:'report_purchase_bysku',
  reportSaleByScale:'report_sale_byscale',
  reportSaleBySaleName:'report_sale_byscalename',
  receiptList:'receipt_List',
  receiptTaskList:'receipt_task_List',
  noneedtoPurchaseSku:'no_need_purchasesku',
  reportNoStockReport:'report_NoStockReport',
  reportPxPackageReport:'report_PxPackageReport',
  reportAvgReport:'report_AvgReport',
  reportTraSkuNoInventoryRepoort:'report_skuNoInventory',

  //文件管理
  fileManage: 'file_manage',
  fileManageSale: 'file_manage_sale',//销售
  fileManagePurchase: 'file_manage_purchase',//采购
  fileManageStock: 'file_manage_stock',//库存
  fileManageSynthesize: 'file_manage_synthesize',//综合

  /*wxuser:'wxuser',
  wxactivity:'wx_activity',*/
  
  
  // 内置
  overview: 'overview',
};

// 路由字符串常量配置
export const routerCfg = {
  // 登录
  LOGIN: 'login',
  // 总览
  OVERVIEW: 'overview',
  // 权限管理
  PERMISSION: 'permission',
  ROLE: 'role',
  RESOURCE: 'resource',
  USER: 'user',
  ORGANIZATION: 'organization',
  // 商品管理
  PRODUCTS: 'products',
  PRODUCTS_LIST: 'productsList',
  BRAND_LIST: 'brandList',
  SKU_LIST: 'skuList',
  CATE_LIST: 'cateList',
  PACKAGE_SCALE: 'packageScale',
  PACKAGE_LEVEL: 'packageLevel',
  FINDITEM_LIST:'finditemList',//采购商品列表
  // 销售管理
  SALE: 'sale',
  ORDER_LIST: 'orderList',
  ERP_ORDER: 'erpOrder',
  SHIPPING_ORDER: 'shippingOrder',
  RETURN_ORDER: 'returnOrder',
  // 采购管理
  PURCHASE: 'purchase',
  PURCHASE_LIST: 'purchaseList',
  PURCHASE_STORAGE: 'purchaseStorage',
  UNCOMPLETE_TASK_DAILY_ORDER: 'uncompleteTaskDailyOrder',
  RECEIPT_LIST:'receiptList',//新增小票管理
  RECEIPT_TASK_LIST:'receiptTaskList',//小票明细管理
  NO_NEED_PURCHASESKU:'noneedtoPurchaseSku',//新建未备货sku
  /*CHECK: 'check', // 盘点管理
  JOURNAL: 'journal', // 流水管理
  RECEIPT: 'receipt', // 小票管理*/
  // 客户管理
  PERSON: 'person',
  AGENCY_LIST: 'agencyList',
  AGENCY_TYPE: 'agencyType',
  // 库存管理
  INVENTORY: 'inventory',
  INVENTORY_LIST: 'inventoryList',
  WAREHOUSE: 'warehouse', // 仓库管理
  INOUT: 'inout', // 出入库管理
  OUT: 'out', // 出库单管理
  STOCKWAREHOUSE : 'stockwarehouse',//备货仓库管理
  
  
  // 报表管理
  REPORT: 'report',
  REPORT_SALE_BY_DAY: 'reportSaleByDay',
  REPORT_SALE_BY_CATEGORY: 'reportSaleByCategory',
  REPORT_SALE_BY_BRAND: 'reportSaleByBrand',
  REPORT_ITEM_LISTING: 'reportItemListing',
  REPORT_SHIPPING_BY_DAY: 'reportShippingByDay',
  REPORT_SALE_BYSCALE_NAME:'reportSaleBySaleName',//录入报表
  REPORT_DELIVERY_BY_DATE: 'reportDeliveryByDate',
  REPORT_SALE_REFUND: 'reportSaleRefund',
  REPORT_FREIGHT_BY_DAY: 'reportFreightByDay',
  REPORT_PURCHASE_BY_SKU: 'reportPurchaseBySku',//采购入库sku
  REPORT_SALE_BYSCALE:'reportSaleByScale',//服装尺寸占销售报表
  REPORT_NOSTOCKREPORT: 'reportNoStockReport',//未备货报表
  REPORT_PXPACKAGEREPORT:'reportPxPackageReport',//包裹未发出报表
  REPORT_AVGREPORT:'reportAvgReport',//包裹时效
  REPORT_TRASKUNOINVENTORYREPORT:'reportTraSkuNoInventoryRepoort', //在途未入库sku报表


  //文件管理
  FILE_MANAGE: 'fileManage',
  FILE_MANAGE_SALE: 'fileManageSale',//销售
  FILE_MANAGE_PURCHASE: 'fileManagePurchase',//采购
  FILE_MANAGE_STOCK: 'fileManageStock',//库存
  FILE_MANAGE_SYNTHESIZE: 'fileManageSynthesize',//综合
  //微信用户管理
  /*WXUSER:'wxuser',
  WXUSERLIST:'wxactivity',*/
  
};

export const originalNavigation = [
  { key: routerCfg.OVERVIEW, name: '总览', icon: 'laptop' },
  // { key: routerCfg.PERMISSION, name: '权限管理', icon: 'team',
  //   child: [
  //     { key: routerCfg.RESOURCE, name: '资源管理' },
  //     { key: routerCfg.ROLE, name: '角色管理' },
  //     { key: routerCfg.USER, name: '用户管理' },
  //     { key: routerCfg.ORGANIZATION, name: '部门管理' },
  //   ],
  // },
  { key: routerCfg.PRODUCTS, name: '商品管理', icon: 'bars',
    child: [
      { key: routerCfg.PRODUCTS_LIST, name: '商品列表' },
      { key: routerCfg.SKU_LIST, name: 'SKU管理' },
      { key: routerCfg.CATE_LIST, name: '类目管理' },
      { key: routerCfg.BRAND_LIST, name: '品牌管理' },
      { key: routerCfg.PACKAGE_SCALE, name: '包装规格类别' },
      { key: routerCfg.PACKAGE_LEVEL, name: '包装规格' },
      { key: routerCfg.FINDITEM_LIST, name: '采购商品' },
    ],
  },
  { key: routerCfg.SALE, name: '销售管理', icon: 'book',
    child: [
      { key: routerCfg.ORDER_LIST, name: '主订单管理' },
      { key: routerCfg.ERP_ORDER, name: '子订单管理' },
      { key: routerCfg.SHIPPING_ORDER, name: '发货单管理' },
      { key: routerCfg.RETURN_ORDER, name: '退单管理' },
    ],
  },
  { key: routerCfg.PURCHASE, name: '采购管理', icon: 'appstore-o',
    child: [
      { key: routerCfg.PURCHASE_LIST, name: '采购管理' },
      // { key: routerCfg.CHECK,
      //   name: '盘点管理',
      //   child: [
      //     { key: routerCfg.JOURNAL, name: '流水管理' },
      //     { key: routerCfg.RECEIPT, name: '小票管理' },
      //   ],
      // },
      { key: routerCfg.PURCHASE_STORAGE, name: '采购入库管理' },
      { key: routerCfg.RECEIPT_LIST, name: '采购小票管理' },
      { key: routerCfg.RECEIPT_TASK_LIST, name: '采购小票明细管理' },
      { key: routerCfg.UNCOMPLETE_TASK_DAILY_ORDER, name: '未完成采购管理' },
      { key: routerCfg.NO_NEED_PURCHASESKU, name: '新建未备货sku' },
    ],
  },
  { key: routerCfg.PERSON, name: '客户管理', icon: 'user',
    child: [
      { key: routerCfg.AGENCY_LIST, name: '销售管理' },
      { key: routerCfg.AGENCY_TYPE, name: '销售类别' },
    ],
  },
  { key: routerCfg.INVENTORY, name: '库存管理', icon: 'shopping-cart',
    child: [
      { key: routerCfg.INVENTORY_LIST, name: '库存管理' },
      { key: routerCfg.WAREHOUSE, name: '仓库管理' },
      { key: routerCfg.INOUT, name: '出入库记录' },
      { key: routerCfg.OUT, name: '出库单管理' },
      { key: routerCfg.STOCKWAREHOUSE, name: '备货仓管理' },
    ],
  },
  { key: routerCfg.REPORT, name: '报表管理', icon: 'file',
    child: [
      { key: routerCfg.REPORT_SALE_BY_DAY, name: '销售报表(按天)' },
      { key: routerCfg.REPORT_SALE_BY_CATEGORY, name: '销售报表(按类目)' },
      { key: routerCfg.REPORT_SALE_BY_BRAND, name: '销售报表(按品牌)' },
      { key: routerCfg.REPORT_ITEM_LISTING, name: '上新报表' },
      { key: routerCfg.REPORT_SHIPPING_BY_DAY, name: '发货报表' },
      { key: routerCfg.REPORT_SALE_BYSCALE_NAME, name: '销售录入单报表' },
      { key: routerCfg.REPORT_DELIVERY_BY_DATE, name: '发货报表(按人按天)' },
      { key: routerCfg.REPORT_SALE_REFUND, name: '退单报表' },
      { key: routerCfg.REPORT_FREIGHT_BY_DAY, name: '物流费报表' },
      { key: routerCfg.REPORT_PURCHASE_BY_SKU, name: '采购入库sku' },
      { key: routerCfg.REPORT_SALE_BYSCALE, name: '服装尺寸占销售比报表' },
      { key: routerCfg.REPORT_NOSTOCKREPORT, name: '未备货商品记录报表' },
      { key: routerCfg.REPORT_PXPACKAGEREPORT, name: '物流公司异常包裹报表' },
      { key: routerCfg.REPORT_AVGREPORT, name: '物流公司时效报表' },
      { key: routerCfg.REPORT_TRASKUNOINVENTORYREPORT, name: '7天在途未入库sku报表' },
      
      
    ],
  },
  { key: routerCfg.FILE_MANAGE, name: '文件管理', icon: 'database',
    child: [
      { key: routerCfg.FILE_MANAGE_SALE, name: '各部门文件管理' },
    ],
  },
   /*{ key: routerCfg.WXUSER, name: '小程序活动管理', icon: 'torsos',
    child: [
      { key: routerCfg.WXUSERLIST, name: '小程序优惠活动' },
    ],
  },*/
];

let navigation = [];

export function getNavigation() { return navigation; }
export function setNavigation(data) { navigation = data; }
