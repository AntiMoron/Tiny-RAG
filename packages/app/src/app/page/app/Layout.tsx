import React from "react";
import { Outlet, useNavigation } from "react-router";
import { Breadcrumb, Flex, Layout, Menu, MenuProps, theme } from "antd";
import useMemuData from "./menuData";
import { useNavigate } from "react-router";
import { ItemType, MenuItemType } from "antd/es/menu/interface";

const { Header, Footer, Sider, Content } = Layout;

// https://flatuicolors.com/

const headerStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#fff",
  height: 64,
  paddingInline: 48,
  lineHeight: "64px",
};

const footerStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#fff",
  backgroundColor: "#3498db",
};

const layoutStyle = {
  borderRadius: 0,
  overflow: "hidden",
  width: "100%",
  maxWidth: "100%",
  minHeight: "100vh",
};

export default function PageLayout() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const navigate = useNavigate();
  const menuData = useMemuData({
    onClick: (item: ItemType<MenuItemType>) => {
      if (!item) {
        return;
      }
      navigate(`${item.key}`);
    },
  });
  return (
    <div>
      <Flex gap="middle" wrap>
        <Layout style={layoutStyle}>
          <Header style={headerStyle}>Header</Header>
          <Layout
            style={{
              padding: "24px 0",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Sider style={{ background: colorBgContainer }} width={200}>
              <Menu mode="inline" style={{ height: "100%" }} items={menuData} />
            </Sider>
            <div style={{ padding: "0 48px", width: "100%" }}>
              <Breadcrumb
                style={{ margin: "16px 0" }}
                items={[{ title: "Home" }, { title: "List" }, { title: "App" }]}
              />
              <Content style={{ minHeight: 280, width: "100%" }}>
                <Outlet />
              </Content>
            </div>
          </Layout>
          <Footer style={footerStyle}>Footer</Footer>
        </Layout>
      </Flex>
    </div>
  );
}
