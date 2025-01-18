export interface Employee {
    email: string;
    fullname: string;
    role: 'Root' | 'Admin' | 'Manager' | 'Caller';
    reportsto: string;
}

export interface ValidationError {
    row: Employee;
    error: string;
    showDetails?: boolean;
}