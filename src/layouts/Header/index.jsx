import React from 'react';
import { Menu, Icon } from 'antd';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { routerCfg, getNavigation } from '../../constants';
import styles from './style.less';

class Header extends React.Component {
  logout() {
    this.props.dispatch({ type: 'session/logout' });
  }
  render() {
    const { session } = this.props;
    const { pathname } = this.props.location;
    return (
      <header className={styles.header}>
        <span className={styles.logo} />
        <Menu
          className={styles.navi}
          mode="horizontal"
          selectedKeys={[pathname.split('/')[1] || 'overview']}
        >
          {getNavigation().map((item) => {
            return (
              <Menu.Item
                key={item.key}
              >
                <Link to={`/${item.key}`}>
                  {item.icon ? <Icon type={item.icon} /> : ''}
                  {item.name}
                </Link>
              </Menu.Item>
            );
          })}
        </Menu>
        <span className={styles.user}>
          <span className={styles.mr10}><Icon type="user" /> { session.username }</span>
          {/* <span className={styles.mr10}><Icon type="lock" /> <Link to="/lock">修改密码</Link></span> */}
          <span><Icon type="logout" /> <span onClick={this.logout.bind(this)}><Link to={`/${routerCfg.LOGIN}`}>安全退出</Link></span></span>
        </span>
      </header>
    );
  }
}


function mapStateToProps({ session }) {
  return { session };
}

export default connect(mapStateToProps)(Header);
