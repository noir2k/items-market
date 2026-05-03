import type { ReactNode } from "react";
import Link from "next/link";

interface HelperMessageProps {
  error?: string;
  message?: string;
}

interface AuthField {
  autoComplete?: string;
  defaultValue?: string;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type: string;
}

interface AuthLink {
  href: string;
  label: ReactNode;
}

interface HiddenField {
  name: string;
  value: string;
}

interface AuthCardProps {
  action: (formData: FormData) => void | Promise<void>;
  description: string;
  error?: string;
  fields: AuthField[];
  footerLinks: AuthLink[];
  hiddenFields?: HiddenField[];
  message?: string;
  submitLabel: string;
  title: string;
}

function HelperMessage({ error, message }: HelperMessageProps) {
  if (error) {
    return <div className="auth-alert auth-alert--error">{error}</div>;
  }

  if (message) {
    return <div className="auth-alert auth-alert--success">{message}</div>;
  }

  return null;
}

export function AuthCard({
  action,
  description,
  error,
  fields,
  footerLinks,
  hiddenFields = [],
  message,
  submitLabel,
  title
}: AuthCardProps) {
  return (
    <div className="auth-card panel">
      <div className="section-heading section-heading--compact">
        <div>
          <p className="eyebrow">ACCOUNT</p>
          <h2>{title}</h2>
        </div>
      </div>

      <p className="auth-copy">{description}</p>
      <HelperMessage error={error} message={message} />

      <form action={action} className="auth-form">
        {hiddenFields.map((field) => (
          <input key={field.name} name={field.name} type="hidden" value={field.value} />
        ))}

        {fields.map((field) => (
          <label className="field" key={field.name}>
            <span>{field.label}</span>
            <input
              autoComplete={field.autoComplete}
              defaultValue={field.defaultValue}
              name={field.name}
              placeholder={field.placeholder}
              required={field.required ?? true}
              type={field.type}
            />
          </label>
        ))}

        <button className="button button--dark button--full" type="submit">
          {submitLabel}
        </button>
      </form>

      {footerLinks.length > 0 ? (
        <div className="auth-links">
          {footerLinks.map((link) => (
            <Link className="text-link" href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
