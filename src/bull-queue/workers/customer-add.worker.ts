import { Worker, Job } from 'bullmq'
import { v4 as uuidv4 } from 'uuid';
import * as _ from 'lodash';

import { QUEUES } from '../helpers/constants';
import Logger from '../../utils/logger';
import { CONTACT_CREATE_PROMISE_BATCH_RECORDS } from '../../utils/constants';
import { Models } from '../../db/models';
import { CustomerInput } from '../../db/models/customer';
import { CustomerAddressInput } from '../../db/models/customeraddress';
import { CustomerProductInput } from '../../db/models/customer_product';
import connection from '../helpers/connection';

const customerCSVProccessingWorker = new Worker(QUEUES.CUSTOMER_ADD, async (job: Job) => {
  // save the contact now

  Logger.info('Job Started Customer CSV Processing');
  Logger.info(`${job.id} ${job.name}`);
  Logger.info(`Adding customers ${job.data.customers.length}`);

  const batch = CONTACT_CREATE_PROMISE_BATCH_RECORDS;
  const tagId = job.data.tagId;
  const companyId = job.data.companyId;
  const customers = job.data.customers;

  const insertCustomers = async (index = 0): Promise<any> => {
    if (index >= customers.length) {
      return;
    }
    let customersBatch = _.slice(customers, index, index + batch);
    Logger.info(`Creating customers ${customersBatch.length} for ${companyId}`);
    const createdCustomers = await customerCreatePromise(customersBatch, companyId, tagId);

    Logger.info(`Creating customer address and product ${customersBatch.length} for ${companyId}`);
    const customerAddressProducts = await customerAddressProductCreatePromise(createdCustomers, customersBatch);

    Logger.info(`Inserted ${createdCustomers.length} for ${companyId}`);
    // save it now
    index += batch;
    return insertCustomers(index);
  }
  await insertCustomers();
  Logger.info(`Customers successfully created for company ${companyId}`);
  return {};
},
{connection});

customerCSVProccessingWorker.on('completed', (job: Job) => {
  Logger.info('Job Completed');
  Logger.info(`${job.id} ${job.name}`);
  return job;
});

customerCSVProccessingWorker.on('error', (err) => {
  Logger.error('Job Error');
  Logger.error(err);
  return err;
});

customerCSVProccessingWorker.on('failed', (err) => {
  Logger.error('Job Failed');
  Logger.error(err);
  return err;
});

const getAddress = (customer: any) => {
  let newAddress: any = {};
  if (customer.full_address && customer.full_address.trim() !== '') {
    const address = _.reverse(_.split(customer.full_address, ','));
    if (address.length) {
      let [country, zip, state, city, ...street] = address;
      newAddress.country = country ? country.trim() : '';
      newAddress.zipCode = parseInt(zip) || 0;
      newAddress.state = state ? state.trim() : '';
      newAddress.city = city ? city.trim() : '';
      newAddress.address = street && street.length ? street.join(', ') : '';
    }
  } else {
    newAddress.address = customer.address;
    newAddress.city = customer.city;
    newAddress.state = customer.state;
    newAddress.zipCode = parseInt(customer.zip) || 0;
    newAddress.country = customer.country;
  }
  return newAddress;
}

const customerCreatePromise = async (customersBatch: any[], companyId: string, tagId: string) => {
  // we will create bulk customers
  const customerInsert: CustomerInput[] = [];
  _.forEach(customersBatch, (customer: any) => {
    customerInsert.push({
      id: uuidv4(),
      first_name: customer.firstname,
      last_name: customer.lastname,
      name: customer.fullname,
      email: customer.email,
      country_code: customer.country_code,
      mobile: customer.phone,
      customer_from: '',
      company_id: companyId,
      tag_id: tagId,
      customer_company_name: customer.company_name,
      customer_job_title: customer.job_title
    });
  });
  return Models.Customer.bulkCreate(customerInsert);
}


const customerAddressProductCreatePromise = async (customers: CustomerInput[], customersBatch: any[]) => {
  const customerAddressInsert: CustomerAddressInput[] = [];
  const customerProductInsert: CustomerProductInput[] = [];
  // we will create bulk customer address and products
  _.forEach(customersBatch, (customer: any, index: number) => {
    const address = {
      id: uuidv4(),
      ...getAddress(customer),
      customer_id: customers[index].id,
      longitude: null,
      latitude: null,
    };
    customerAddressInsert.push(address);
    customerProductInsert.push({
      id: uuidv4(),
      order_code: '',
      product_name: customer.product_name,
      sales_amount: parseFloat(customer.sales_amount) || 0,
      customer_id: customers[index].id,
    })
  });
  return Promise.all([
    Models.CustomerAddress.bulkCreate(customerAddressInsert),
    Models.CustomerProduct.bulkCreate(customerProductInsert),
  ]);
}

export default customerCSVProccessingWorker;