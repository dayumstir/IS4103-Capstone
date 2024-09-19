import React from "react";
import { Button, Layout, Menu } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { logout } from "../redux/features/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

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
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 1, // Keep it above content
      }}
    >
      <Menu
        mode="horizontal"
        defaultSelectedKeys={["2"]}
        items={items}
        style={{ flex: 1, minWidth: 0, backgroundColor: "#F5F5F5" }}
        onClick={(menuInfo) => navigateToScreen(menuInfo.key)}
      />
      {isAuthenticated ? (
        <Button onClick={() => submitLogout()}>Logout</Button>
      ) : (
        <Button onClick={() => navigate("/login")}>Login</Button>
      )}
    </Header>
  );
};

export default Header;
