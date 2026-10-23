'use client';
import { useId, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { IS_DESIGN_PREVIEW, submitPublicRequest } from '@/lib/showroom';
import { CONTACT_INFO } from '@/lib/constants';
export interface RequestField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'select';
  required?: boolean;
  placeholder?: string;
  options?: string[];
  min?: string | number;
  max?: string | number;
  full?: boolean;
}
export default function PublicRequestForm({
  endpoint,
  fields,
  defaults = {},
  payload = {},
  buttonLabel = 'Request a callback',
  successMessage = 'Our team will call you about your request.',
}: {
  endpoint: string;
  fields: RequestField[];
  defaults?: Record<string, string>;
  payload?: Record<string, unknown>;
  buttonLabel?: string;
  successMessage?: string;
}) {
  const id = useId();
  const [values, setValues] = useState<Record<string, string>>(defaults);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const allFields: RequestField[] = [
    {
      name: 'customerName',
      label: 'Your name',
      required: true,
      placeholder: 'Full name',
    },
    {
      name: 'mobile',
      label: 'Mobile number',
      required: true,
      placeholder: '10-digit mobile',
    },
    ...fields,
  ];
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (
      !values.customerName?.trim() ||
      !/^[6-9]\d{9}$/.test(values.mobile || '')
    ) {
      setError('Enter your name and a valid 10-digit Indian mobile number.');
      return;
    }
    const invalid = fields.find(
      (field) => field.required && !values[field.name]?.trim(),
    );
    if (invalid) {
      setError('Please enter ' + invalid.label.toLowerCase() + '.');
      return;
    }
    setSubmitting(true);
    const cleaned = Object.fromEntries(
      Object.entries(values)
        .map(([key, value]) => [key, value.trim()])
        .filter(([, value]) => value !== ''),
    );
    try {
      await submitPublicRequest(endpoint, { ...payload, ...cleaned });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  if (submitted)
    return (
      <div className="request-success" role="status">
        <span className="success-mark">
          <Check />
        </span>
        <h3>
          {IS_DESIGN_PREVIEW
            ? 'Your draft request is ready.'
            : 'Thank you. Request received.'}
        </h3>
        <p>
          {IS_DESIGN_PREVIEW
            ? 'This is a design preview. No request was sent to the showroom.'
            : successMessage}
        </p>
        <button
          className="button button-secondary"
          onClick={() => {
            setSubmitted(false);
            setValues(defaults);
          }}
        >
          Make another enquiry <ArrowRight size={16} />
        </button>
      </div>
    );
  return (
    <form className="gm-form request-form" onSubmit={submit}>
      <div className="request-fields">
        {allFields.map((field) => (
          <div className={field.full ? 'field-full' : ''} key={field.name}>
            <label htmlFor={id + field.name}>
              {field.label}
              {!field.required && <span className="optional">Optional</span>}
            </label>
            {field.type === 'select' ? (
              <select
                id={id + field.name}
                required={field.required}
                value={values[field.name] || ''}
                onChange={(e) =>
                  setValues({ ...values, [field.name]: e.target.value })
                }
              >
                <option value="">Select</option>
                {field.options?.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                id={id + field.name}
                rows={3}
                maxLength={1500}
                value={values[field.name] || ''}
                required={field.required}
                placeholder={field.placeholder}
                onChange={(e) =>
                  setValues({ ...values, [field.name]: e.target.value })
                }
              />
            ) : (
              <input
                id={id + field.name}
                type={field.name === 'mobile' ? 'tel' : field.type || 'text'}
                inputMode={field.name === 'mobile' ? 'numeric' : undefined}
                autoComplete={
                  field.name === 'customerName'
                    ? 'name'
                    : field.name === 'mobile'
                      ? 'tel-national'
                      : field.type === 'email'
                        ? 'email'
                        : undefined
                }
                pattern={field.name === 'mobile' ? '[6-9][0-9]{9}' : undefined}
                required={field.required}
                min={field.min}
                max={field.max}
                maxLength={field.name === 'mobile' ? 10 : 150}
                value={values[field.name] || ''}
                placeholder={field.placeholder}
                onChange={(e) =>
                  setValues({
                    ...values,
                    [field.name]:
                      field.name === 'mobile'
                        ? e.target.value.replace(/\D/g, '').slice(0, 10)
                        : e.target.value,
                  })
                }
              />
            )}
          </div>
        ))}
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error} <a href={'tel:' + CONTACT_INFO.phoneRaw}>Call the showroom</a>
        </p>
      )}
      <p className="form-note">
        By submitting, you agree to be contacted by Gurudev Motors about this
        request.
      </p>
      <button
        className="button button-primary button-wide"
        disabled={submitting}
      >
        {submitting ? 'Sending request...' : buttonLabel}
        <ArrowRight size={17} />
      </button>
    </form>
  );
}
