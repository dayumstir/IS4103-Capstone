// All APIs related to credit tier

import { ICreditTier } from "../interfaces/creditTierInterface";

export const fetchCreditTierList = async () => {
  const response = await fetch("http://localhost:3000/creditTier");
  return response.json();
};

export const createCreditTier = async (
  creditTier: Omit<ICreditTier, "credit_tier_id">,
) => {
  const response = await fetch("http://localhost:3000/creditTier", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(creditTier),
  });
  return response.json();
};

export const updateCreditTier = async (creditTier: ICreditTier) => {
  const response = await fetch(
    `http://localhost:3000/creditTier/${creditTier.credit_tier_id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(creditTier),
    },
  );
  return response.json();
};
