import catchAsync from '../utils/catchAsync';

const bizSdk = require('facebook-nodejs-business-sdk');

// ('use strict');
const customAudience = catchAsync(async (req: any, res: any) => {

  /**
* Copyright (c) 2017-present, Facebook, Inc.
* All rights reserved.
*
* This source code is licensed under the license found in the
* LICENSE file in the root directory of this source tree.
* @flow
*/
  const AdAccount = bizSdk.AdAccount;
  const Campaign = bizSdk.Campaign;
  const CustomAudience = bizSdk.CustomAudience;
  const AdSet = bizSdk.AdSet;
  const AdCreative = bizSdk.AdCreative;
  const Ad = bizSdk.Ad;
  const AdPreview = bizSdk.AdPreview;

  let access_token = 'EAAEYohwLlr8BABCX2hYcrr1Xy1f40UTayTYrJkXJwGrvjpgcOfLZBXzKTWfDiMsIKZBePmzIr1T9C92Ni3SW92HfdK3nmkeDOxi2VQP9GKDH34EjxdAA71ZBieMEHi7cvyBuZAimDMMoQccQZC4I8DsZBtHUqJDHitUdNvdWnYi1qxy6K9tsiV2sN6d6TGeWYZD';
  let app_secret = 'd165aff6e285ae72f0eb26b6ed2fad57';
  let ad_account_id = 'act_223760846577077';
  let audience_name = 'audience';
  let audience_retention_days = '30';
  let pixel_id = '1094162808002528';
  let app_id = 'PEKhTm75YBPYUw_afAwfK5uHgzs';
  const api = bizSdk.FacebookAdsApi.init(access_token);
  const account = new AdAccount(ad_account_id);
  const showDebugingInfo = true; // Setting this to true shows more debugging info.
  if (showDebugingInfo) {
    api.setDebug(true);
  }

  let campaign;
  let campaign_id: any;
  let custom_audience;
  let custom_audience_id;
  let ad_set;
  let ad_set_id: any;
  let creative;
  let creative_id;
  let ad;
  let ad_id;
  let adpreview;
  let adpreview_id;

  const logApiCallResult = (apiCallName: any, data: any) => {
    console.log(apiCallName);
    if (showDebugingInfo) {
      res.send(data)
      console.log('Data:' + JSON.stringify(data));
    }
  };

  const fields: any = [];
  const params: any = {
    'name': 'My Campaign',
    'buying_type': 'AUCTION',
    'objective': 'LINK_CLICKS',
    'status': 'PAUSED',
    'special_ad_categories': []
  };
  campaign = (await new AdAccount(ad_account_id)).createCampaign(
    fields,
    params

  );

  campaign
    .then((result: any) => {
      logApiCallResult('campaign api call complete.', result);
      campaign_id = result.id;
      console.log("campaign_id", campaign_id);

      const fields: any = []
      const params: any = {
        'name': 'Value-Based Custom Audience',
        'subtype': 'CUSTOM',
        'is_value_based': '1',
        'customer_file_source': 'PARTNER_PROVIDED_ONLY',
      };

      return (new AdAccount(ad_account_id)).createCustomAudience(fields, params);
    })
    .catch((error: any) => {
      console.log(error);
    });
});

export default { customAudience };
