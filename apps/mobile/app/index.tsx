// Main entry point of application

import { Redirect } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export default function Index() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.customerAuth.isAuthenticated,
  );

  if (isAuthenticated) {
    return <Redirect href="/home" />;
  } else {
    return <Redirect href="/login" />;
  }
}
