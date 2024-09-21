// Defines the structure of a instalment plan object

export interface IInstalmentPlan {
    instalment_plan_id: string;
    name: string;
    description: string;
    frequency: string; // TODO: Change to enum?
    interest_rate: number;
    minimum_amount: number;
    maximum_amount: number;
    status: string; // TODO: Change to enum
}
