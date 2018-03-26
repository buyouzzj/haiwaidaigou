import React, { Component } from 'react';
import classNames from 'classnames';
import styles from './style.less';
import Header from '../Header';
import Sidebar from '../Sidebar';
import Breadcrumb from '../Breadcrumb';
import HistoryTab from '../HistoryTab';
import { routerCfg } from '../../constants';

export default class MainLayout extends Component {
  componentDidMount() {
    const container = document.querySelector('.main-wrap');
    let floated = false;
    container.addEventListener('scroll', () => {
      const scrollTop = container.scrollTop;
      const pathname = this.props.location.pathname;
      if (pathname.indexOf(routerCfg.PRODUCTS_LIST) > -1) {
        const table = document.querySelector('.table-wrapper');
        const tableBody = document.querySelector('.ant-table-body');
        const placeholder = document.querySelector('.table-placeholder');
        if (scrollTop > 320) {
          if (!floated) {
            placeholder.style.height = `${table.offsetHeight}px`;
            table.classList.add('table-abs');
            setTimeout(() => {
              tableBody.style.maxHeight = '600px';
              tableBody.style.overflowY = 'scroll';
            }, 0);
            floated = true;
          }
        } else {
          if (table.className.indexOf('table-abs') > -1) {
            table.classList.remove('table-abs');
            setTimeout(() => {
              tableBody.style.maxHeight = 'auto';
              tableBody.style.overflowY = 'visible';
            }, 0);
          }
          floated = false;
        }
      }
    });
  }
  render() {
    const { children, location } = this.props;
    const { pathname } = location;
    const showLogin = pathname === `/${routerCfg.LOGIN}`;
    const showSideBar = pathname === '/overview';
    const wrapperClass = classNames({
      'main-wrap': true,
      [styles.wrapper]: true,
      [styles.loginWrapper]: showLogin,
      [styles.noSidebar]: showSideBar,
    });
    return (
      <div id="main">
        {!showLogin && <Header location={location} />}
        {!showLogin && !showSideBar && <Sidebar location={location} />}
        <div className={wrapperClass}>
          {!showLogin && <HistoryTab location={location} />}
          {!showLogin && <Breadcrumb location={location} />}
          <div className={styles.content}>
            {children}
          </div>
        </div>
      </div>
    );
  }
}
