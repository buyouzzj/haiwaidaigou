import { message } from 'antd';

export default () => {
  /* eslint-disable */
  // 连字符转驼峰
  String.prototype.hyphenToHump = function () {
    return this.replace(/-(\w)/g, function () {
      return arguments[1].toUpperCase()
    })
  }

  // 驼峰转连字符
  String.prototype.humpToHyphen = function () {
    return this.replace(/([A-Z])/g, '-$1').toLowerCase()
  }

  // 日期格式化
  Date.prototype.format = function (format) {
    var o = {
      'M+': this.getMonth() + 1,
      'd+': this.getDate(),
      'h+': this.getHours(),
      'H+': this.getHours(),
      'm+': this.getMinutes(),
      's+': this.getSeconds(),
      'q+': Math.floor((this.getMonth() + 3) / 3),
      'S': this.getMilliseconds()
    }
    if (/(y+)/.test(format)) { format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length)) }
    for (var k in o) {
      if (new RegExp('(' + k + ')').test(format)) {
        format = format.replace(RegExp.$1, RegExp.$1.length === 1
          ? o[k]
          : ('00' + o[k]).substr(('' + o[k]).length))
      }
    }
    return format
  }
  /* eslint-enable */

  const pageStorage = {
    data: {},
    getItem(key) { return this.data[key] || null; },
    setItem(key, dataStr) { this.data[key] = dataStr; },
  };

  function getState(_this) {
    const { pathname } = _this.props.location;
    const data = pageStorage.getItem(`airuhua_${pathname}`);
    if (data) {
      setTimeout(() => {
        if (data.state.sortField) data.state.sortField = null;
        if (data.state.sortOrder) data.state.sortOrder = null;
        _this.setState(data.state);
        _this.props.form.setFieldsValue(data.search);
      }, 0);
    }
  }

  function existState(pathname) {
    return !!pageStorage.getItem(`airuhua_${pathname}`);
  }

  function clearState(pathname) {
    pageStorage.setItem((`airuhua_${pathname}`), null);
  }

  function setState(_this) {
    const { pathname } = _this.props.location;
    if (pathname) {
      let cacheData = pageStorage.getItem(`airuhua_${pathname}`);
      if (!cacheData) cacheData = {};
      // 搜索表单
      cacheData.search = _this.props.form.getFieldsValue();
      // 状态
      cacheData.state = _this.state;
      pageStorage.setItem((`airuhua_${pathname}`), cacheData);
    }
  }

  window.regStateCache = (target) => {
    target.prototype.componentWillMount = function mount() {
      getState(this);
    };
    target.prototype.componentWillUnmount = function unmount() {
      setState(this);
    };
    target.prototype._refreshData = function refresh() {
      this.handleSubmit(null, this.props.currentPageSkuIndex || this.props.currentPage || 1, this.props.currentPageSize);
    };
  };

  window.getCacheState = getState;
  window.existCacheState = existState;
  window.clearCacheState = clearState;

  let historyTabs = [];

  window.addHistoryTab = function add(payload) {
    if (payload) {
      let isExists = false;
      historyTabs.forEach((tab) => {
        if (tab.route === payload.route) isExists = true;
      });
      if (!isExists) {
        if (historyTabs.length >= 10) {
          message.error('最多打开10个标签页，请关闭标签页后重试');
          return;
        }
        historyTabs.push({ route: payload.route, title: payload.name, key: payload.route });
        window.renderHistoryTab(historyTabs);
      }
    }
  };

  window.renderHistoryTab = function render(tabs, route) {
    window._renderHistoryTab([...tabs], route);
  };

  window.removeHistoryTab = function remove(key, currentPath) {
    let i = -1;
    const newTabs = historyTabs.filter((tab, index) => {
      if (tab.route === key) {
        i = index;
        return false;
      }
      return true;
    });
    if (i === 0) i = 1;
    else i -= 1;
    const route = historyTabs[i].route;
    historyTabs = newTabs;
    window.renderHistoryTab(newTabs, key === currentPath ? route : undefined);
  };
};
