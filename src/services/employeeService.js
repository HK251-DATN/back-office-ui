import { employees } from "../mocks/employees"

export const getEmployees = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(employees)
    }, 500)
  })
}