import { DeleteOutlined, FundOutlined } from "@ant-design/icons";
import { Button, Flex, Modal } from "antd";
import axios from "../../../util/service";
import React, { Fragment, useState } from "react";
import { Knowledge } from "tinyrag-types/knowledge";
import KnowledgeDisplay from "../KnowledgeDisplay";

export interface DatasetKnowledgeRowActionProps {
  record: Knowledge;
  onDelete?: (id: string) => void;
}

export default function DatasetKnowledgeRowAction(
  props: DatasetKnowledgeRowActionProps
) {
  const [show, setShow] = useState(false);
  const { record, onDelete } = props;
  return (
    <Fragment>
      <Flex>
        <Button
          type="link"
          icon={<FundOutlined />}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShow(true);
          }}
        ></Button>
        <Button
          type="link"
          icon={<DeleteOutlined />}
          danger
          onClick={() => {
            Modal.confirm({
              title: "Confirm Deletion",
              content: "Are you sure you want to delete this item?",
              onOk: async () => {
                await axios.delete(`/api/knowledge/delete/${record.id}`);
                onDelete?.(record.id);
              },
            });
          }}
        ></Button>
      </Flex>
      <Modal
        width="80vw"
        open={show}
        cancelButtonProps={{ hidden: true }}
        onCancel={() => setShow(false)}
        onOk={() => setShow(false)}
      >
        <KnowledgeDisplay>{record.content}</KnowledgeDisplay>
      </Modal>
    </Fragment>
  );
}
