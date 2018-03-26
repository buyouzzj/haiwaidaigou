import React, { Component } from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'dva/router';
import classNames from 'classnames';
import { getNavigation } from '../../constants';
import styles from './style.less';

let topMenus = [];
let getMenus = () => {};

class Menus extends Component {
  constructor() {
    super();
    this.state = {
      siderFold: false,
      navOpenKeys: [],
    };
  }
  componentDidMount() {
    setTimeout(() => {
      topMenus = getNavigation().map(item => item.key);

      getMenus = (menuArray, siderFold, pPath) => {
        const parentPath = pPath || '/';
        return menuArray.map((item) => {
          if (item.child) {
            return (
              <Menu.SubMenu key={item.key} title={<span>{item.icon ? <Icon type={item.icon} /> : ''}{siderFold && topMenus.indexOf(item.key) >= 0 ? '' : item.name}</span>}>
                {getMenus(item.child, siderFold, `${parentPath + item.key}/`)}
              </Menu.SubMenu>
            );
          } else {
            return (
              <Menu.Item key={item.key}>
                <Link to={parentPath + item.key}>
                  {item.icon ? <Icon type={item.icon} /> : ''}
                  {siderFold && topMenus.indexOf(item.key) >= 0 ? '' : item.name}
                </Link>
              </Menu.Item>
            );
          }
        });
      };

      const { location } = this.props;
      const parent = location.pathname.split('/')[1];
      this.changeOpenKeys(parent ? [parent] : []);
    }, 100);
  }
  changeOpenKeys(navOpenKeys) {
    this.setState({ navOpenKeys });
  }
  handleOpen() {
    if (this.props.onOpenChange) this.props.onOpenChange(!this.props.close);
  }
  render() {
    const { location, close } = this.props;
    const { /* navOpenKeys, */siderFold } = this.state;
    let navArr = [];
    let navParentPath = '/';
    getNavigation().forEach((nav) => {
      if (nav.key === (location.pathname.split('/')[1] || 'overview')) {
        if (nav.child) navArr = nav.child;
        navParentPath = `/${nav.key}/`;
      }
    });
    const menuItems = getMenus(navArr, siderFold, navParentPath);
    // const onOpenChange = (openKeys) => {
    //   const latestOpenKey = openKeys.find(key => !(navOpenKeys.indexOf(key) > -1));
    //   const latestCloseKey = navOpenKeys.find(key => !(openKeys.indexOf(key) > -1));
    //   let nextOpenKeys = [];
    //   if (latestOpenKey) {
    //     nextOpenKeys = getAncestorKeys(latestOpenKey).concat(latestOpenKey);
    //   }
    //   if (latestCloseKey) {
    //     nextOpenKeys = getAncestorKeys(latestCloseKey);
    //   }
    //   this.changeOpenKeys(nextOpenKeys);
    // };
    // const getAncestorKeys = (key) => {
    //   const map = {
    //     navigation2: ['navigation'],
    //   };
    //   return map[key] || [];
    // };
    // 菜单栏收起时，不能操作openKeys
    // const menuProps = !siderFold ? {
    //   onOpenChange,
    //   openKeys: navOpenKeys,
    // } : {};

    const asideClass = classNames({
      [styles.sidebar]: true,
      [styles.sidebarClose]: close,
    });

    const iconClass = classNames({
      [styles.iconClose]: close,
    });

    return (
      <aside className={asideClass}>
        <Menu
          /* ...menuProps */
          mode={siderFold ? 'vertical' : 'inline'}
          theme="dark"
          selectedKeys={[location.pathname.split('/')[location.pathname.split('/').length - 1] || 'overview']}
        >
          {menuItems}
        </Menu>
        <div className={styles.sideSwitch} onClick={this.handleOpen.bind(this)}><Icon type="caret-left" className={iconClass} /></div>
      </aside>
    );
  }
}

export default Menus;
