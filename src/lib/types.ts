export interface EmployeeWithSteps {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  startDate: string;
  token: string;
  createdAt: string;
  steps: {
    stepNumber: number;
    status: string;
    data: string | null;
    completedAt: string | null;
  }[];
  ppeOrder: {
    shoeSize: string;
    coverallSize: string;
    tshirtSize: string;
    emailSent: boolean;
  } | null;
}
