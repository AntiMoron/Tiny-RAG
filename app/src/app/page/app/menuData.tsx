import { MenuProps } from "antd";
import React from "react";
import {
  DatabaseOutlined,
  NotificationOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { ItemType, MenuItemType } from "antd/es/menu/interface";

function useMemuData(props: {
  onClick?: (item: ItemType<MenuItemType>) => void;
}): MenuItemType[] {
  const { onClick } = props;

  const menuData: MenuProps["items"] = [
    {
      key: `dataset`,
      icon: React.createElement(DatabaseOutlined),
      label: `Dataset`,
    },
    {
      key: `user`,
      icon: React.createElement(UserOutlined),
      label: `User`,
    },
  ];
  return menuData.map((item) => {
    return {
      ...item,
      onClick: onClick?.(item),
    };
  });
}

export default useMemuData;
