import React, { PropTypes } from 'react';
import { Breadcrumb, Icon } from 'antd';
import styles from './style.less';
import { getNavigation, routerCfg } from '../../constants';

function Bread({ location }) {
  // 生成移到后面
  const pathSet = [];
  const getPathSet = (menuArray, pPath) => {
    const parentPath = pPath || '/';
    menuArray.forEach((item) => {
      pathSet[(parentPath + item.key).replace(/\//g, '-').hyphenToHump()] = {
        path: parentPath + item.key,
        name: item.name,
        icon: item.icon || '',
        clickable: item.clickable === undefined,
      };
      if (item.child) {
        getPathSet(item.child, `${parentPath + item.key}/`);
      }
    });
  };

  getPathSet(getNavigation());

  const pathNames = [];
  location.pathname.substr(1).split('/').forEach((item, key) => {
    if (key > 0) {
      pathNames.push(`${pathNames[key - 1]}-${item}`.hyphenToHump());
    } else {
      pathNames.push(`-${item}`.hyphenToHump());
    }
  });
  const len = pathNames.length;
  const breads = pathNames.map((i, key) => {
    let item = i;
    if (!(i in pathSet)) {
      item = routerCfg.OVERVIEW[0].toUpperCase() + routerCfg.OVERVIEW.substr(1);
    }
    // 面包屑生成时，推一把Tab
    if (key === len - 1) {
      window.addHistoryTab({ name: pathSet[item].name, route: pathSet[item].path });
    }
    return (
      <Breadcrumb.Item key={key} {...((pathNames.length - 1 === key) || !pathSet[item].clickable) ? '' : { href: `#${pathSet[item].path}` }}>
        {pathSet[item].icon
          ? <Icon type={pathSet[item].icon} />
          : ''}
        <span>{pathSet[item].name}</span>
      </Breadcrumb.Item>
    );
  });

  return (
    <Breadcrumb className={styles.navigation}>
      <Breadcrumb.Item href="#/"><Icon type="home" />
        <span>主页</span>
      </Breadcrumb.Item>
      {breads}
    </Breadcrumb>
  );
}

Bread.propTypes = {
  location: PropTypes.object,
};

export default Bread;
