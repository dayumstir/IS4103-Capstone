// All APIs related to instalment plan

import { IInstalmentPlan } from "../interfaces/instalmentPlanInterface";

export const fetchInstalmentPlanList = async () => {
  const response = await fetch("http://localhost:3000/instalmentPlan");
  return response.json();
};

export const createInstalmentPlan = async (instalmentPlan: IInstalmentPlan) => {
  const response = await fetch("http://localhost:3000/instalmentPlan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
};
