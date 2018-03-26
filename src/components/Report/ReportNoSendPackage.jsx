import React, { Component } from 'react';

class ReportNoSendPackage extends Component {
  render() {
    return (
      <div>
        <iframe src={`http://${location.host}/haierp1/bi/ship/selectPxImproperReport`} width="960" height="1280" scrolling="yes" />
      </div>
    );
  }
}

export default ReportNoSendPackage;
