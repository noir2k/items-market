"use client";

import { useEffect, useState } from "react";

function FormField({ field }) {
  const className = `field${field.full ? " field--full" : ""}`;

  return (
    <label className={className}>
      <span>{field.label}</span>
      {field.type === "select" ? (
        <select defaultValue={field.options[0]}>
          {field.options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : null}
      {field.type === "text" ? <input placeholder={field.placeholder} type="text" /> : null}
      {field.type === "textarea" ? <textarea placeholder={field.placeholder} rows={7} /> : null}
    </label>
  );
}

export function MockForm({ title, fields, buttonLabel, type }) {
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (!toastVisible) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setToastVisible(false);
    }, 2200);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [toastVisible]);

  return (
    <>
      <form
        className="panel form-panel"
        onSubmit={(event) => {
          event.preventDefault();
          setToastVisible(true);
        }}
      >
        <div className="section-heading section-heading--compact">
          <div>
            <p className="eyebrow">FORM</p>
            <h2>{title}</h2>
          </div>
        </div>

        <div className="form-grid">
          {fields.map((field) => (
            <FormField field={field} key={`${type}-${field.label}`} />
          ))}
        </div>

        {type === "sell" ? (
          <div className="checkbox-row">
            <label>
              <input defaultChecked type="checkbox" /> 안전거래 절차 안내를 확인했습니다.
            </label>
            <label>
              <input defaultChecked type="checkbox" /> 등록 정보와 거래 조건을 정확히 입력했습니다.
            </label>
          </div>
        ) : null}

        <button className="button button--dark" type="submit">
          {buttonLabel}
        </button>
      </form>

      {toastVisible ? (
        <div className="toast">등록 요청이 접수되었습니다. 확인 후 거래소에서 확인하실 수 있습니다.</div>
      ) : null}
    </>
  );
}
