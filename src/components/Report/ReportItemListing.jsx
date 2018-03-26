import React, { Component } from 'react';

class ReportItemListing extends Component {
  render() {
    return (
      <div>
        <iframe src={`http://${location.host}/haierp1/bi/item/selectBiItemListingReportByGmtCreate`} width="960" height="1280" scrolling="yes" />
      </div>
    );
  }
}

export default ReportItemListing;
