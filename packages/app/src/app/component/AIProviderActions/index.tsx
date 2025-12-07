import React, { useState } from "react";
import { Flex, Button, message, Modal } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { AIProvider } from "tinyrag-types/aiprovider";
import AIProviderConfigForm from "../AIProviderConfigForm";

export interface AIProviderActionsProps {
  className?: string;
  style?: React.CSSProperties;
  record: AIProvider;
  onPassTest?: (id: string) => void;
  onUpdate?: (id: string, values: AIProvider) => void;
  onDelete?: (id: string) => void;
}

export default function AIProviderActions(props: AIProviderActionsProps) {
  const { record, onDelete, onUpdate, onPassTest } = props;
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editConfirming, setEditConfirming] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <Flex gap="small">
      <Button
        type="link"
        loading={testing}
        disabled={testing}
        icon={<ExperimentOutlined />}
        onClick={() => {
          setTesting(true);
          axios
            .get("/api/aiprovider/test/" + record.id)
            .then((res) => {
              message.success("OK");
              onPassTest?.(record.id);
            })
            .catch((err) => {
              message.error(err.response?.data?.message || err.message);
            })
            .finally(() => {
              setTesting(false);
            });
        }}
      ></Button>
      <Button
        type="link"
        loading={editConfirming}
        disabled={editConfirming}
        icon={<EditOutlined />}
        onClick={() => {
          setOpen(true);
        }}
      ></Button>
      <Button
        type="link"
        icon={<DeleteOutlined />}
        danger
        loading={deleting}
        onClick={() => {
          Modal.confirm({
            type: "warning",
            title: "Double check.",
            onOk: () => {
              setDeleting(true);
              axios
                .delete("/api/aiprovider/delete/" + record.id)
                .then((res) => {
                  onDelete?.(record.id);
                })
                .finally(() => {
                  setDeleting(false);
                });
            },
          });
        }}
      ></Button>
      <Modal
        open={open}
        onCancel={() => {
          setOpen(false);
        }}
        footer={null}
        destroyOnHidden
      >
        <AIProviderConfigForm
          data={record}
          loading={editConfirming}
          onFinish={(values) => {
            setEditConfirming(true);
            axios
              .post("/api/aiprovider/update/", values)
              .then(() => {
                message.success("Updated successfully");
                setOpen(false);
                onUpdate?.(record.id, values);
              })
              .finally(() => {
                setEditConfirming(false);
              });
          }}
        />
      </Modal>
    </Flex>
  );
}
