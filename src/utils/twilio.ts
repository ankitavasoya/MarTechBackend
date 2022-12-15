import * as _ from 'lodash';
import { Twilio, validateRequest, twiml as Twiml } from 'twilio';
import { CallListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/call';
import { MessageListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/message';

import { AudienceCustomerInput } from '../db/models/audience_customer';
import { SalesRecordingInput } from "../db/models/salesrecordings";
import { Config } from '../utils/config';
import { updateTagsToCustomerValue } from './common';

export class TwilioHelper {
  private client: Twilio;
  constructor(accountSid: string, authToken: string) {
    this.client = new Twilio(accountSid, authToken);
  }

  makeVoiceCallOneByOne(
    audiences: AudienceCustomerInput[],
    salesRecordings: SalesRecordingInput[],
    fromNumber: string,
    companyId: string,
  ): Promise<any> {
    return Promise.all(audiences.map(audience => {
      // Generate a TwiML response
      let twiml = new Twiml.VoiceResponse();
      const gather = twiml.gather({
        numDigits: 1,
        action: `${Config.backendURL}/api/v1/sms/dtmf-callback?companyId=${companyId}&customerId=${audience.customer_id}`,
      });

      // Play the audio recording
      _.forEach(salesRecordings, recording => {
        gather.play(recording.url);
      });

      // Send the TwiML as the response.
      const xml = twiml.toString();

      const callObject: CallListInstanceCreateOptions = {
        twiml: xml,
        to: audience.customer.full_mobile,
        from: fromNumber,
      };
      return this.client.calls.create(callObject).then((messageInstance) => {
        return messageInstance;
      }).catch((err: any) => {
        return err;
      });
    }));
  };

  makeSMSOneByOne(audiences: AudienceCustomerInput[], message: string, msgServiceId: string): Promise<any> {
    return Promise.all(audiences.map(audience => {
      const body = updateTagsToCustomerValue(message, audience.customer);
      const smsObject: MessageListInstanceCreateOptions = {
        to: audience.customer.full_mobile,
        messagingServiceSid: msgServiceId,
        body,
      };
      return this.client.messages.create(smsObject).then((messageInstance) => {
        return messageInstance;
      }).catch((err: any) => {
        return err;
      });
    }));
  };
}
