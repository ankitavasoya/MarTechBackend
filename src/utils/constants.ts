import * as _ from 'lodash';

export const QUERY_OPERATORS = {
  CONTAINS: 'contains',
  EQUALS: 'equals',
  STARTS_WITH: 'startsWith',
  ENDS_WITH: 'endsWith',
  IS_EMPTY: 'isEmpty',
  IS_NOT_EMPTY: 'isNotEmpty',
};

export const SALES_TEMPLATES_TYPE = {
  SALES_BRIDGE: 'sales_bridge',
  SMS: 'sms',
  email: 'email',
};

export const ALL_ROLES = {
  NONE: 'none',
  MANAGEMENT: 'management',
  SUPERUSER: 'superuser',
  STORE_STAFF: 'store_staff',
  DRIVER: 'driver',
  CHEF: 'chef',
  SALES_REP: 'sales_rep',
};

export const ALL_ROLES_ARRAY = _.values(ALL_ROLES);

// constant for audience table


// it holds the creation status of audience list
export const AUDIENCE_CREATION_STATUS = {
  DEFAULT: 'default',
  INPROGRESS: 'inprogress',
  CREATED: 'created',
  DELETED: 'deleted',
};

export const AUDIENCE_CREATION_STATUS_ARRAY = _.values(AUDIENCE_CREATION_STATUS);

// it holds the status of audience, if the audience list is active or paused
export const AUDIENCE_STATUS = {
  DEFAULT: 'default',
  ACTIVE: 'active',
  PAUSED: 'paused',
};

export const AUDIENCE_STATUS_ARRAY = _.values(AUDIENCE_STATUS);

// it holds the status of campaign, if the campaign list is active or paused
export const CAMPAIGN_STATUS = {
  DEFAULT: 'default',
  ACTIVE: 'active',
  PAUSED: 'paused',
};

export const CAMPAIGN_STATUS_ARRAY = _.values(CAMPAIGN_STATUS);

export const MINIMUM_DELAY_TIME_FOR_MINUTES = 10; // 10 minutes
export const MINIMUM_DELAY_IN_JOBS_IN_SECONDS = 10; // 10 minutes
export const MINIMUM_DELAY_IN_IMMEDIATE_JOBS_IN_SECONDS = 5000; // 5 seconds
export const MINIMUM_DELAY_IN_PROCESSING_CUSTOMERS_JOBS_IN_SECONDS = 5000; // 5 seconds
export const MAX_CUSTOMER_CSV_ALLOWED = 20000; // max 20k records are allowed at once
export const CONTACT_CREATE_PROMISE_BATCH_RECORDS = 200; // max 200 records are created once

export const TYPE_ALL = 'all';

export const OPT_OUT_KEYWORDS = ['opt-out', 'optout'];