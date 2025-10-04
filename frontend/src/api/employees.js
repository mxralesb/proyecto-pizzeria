// src/api/employee.js
import api from "./requests";

export const fetchEmployeeRoles = () => api.get("/employees/roles");
export const createEmployee = (payload) => api.post("/employees", payload);
