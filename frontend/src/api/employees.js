import client from "./client"; 

export const fetchEmployeeRoles = () => client.get("/employees/roles");
export const createEmployee = (payload) => client.post("/employees", payload);

