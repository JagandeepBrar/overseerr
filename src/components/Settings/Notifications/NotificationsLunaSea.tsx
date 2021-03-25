import axios from 'axios';
import { Field, Form, Formik } from 'formik';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useToasts } from 'react-toast-notifications';
import useSWR from 'swr';
import * as Yup from 'yup';
import globalMessages from '../../../i18n/globalMessages';
import Alert from '../../Common/Alert';
import Button from '../../Common/Button';
import LoadingSpinner from '../../Common/LoadingSpinner';
import NotificationTypeSelector from '../../NotificationTypeSelector';

const messages = defineMessages({
  agentenabled: 'Enable Agent',
  accessToken: 'Access Token',
  profile: 'Profile',
  isDeviceToken: 'Send to Single Device',
  isDeviceTokenTip:
    'Enable this option if you are using a device token for a single device',
  lunaseaVersionRequirementAlert: 'LunaSea Version Requirement',
  lunaseaVersionRequirementAlertDescription:
    'Notification support requires LunaSea v5.0.0 (or higher), which is currently in open beta testing.',
  lunaseasettingssaved: 'LunaSea notification settings saved successfully!',
  lunaseasettingsfailed: 'LunaSea notification settings failed to save.',
  validationAccessTokenRequired: 'You must provide a user or device token',
  testsent: 'Test notification sent!',
  notificationtypes: 'Notification Types',
});

const NotificationsLunaSea: React.FC = () => {
  const intl = useIntl();
  const { addToast } = useToasts();
  const { data, error, revalidate } = useSWR(
    '/api/v1/settings/notifications/lunasea'
  );

  const NotificationsLunaSeaSchema = Yup.object().shape({
    accessToken: Yup.string().required(
      intl.formatMessage(messages.validationAccessTokenRequired)
    ),
  });

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  return (
    <Formik
      initialValues={{
        enabled: data?.enabled,
        types: data?.types,
        accessToken: data?.options.accessToken,
        profile: data?.options.profile,
        isDeviceToken: data?.options.isDeviceToken,
        jsonPayload: data?.options.jsonPayload,
      }}
      validationSchema={NotificationsLunaSeaSchema}
      onSubmit={async (values) => {
        try {
          await axios.post('/api/v1/settings/notifications/lunasea', {
            enabled: values.enabled,
            types: values.types,
            options: {
              accessToken: values.accessToken,
              profile: values.profile,
              isDeviceToken: values.isDeviceToken,
              jsonPayload: values.jsonPayload,
            },
          });
          addToast(intl.formatMessage(messages.lunaseasettingssaved), {
            appearance: 'success',
            autoDismiss: true,
          });
        } catch (e) {
          addToast(intl.formatMessage(messages.lunaseasettingsfailed), {
            appearance: 'error',
            autoDismiss: true,
          });
        } finally {
          revalidate();
        }
      }}
    >
      {({ errors, touched, isSubmitting, values, isValid, setFieldValue }) => {
        const testSettings = async () => {
          await axios.post('/api/v1/settings/notifications/lunasea/test', {
            enabled: true,
            types: values.types,
            options: {
              accessToken: values.accessToken,
              profile: values.profile,
              isDeviceToken: values.isDeviceToken,
              jsonPayload: values.jsonPayload,
            },
          });

          addToast(intl.formatMessage(messages.testsent), {
            appearance: 'info',
            autoDismiss: true,
          });
        };

        return (
          <>
            <Alert
              title={intl.formatMessage(
                messages.lunaseaVersionRequirementAlert
              )}
              type="info"
            >
              <p className="mb-2">
                {intl.formatMessage(
                  messages.lunaseaVersionRequirementAlertDescription,
                  {
                    strong: function strong(msg) {
                      return (
                        <strong className="font-normal text-indigo-100">
                          {msg}
                        </strong>
                      );
                    },
                  }
                )}
              </p>
            </Alert>
            <Form className="section">
              <div className="form-row">
                <label htmlFor="enabled" className="checkbox-label">
                  {intl.formatMessage(messages.agentenabled)}
                </label>
                <div className="form-input">
                  <Field type="checkbox" id="enabled" name="enabled" />
                </div>
              </div>
              <div className="form-row">
                <label htmlFor="accessToken" className="text-label">
                  {intl.formatMessage(messages.accessToken)}
                  <span className="label-required">*</span>
                </label>
                <div className="form-input">
                  <div className="form-input-field">
                    <Field
                      id="accessToken"
                      name="accessToken"
                      type="text"
                      placeholder={intl.formatMessage(messages.accessToken)}
                    />
                  </div>
                  {errors.accessToken && touched.accessToken && (
                    <div className="error">{errors.accessToken}</div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <label htmlFor="profile" className="text-label">
                  {intl.formatMessage(messages.profile)}
                </label>
                <div className="form-input">
                  <div className="form-input-field">
                    <Field
                      id="profile"
                      name="profile"
                      type="text"
                      placeholder={intl.formatMessage(messages.profile)}
                    />
                  </div>
                  {errors.profile && touched.profile && (
                    <div className="error">{errors.profile}</div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <label htmlFor="isDeviceToken" className="checkbox-label">
                  <span>{intl.formatMessage(messages.isDeviceToken)}</span>
                  <span className="label-tip">
                    {intl.formatMessage(messages.isDeviceTokenTip)}
                  </span>
                </label>
                <div className="form-input">
                  <Field
                    type="checkbox"
                    id="isDeviceToken"
                    name="isDeviceToken"
                  />
                </div>
              </div>
              <div
                role="group"
                aria-labelledby="group-label"
                className="form-group"
              >
                <div className="form-row">
                  <span id="group-label" className="group-label">
                    {intl.formatMessage(messages.notificationtypes)}
                    <span className="label-required">*</span>
                  </span>
                  <div className="form-input">
                    <div className="max-w-lg">
                      <NotificationTypeSelector
                        currentTypes={values.types}
                        onUpdate={(newTypes) =>
                          setFieldValue('types', newTypes)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="actions">
                <div className="flex justify-end">
                  <span className="inline-flex ml-3 rounded-md shadow-sm">
                    <Button
                      buttonType="warning"
                      disabled={isSubmitting || !isValid}
                      onClick={(e) => {
                        e.preventDefault();

                        testSettings();
                      }}
                    >
                      {intl.formatMessage(globalMessages.test)}
                    </Button>
                  </span>
                  <span className="inline-flex ml-3 rounded-md shadow-sm">
                    <Button
                      buttonType="primary"
                      type="submit"
                      disabled={isSubmitting || !isValid}
                    >
                      {isSubmitting
                        ? intl.formatMessage(globalMessages.saving)
                        : intl.formatMessage(globalMessages.save)}
                    </Button>
                  </span>
                </div>
              </div>
            </Form>
          </>
        );
      }}
    </Formik>
  );
};

export default NotificationsLunaSea;
