import { Redirect, router, Stack } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { setPaymentStage } from "../../redux/features/paymentStageSlice";

export default function AuthenticatedLayout() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.customerAuth.isAuthenticated,
  );

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const paymentStage = useSelector(
    (state: RootState) => state.paymentStage.paymentStage,
  );
  const dispatch = useDispatch();

  const handleScanModalClose = () => {
    dispatch(setPaymentStage("Scan QR Code"));
  };

  return (
    <Stack>
      <Stack.Screen
        name="scan"
        options={{
          headerTitle: paymentStage,
          presentation: "modal",
          headerLeft: () => (
            <AntDesign
              name="close"
              size={24}
              onPress={() => {
                router.back();
                handleScanModalClose();
              }}
              className="ml-2"
            />
          ),
        }}
        listeners={{
          transitionEnd: (e) => {
            if (e.data.closing) {
              handleScanModalClose();
            }
          },
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false, title: "Back" }}
      />
      <Stack.Screen 
        name="notifications" 
        options={{ headerTitle: "Notifications" }}
      />
    </Stack>
  );
}
