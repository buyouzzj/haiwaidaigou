import React, { Component } from 'react';
import classNames from 'classnames';
import styles from './style.less';
import Header from '../Header';
import Sidebar from '../Sidebar';
import Breadcrumb from '../Breadcrumb';
import HistoryTab from '../HistoryTab';
import { routerCfg } from '../../constants';

export default class MainLayout extends Component {
  constructor() {
    super();
    this.state = { sidebarClose: !!localStorage.getItem('AIRUHUA_CLOSE_SIDEBAR') };
  }
  handleSidebarChange(status) {
    this.setState({ sidebarClose: status }, () => {
      if (status) localStorage.setItem('AIRUHUA_CLOSE_SIDEBAR', true);
      else {
        localStorage.removeItem('AIRUHUA_CLOSE_SIDEBAR');
      }
    });
  }
  render() {
    const { children, location } = this.props;
    const { pathname } = location;
    const { sidebarClose } = this.state;
    const showLogin = pathname === `/${routerCfg.LOGIN}`;
    const showSideBar = pathname === '/overview';
    const wrapperClass = classNames({
      [styles.wrapper]: true,
      [styles.loginWrapper]: showLogin,
      [styles.noSidebar]: showSideBar || sidebarClose,
    });

    return (
      <div id="main">
        {!showLogin && <Header location={location} />}
        {!showLogin && !showSideBar && <Sidebar location={location} close={sidebarClose} onOpenChange={this.handleSidebarChange.bind(this)} />}
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
