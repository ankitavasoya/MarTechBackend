import CallLogs from './calllogs';
import Company from './company';
import Customer from './customer';
import CustomerAddress from './customeraddress';
import Industry from './industry';
import MealDeliverySubscription from './mealdeliverysubscription';
import Message from './message';
import SalesRecording from './salesrecordings';
import SalesTemplate from './salestemplates';
import User from './user';
import Audience from './audience';
import AudienceCustomer from './audience_customer';
import Campaign from './campaign';
import CampaignStep from './campaign_step';
import CampaignStepTrigger from './campaign_step_trigger';
import CampaignStepLog from './campaign_step_log';
import EmailSender from './email_sender';
import CustomerTag from './customer_tags';
import CustomerProduct from './customer_product';

// Associations

// Calllog 
CallLogs.belongsTo(Customer, {
  as: 'customer',
  foreignKey: 'customer_id',
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL',
});
CallLogs.belongsTo(User, {
  as: 'users',
  foreignKey: 'user_id',
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL',
});
CallLogs.belongsTo(Company, {
  as: 'companys', // send by our company id
  foreignKey: 'company_id',
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL',
});

// Customer
Customer.hasOne(CustomerAddress, {
  as: 'customerAddress',
  foreignKey: 'customer_id',
});
Customer.hasOne(MealDeliverySubscription, {
  as: 'mealDeliverySubscription',
  foreignKey: 'customer_id',
});
Customer.hasOne(CustomerProduct, {
  as: 'customerProduct',
  foreignKey: 'customer_id',
});
Customer.hasMany(Message, {
  as: 'fromMessage',
  foreignKey: 'from_customer_id',
});
Customer.hasMany(Message, {
  as: 'toMessage',
  foreignKey: 'to_customer_id',
});
Customer.hasMany(CallLogs, {
  as: 'callLogs',
  foreignKey: 'customer_id',
});
Customer.hasMany(AudienceCustomer, {
  as: 'customers',
  foreignKey: 'customer_id',
});

// Company
Company.belongsTo(Industry, {
  as: 'industry',
  foreignKey: 'industry_id',
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL',
});

// Add relationship: a company belong to one specific user.
Company.hasMany(User, {
  as: 'users', // the local variable name to store the user information (e.g: calling company.user.email will give you the  email of the user)
  foreignKey: 'company_id', // use the user_id to fetch the user information from the user table
});

Company.hasMany(EmailSender, {
  as: 'emailSenders',
  foreignKey: 'company_id',
});

Company.hasMany(CustomerTag, {
  as: 'customerTags',
  foreignKey: 'company_id',
});


// CustomerAddress
CustomerAddress.belongsTo(Customer, {
  as: 'customer', // the local variable name to store the user information (e.g: calling company.user.email will give you the  email of the user)
  foreignKey: 'customer_id', // use the user_id to fetch the user information from the user table
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL',
});

// Industry
Industry.hasMany(Company, {
  as: 'companies', // this will create an attribute companies (array) that hold the list of entites of the table Company that belong to the current industry
  foreignKey: 'industry_id', // indicate the name of the reference field (it helps to execute  SELECT * FROM companys WHERE industry_id = id)
});

// MealDeliverySubscription
MealDeliverySubscription.belongsTo(Customer, {
  as: 'customer', // the local variable name to store the user information (e.g: calling company.user.email will give you the  email of the user)
  foreignKey: 'customer_id', // use the user_id to fetch the user information from the user table
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL',
});

// Message
Message.belongsTo(Customer, {
  as: 'from_customer', // the local variable name to store the user information (e.g: calling company.user.email will give you the  email of the user)
  foreignKey: 'from_customer_id',
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL',
});
Message.belongsTo(Customer, {
  as: 'to_customer', // the local variable name to store the user information (e.g: calling company.user.email will give you the  email of the user)
  foreignKey: 'to_customer_id',
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL',
});
Message.belongsTo(User, {
  as: 'users', // send by our user id
  foreignKey: 'user_id',
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL',
});
Message.belongsTo(Company, {
  as: 'companys', // send by our company id
  foreignKey: 'company_id',
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL',
});

// SalesRecording
SalesRecording.belongsTo(SalesTemplate, {
  as: 'sales_template',
  foreignKey: 'sales_template_id',
});

// SalesTemplate
SalesTemplate.hasMany(SalesRecording, {
  as: 'sales_recordings',
  foreignKey: 'sales_template_id',
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL',
});

// User
User.belongsTo(Company, {
  as: 'companyInfo',
  foreignKey: 'company_id',
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL',
});
User.hasMany(Message, {
  as: 'messages',
  foreignKey: 'user_id',
});
User.hasMany(CallLogs, {
  as: 'callLogs',
  foreignKey: 'user_id',
});

// Audience
Audience.hasMany(AudienceCustomer, {
  as: 'audiencesCustomers',
  foreignKey: 'audience_id',
});

Audience.hasMany(Campaign, {
  as: 'campaigns',
  foreignKey: 'audience_id',
});

// Audience Customer
AudienceCustomer.belongsTo(Customer, {
  as: 'customer',
  foreignKey: 'customer_id',
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL',
});

AudienceCustomer.belongsTo(Audience, {
  as: 'audiences',
  foreignKey: 'audience_id',
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL',
});

// Campaign
Campaign.belongsTo(Audience, {
  as: 'audiences',
  foreignKey: 'audience_id',
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL',
});

Campaign.hasMany(CampaignStep, {
  as: 'campaignsSteps',
  foreignKey: 'campaign_id',
  onDelete: 'CASCADE',
  hooks: true 
});

// Campaign Steps
CampaignStep.hasMany(CampaignStepTrigger, {
  as: 'campaignsStepsTriggers',
  foreignKey: 'campaign_step_id',
});
CampaignStep.belongsTo(Campaign, {
  as: 'campaign',
  foreignKey: 'campaign_id',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE', // onDelete CASCADE error
  hooks: true
});
CampaignStep.belongsTo(SalesTemplate, {
  as: 'salesTemplate',
  foreignKey: 'step_sales_template_id',
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL',
});

// Campaign Step Trigger
CampaignStepTrigger.belongsTo(CampaignStep, {
  as: 'campaignStep',
  foreignKey: 'campaign_step_id',
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL',
});

// Campaign Step Log
CampaignStepLog.belongsTo(CampaignStep, {
  as: 'campaignStep',
  foreignKey: 'campaign_step_id',
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL',
});

CampaignStepLog.belongsTo(Audience, {
  as: 'audience',
  foreignKey: 'audience_id',
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL',
});

CampaignStepLog.belongsTo(Customer, {
  as: 'customer',
  foreignKey: 'customer_id',
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL',
});

// CustomerProduct
CustomerProduct.belongsTo(Customer, {
  as: 'customer', // the local variable name to store the user information (e.g: calling company.user.email will give you the  email of the user)
  foreignKey: 'customer_id', // use the user_id to fetch the user information from the user table
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL',
});

export const Models = {
  CallLogs,
  Customer,
  Company,
  CustomerAddress,
  Industry,
  MealDeliverySubscription,
  Message,
  SalesRecording,
  SalesTemplate,
  User,
  Audience,
  AudienceCustomer,
  Campaign,
  CampaignStep,
  CampaignStepTrigger,
  CampaignStepLog,
  EmailSender,
  CustomerTag,
  CustomerProduct,
};
