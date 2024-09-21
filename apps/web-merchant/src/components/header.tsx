import React from "react";
import { Button, Layout, Menu } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { logout } from "../redux/features/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";

const Header: React.FC = () => {
  const { Header } = Layout;
  enum HeaderTitles {
    Home = "Home",
  }

  const items = [{ label: HeaderTitles.Home, key: HeaderTitles.Home }];

  const navigateToScreen = (key: string) => {
    console.log(key);
    if (key == HeaderTitles.Home) {
      navigate("/");
    }
  };

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  const dispatch = useDispatch();

  const submitLogout = () => {
    dispatch(logout());
    console.log(isAuthenticated);
  };

  const navigate = useNavigate();

  return (
    <Header className="fixed top-0 z-10 flex w-full items-center bg-gray-100">
      <Menu
        mode="horizontal"
        defaultSelectedKeys={["2"]}
        items={items}
        style={{ flex: 1, minWidth: 0, backgroundColor: "#F5F5F5" }}
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
