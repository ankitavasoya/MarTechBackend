import { Worker, Job } from 'bullmq'
import { v4 as uuidv4 } from 'uuid';

import { QUEUES } from '../helpers/constants';
import { CustomerController } from '../../controllers/customers';
import { Models } from '../../db/models';
import Logger from '../../utils/logger';
import * as Constants from '../../utils/constants';
import * as _ from 'lodash';
import { AudienceCustomerInput } from '../../db/models/audience_customer';
import connection from '../helpers/connection';

const audienceBatchWorker = new Worker(QUEUES.AUDIENCE_BATCH, async (job: Job) => {

  // Optionally report some progress
  let count = 1000; // send 1000 to new job that will save in the db
  let filters = job.data.filters;
  let companyId = job.data.companyId;

  let totalCustomers: number;

  const audience = job.data.audience;
  Logger.info(`Will add customers in audience ${audience.id}`);

  const sendCustomersToAudienceQueue = async (index = 0, page = 0): Promise<number> => {
    if (index >= totalCustomers) {
      return totalCustomers;
    }

    const [customers, total] = await CustomerController.getCustomersData({
      page, count, filters, attributes: ['id', 'is_deleted'], companyId
    });

    // print total no of customer will be processed
    if (!totalCustomers) {
      Logger.info(`Processing total ${total} customers for audience ${audience.id}`);
      totalCustomers = total;
    }

    // prepare for bulk insert
    const audienceCustomerArray = _.map(customers, (customer): AudienceCustomerInput => ({
      id: uuidv4(),
      audience_id: audience.id,
      customer_id: customer.id,
    }));

    // save to db
    await Models.AudienceCustomer.bulkCreate(audienceCustomerArray)
    Logger.info(`Added ${audienceCustomerArray.length} customers for audience ${audience.id} page ${page} count ${count}`);

    index += count;
    page += 1;
    return sendCustomersToAudienceQueue(index, page);
  }
  await sendCustomersToAudienceQueue();

  Logger.info(`Successfully sent ${totalCustomers} customers for audience ${audience.id}`);

  // update audience status as created
  await Models.Audience.update({
    creation_status: Constants.AUDIENCE_CREATION_STATUS.CREATED,
  },
    {
      where: {
        id: audience.id,
      },
    });
  return totalCustomers;
},
{connection},);

audienceBatchWorker.on('error', (err) => {
  Logger.error(err);
  return err;
});

audienceBatchWorker.on('failed', (err) => {
  Logger.warn(err);
  return err;
});

export default audienceBatchWorker;