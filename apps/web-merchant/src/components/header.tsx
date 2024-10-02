import React from "react";
import { Button, Layout, Menu, message } from "antd";
import { useNavigate } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
import { useLogoutMutation } from "../redux/services/auth";

const Header: React.FC = () => {
  const jwt_token = localStorage.getItem("token");
  const isAuthenticated = !!jwt_token;

  const { Header } = Layout;
  enum HeaderTitles {
    Home = "Home",
    BusinessManagement = "Business Management",
  }

  const items = [
    { label: HeaderTitles.Home, key: HeaderTitles.Home },
    {
      label: HeaderTitles.BusinessManagement,
      key: HeaderTitles.BusinessManagement,
    },
  ];

  const navigateToScreen = (key: string) => {
    if (key == HeaderTitles.Home) {
      navigate("/");
    } else if (key == HeaderTitles.BusinessManagement) {
      navigate("/business-management/issues");
    }
  };

  const [logoutMutation] = useLogoutMutation();

  const submitLogout = () => {
    logoutMutation()
      .unwrap()
      .then(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("merchantId");
        message.success("Logout Successful!");
      })
      .catch((error) => message.error(error));
    navigate("/login");
  };

  const navigate = useNavigate();

  return (
    <Header className="fixed top-0 z-10 flex w-full items-center bg-gray-100 shadow-sm">
      <Menu
        mode="horizontal"
        defaultSelectedKeys={["2"]}
        items={items}
        style={{ flex: 1, backgroundColor: "#F5F5F5", border: "none" }}
        onClick={(menuInfo) => navigateToScreen(menuInfo.key)}
      />
      {isAuthenticated ? (
        <div>
          <Button onClick={() => submitLogout()} className="m-10">
            Logout
          </Button>
          <UserOutlined onClick={() => navigate("/profile")} />
        </div>
      ) : (
        <Button onClick={() => navigate("/login")}>Login</Button>
      )}
    </Header>
  );
};

export default Header;
