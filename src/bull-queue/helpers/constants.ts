export const QUEUES = {
  CAMPAIGN_CALL: 'campaign_call',
  CAMPAIGN_SMS: 'campaign_sms',
  CAMPAIGN_EMAIL: 'campaign_email',
  CAMPAING_STEP_TRIGGER: 'campaing_step_trigger',
  AUDIENCE_BATCH: 'audience_batch', // to send all audience and 100 each to AUDIENCE
  CUSTOMER_ADD: 'customer_add',
};

export const JOB_NAMES = {
  AUDIENCE: {
    PROCESS_AUDIENCE_ALL: 'process_audience_all',
  },
  CAMPAIGN: {
    PROCESS_CALLS: 'process_calls', // this will process campaign type calls
    PROCESS_SMS: 'process_sms', // this will process campaign type sms
    PROCESS_EMAIL: 'process_email', // this will process campaign type email
    PROCESS_CAMPAING_STEP_TRIGGER: 'process_campaing_step_trigger' // this will process each campaign step trigger
  },
  CUSTOMER: {
    ADD: 'customer_add',
  },
};

export const CAMPAIGN_PHONE_NUMBERS_CALL_SEND = 50;
export const CAMPAIGN_PHONE_NUMBERS_SMS_SEND = 50;
export const CAMPAIGN_PHONE_NUMBERS_EMAIL_SEND = 50;

export const RETRY_CONFIG = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
};
