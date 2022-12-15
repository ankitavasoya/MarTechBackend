import { Op } from 'sequelize';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as Constants from './constants';
import { StepCampaignContentType, StepCampaignType } from '../db/models/campaign_step';
import { TemplateType } from '../db/models/salestemplates';
import { CustomerInput } from '../db/models/customer';

interface Tags {
  key: string;
  value: string;
}

export const getSQLOperator = (operator: any, value: any) => {
  const query: any = {};
  if (operator === Constants.QUERY_OPERATORS.CONTAINS) {
    query[Op.iLike] = `%${value}%`;
  } else if (operator === Constants.QUERY_OPERATORS.EQUALS) {
    query[Op.eq] = value;
  } else if (operator === Constants.QUERY_OPERATORS.STARTS_WITH) {
    query[Op.startsWith] = value;
  } else if (operator === Constants.QUERY_OPERATORS.ENDS_WITH) {
    query[Op.endsWith] = value;
  } else if (operator === Constants.QUERY_OPERATORS.IS_EMPTY) {
    query[Op.or] = {
      [Op.eq]: null,
      [Op.eq]: '',
    };
  } else if (operator === Constants.QUERY_OPERATORS.IS_NOT_EMPTY) {
    query[Op.or] = {
      [Op.ne]: null,
      [Op.ne]: '',
    };
  }
  return query;
};

export const getPagination = (page: number, size: number) => {
  const limit = +size;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

export const getTrimAndLowerCase = (value: string) => value && value.trim().toLowerCase();
export const getTrim = (value: string) => value && value.trim();

/*
Accepts JSON Stringify or json
{
 items: [
  {columnField: "name", id: 41769, operatorValue: "contains"},
  {id: 95359, columnField: "mobile", operatorValue: "equals", value: "a"}
 ],
 linkOperator: "and"
}
*/
export const getQueryBuilder = (filterParams: any) => {
  let filters: any = {};
  try {
    filters = JSON.parse(filterParams);
  } catch (e) {
    filters = filterParams;
  }
  let finalQuery: any = {};
  const filterItems = _.get(filters, 'items', []);
  if (filterItems.length) {
    const queries: any = [];
    _.forEach(filterItems, (i) => {
      const item = i;
      if (item.value) {
        if (item.columnField.indexOf('.') !== -1) {
          item.columnField = `$${item.columnField}$`;
        }
        if (item.columnField.indexOf('createdAt') !== -1) {
          // todo: Needs to add date filtering
          if (moment(item.value).isValid()) {
            queries.push({
              [item.columnField]: getSQLOperator(
                item.operatorValue,
                moment(item.value).format('MM-DD-YYYY'),
              ),
            });
          }
        } else {
          queries.push({
            [item.columnField]: getSQLOperator(item.operatorValue, item.value),
          });
        }
      }
    });
    if (queries.length) {
      if (filters.linkOperator === 'and') {
        finalQuery = {
          [Op.and]: queries,
        };
      } else {
        finalQuery = {
          [Op.or]: queries,
        };
      }
    }
  } else if (_.keys(filters).length) {
    _.forEach(filters, (v, k) => {
      if (v) {
        finalQuery[k] = v;
      }
    });
  }
  return finalQuery;
};

/**
 * Checks if the given value is valid as phone number (+1898983989)
 * @param {Number|String} number
 * @return {Boolean}
 */
export const isAValidPhoneNumber = (number: string) => /^[\d\\+\-\\(\\) ]+$/.test(number);

/*
Check if a valid 10 digit number
*/
export const isAValid10DigitPhoneNumber = (number: string) => {
  const NUMBER_REGEXP = /[1-9]{1}[0-9]{9}/;
  if (!number || NUMBER_REGEXP.test(number)) {
    return true;
  }
  return false;
};

export const parseIntNumber = (string: string) => parseInt(string, 10);

export const Role = {
  isSuperUser: (user: any) => user.roleType === Constants.ALL_ROLES.SUPERUSER,
  isSuperUserOrManagement: (user: any) => user.roleType === Constants.ALL_ROLES.SUPERUSER || user.roleType === Constants.ALL_ROLES.MANAGEMENT,
  hasCompany: (user: any) => !_.isEmpty(user.company_id),
};

/* 
It gives nearest rounded number
Examples-> 10 will give 20, 11 will give 20, 19 will give 20, 20 will give 20, 21 will give 30
This is used in setting time for campaign, as the cron will run on every 10 minutes 
// and we cannot ask cron to run every minute
*/
export const getNearestRoundedNumber = (num: number) => {
  const TEN = 10;
  return Math.ceil(num / TEN) * TEN;
};


/* 
This will round the time to nearest 10th minutes
If time is 20:12, it will give 20:20 (if duration is 10)
*/
export const getRoundTimeCeil = (date: Date, duration: moment.DurationInputArg1) => {
  return moment(Math.ceil((+date) / (+duration)) * (+duration));
}

export const isCampaignTypeCall = (campaignType: StepCampaignType) => {
  return campaignType === StepCampaignType.CALL;
};

export const isCampaignTypeEmail = (campaignType: StepCampaignType) => {
  return campaignType === StepCampaignType.EMAIL;
};

export const isCampaignTypeSMS = (campaignType: StepCampaignType) => {
  return campaignType === StepCampaignType.SMS;
};

export const isContentTypeSalesBridge = (contentType: StepCampaignContentType) => {
  return contentType === StepCampaignContentType.SALES_BRIDGE;
};

export const isValidTemplateType = (type: string) => _.includes(_.values(TemplateType), type);

export const isTemplateTypeEmail = (templateType: string) => {
  return templateType === Constants.SALES_TEMPLATES_TYPE.email;
};

export const updateTagsToCustomerValue = (message: string, customer: CustomerInput) => {
  let updatedMsg = message;

  const getCustomerDataByKey = (key: string) => _.get(customer, key, '');
  const allTags: Tags[] = [
    { key: 'customer_name', value: getCustomerDataByKey('name') },
    { key: 'address', value: getCustomerDataByKey('customerAddress.address') },
    { key: 'zip', value: getCustomerDataByKey('customerAddress.zipCode') }
  ];
  _.forEach(allTags, (tags: Tags) => {
    updatedMsg = updatedMsg.replace(`{{${tags.key}}}`, tags.value);
  });
  return updatedMsg;
}

export const encodeBase64 = (str: string) => Buffer.from(str).toString('base64');
export const decodeBase64 = (str: string) => Buffer.from(str, 'base64').toString('ascii');

export const isUUID = (str: string) => (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).test(str);