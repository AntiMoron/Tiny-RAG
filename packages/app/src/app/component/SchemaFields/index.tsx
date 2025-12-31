import React from "react";
import cx from "classnames";
import { Input } from "antd";
import * as _ from "lodash";

const TextArea = Input.TextArea;

const compMap = {
  Input,
  TextArea,
};

export interface SchemaField {
  name: string[];
  type: string;
  label?: string;
  props: any;
}

export interface SchemaFieldsProps {
  className?: string;
  style?: React.CSSProperties;
  schemas?: SchemaField[];
  onChange?: (values: any) => void;
  value?: any;
}

export default function SchemaFields(props: SchemaFieldsProps) {
  const { className, style, schemas, onChange, value } = props;
  console.log(value);
  return (
    <div className={className} style={style}>
      {schemas?.map((schema) => {
        const k = schema.name.join(".");
        const C = compMap[schema.type];
        if (!C) {
          return (
            <div key={k}>
              Unsupported component type: <b>{schema.type}</b>
            </div>
          );
        }
        return (
          <div key={k} style={{ marginBottom: 24 }}>
            <div style={{
              marginBottom: 8,
              fontSize: '14px',
              color: '#2c3e50',
              fontWeight: 500
            }}>{schema.label ?? schema.name}</div>
            <C
              {...schema.props}
              value={_.get(value, schema.name)}
              onChange={(e) => {
                const v = { ...value };
                let inputValue: any;
                if (typeof e === "string") {
                  inputValue = e;
                } else {
                  inputValue = e?.target.value || e?.value || e;
                }
                onChange?.(_.set(v, schema.name, inputValue));
              }}
              style={{
                borderRadius: '8px',
                borderColor: '#e0e0e0',
                transition: 'border-color 0.2s'
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
