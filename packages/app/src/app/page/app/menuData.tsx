import { MenuProps } from "antd";
import React from "react";
import {
  RobotOutlined,
  DatabaseOutlined,
  NotificationOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { ItemType, MenuItemType } from "antd/es/menu/interface";

function useMemuData(props: {
  onClick?: (item: ItemType<MenuItemType>) => void;
}): ItemType<MenuItemType>[] {
  const { onClick } = props;

  const menuData: MenuProps["items"] = [
    {
      key: `aiprovider`,
      icon: React.createElement(RobotOutlined),
      label: `AI Provider`,
    },
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
  }) as ItemType<MenuItemType>[];
}

export default useMemuData;
