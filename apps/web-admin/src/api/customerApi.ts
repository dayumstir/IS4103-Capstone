import { ICustomer } from '../interfaces/customerInterface';


export const fetchAllCustomers = async () => {
    const response = await fetch("http://localhost:3000/admin/allCustomers");
    return response.json();
  };
  

  export const updateCustomer = async (customer_id: string, newStatus: string) => {
    const response = await fetch(
      `http://localhost:3000/admin/customer/${customer_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customer_id, status: newStatus }),
      },
    );
    return response.json();
  };
