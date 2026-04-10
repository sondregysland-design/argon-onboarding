export interface CourseInfo {
  kursnavn: string;
  gyldigFra: string;
  gyldigTil: string;
}

export interface EmployeeCardData {
  id: string;
  name: string;
  email: string;
  startDate: string;
  completed: number;
  hasProfileImage: boolean;
  initials: string;
  stilling: string | null;
  kurs: CourseInfo[];
  hasCvData: boolean;
  archived: boolean;
}
