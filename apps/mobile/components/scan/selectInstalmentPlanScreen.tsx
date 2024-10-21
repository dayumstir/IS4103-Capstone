import { IInstalmentPlan } from "@repo/interfaces";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { formatCurrency } from "../../utils/formatCurrency";
import { Button } from "@ant-design/react-native";

export default function SelectInstalmentPlanScreen({
  instalmentPlans,
  price,
  selectedPlanId,
  setSelectedPlanId,
  onCancel,
  onConfirm,
}: {
  instalmentPlans: IInstalmentPlan[];
  price: number;
  selectedPlanId: string | null;
  setSelectedPlanId: (planId: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center gap-8 p-8">
      <View className="flex flex-col items-center justify-center gap-2">
        <Text className="text-lg font-semibold">Total Amount</Text>
        <Text className="text-4xl font-bold">{formatCurrency(price)}</Text>
      </View>

      <Text className="text-xl font-semibold">
        Which instalment plan would you like to use?
      </Text>

      {/* ===== Instalment Plans Radio Group ===== */}
      <ScrollView className="w-full">
        {instalmentPlans
          .filter(
            (plan) =>
              price >= plan.minimum_amount && price <= plan.maximum_amount, // purchase price is within the instalment plan's range
          )
          .map((plan) => {
            return (
              <TouchableOpacity
                className={`mb-4 flex-row items-center rounded-md border p-4 ${
                  selectedPlanId === plan.instalment_plan_id
                    ? "border-blue-500"
                    : "border-gray-300"
                }`}
                onPress={() => setSelectedPlanId(plan.instalment_plan_id)}
                key={plan.instalment_plan_id}
              >
                <View className="mr-4 h-6 w-6 items-center justify-center rounded-full border border-blue-500">
                  <View
                    className={`h-4 w-4 rounded-full ${selectedPlanId === plan.instalment_plan_id ? "bg-blue-500" : "bg-white"}`}
                  />
                </View>

                <View>
                  <Text className="text-lg font-semibold">{plan.name}</Text>
                  {/* ===== eg. 4 payments of $25 ===== */}
                  <Text className="text-sm text-gray-600">
                    {`${plan.number_of_instalments} payments of ${formatCurrency(
                      price / plan.number_of_instalments,
                    )} over ${plan.time_period} weeks`}
                  </Text>
                  {/* ===== eg. Once every 4.5 days ===== */}
                  <Text className="text-sm text-gray-600">
                    {`Once every ${((plan.time_period * 7) / plan.number_of_instalments).toFixed(1)} days`}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
      </ScrollView>

      {/* ===== Confirm & Cancel Buttons ===== */}
      <View className="flex w-full gap-4">
        <Button
          type="primary"
          onPress={() => {
            Alert.alert(
              "Confirm Instalment Plan",
              `Are you sure you want to proceed with the ${selectedPlanId ? instalmentPlans.find((plan) => plan.instalment_plan_id === selectedPlanId)?.name : ""} plan?\n\nTotal Amount: ${formatCurrency(price)}\nNumber of Payments: ${selectedPlanId ? instalmentPlans.find((plan) => plan.instalment_plan_id === selectedPlanId)?.number_of_instalments : ""}\nPayment Amount: ${selectedPlanId ? formatCurrency(price / (instalmentPlans.find((plan) => plan.instalment_plan_id === selectedPlanId)?.number_of_instalments || 1)) : ""}\nPayment Frequency: Every ${selectedPlanId ? (((instalmentPlans.find((plan) => plan.instalment_plan_id === selectedPlanId)?.time_period || 0) * 7) / (instalmentPlans.find((plan) => plan.instalment_plan_id === selectedPlanId)?.number_of_instalments || 1)).toFixed(1) : ""} days`,
              [
                {
                  text: "Cancel",
                },
                {
                  text: "Confirm",
                  onPress: onConfirm,
                },
              ],
            );
          }}
          disabled={!selectedPlanId}
        >
          <Text className="font-semibold text-white">Confirm</Text>
        </Button>

        <Button type="ghost" onPress={onCancel}>
          <Text className="font-semibold text-blue-500">Cancel</Text>
        </Button>
      </View>
    </View>
  );
}
