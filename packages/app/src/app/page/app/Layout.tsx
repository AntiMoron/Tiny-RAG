import React from "react";
import { Outlet, useNavigation } from "react-router";
import { Breadcrumb, Button, Flex, Layout, Menu, MenuProps, theme } from "antd";
import useMemuData from "./menuData";
import { useNavigate } from "react-router";
import { ItemType, MenuItemType } from "antd/es/menu/interface";
import { GithubFilled } from "@ant-design/icons";

const { Header, Footer, Sider, Content } = Layout;

// https://flatuicolors.com/

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  color: "#333",
  height: 64,
  paddingInline: 24,
  background: "#ffffff",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
  zIndex: 1,
};

const footerStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#b0b0b0",
  backgroundColor: "#2c3e50",
  padding: "16px 0",
  fontSize: "14px",
};

const layoutStyle = {
  borderRadius: 0,
  overflow: "hidden",
  width: "100%",
  maxWidth: "100%",
  minHeight: "100vh",
  backgroundColor: "#ffffff",
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
      navigate(`/app/${item.key}`);
    },
  });
  return (
    <div>
      <Flex gap="middle" wrap>
        <Layout style={layoutStyle}>
          <Header style={headerStyle}>
            <Flex>
              <div style={{ flex: 1, textAlign: "left", fontSize: "18px", fontWeight: 600 }}>Tiny RAG</div>
              <a href="https://github.com/AntiMoron/Tiny-RAG">
                <Button
                  style={{ color: "black" }}
                  icon={<GithubFilled />}
                  type="link"
                ></Button>
                <span style={{ color: "#2b2b2b" }}>Star</span>
              </a>
            </Flex>
          </Header>
          <Layout
            style={{
              padding: "24px 0",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Sider
              style={{
                background: "#f9f9f9",
                borderRight: "1px solid #f0f0f0",
              }}
              width={220}
            >
              <Menu mode="inline" style={{ height: "100%" }} items={menuData} />
            </Sider>
            <div style={{ padding: "24px", width: "100%", backgroundColor: "#ffffff" }}>
              <Breadcrumb
                style={{ margin: "16px 0" }}
                items={[{ title: "Home" }, { title: "List" }, { title: "App" }]}
              />
              <Content style={{
                minHeight: 280,
                width: "100%",
                background: "#fff",
                borderRadius: "8px",
                padding: "24px",
                boxShadow: "0 1px 4px rgba(0, 0, 0, 0.05)"
              }}>
                <Outlet />
              </Content>
            </div>
          </Layout>
          <Footer style={footerStyle}>
            TinyRAG ©2025 Created by Antimoron with ❤
            <a href="https://github.com/AntiMoron/Tiny-RAG">
              <Button
                style={{ color: "black" }}
                icon={<GithubFilled />}
                type="link"
              ></Button>
              <span style={{ color: "white" }}>Star</span>
            </a>
          </Footer>
        </Layout>
      </Flex>
    </div>
  );
}
