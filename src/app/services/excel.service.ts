import { Injectable } from '@angular/core';
import { Employee, ValidationError } from '../models/Employee.interface';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  readFile(file: File): Observable<any> {
    return from(new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const text = e.target.result;
          const employees = this.parseCSV(text);
          const errors = this.validateStructure(employees);
          resolve({ employees, errors});
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsText(file);
    }));
  }


  private parseCSV(csvData: string): Employee[] {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(header => header.trim().toLowerCase());

    const employees = lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',');
        const employee: any = {};

        headers.forEach((header, index) => {
          employee[header] = values[index]?.trim() || '';
        });

        return employee as Employee;
      });

    return employees;
  }

  validateStructure(employees: Employee[]): ValidationError[] {
    const emailToRoleMap: Record<string, string> = {};
    const emailToReports: Record<string, string[]> = {};
    const errors: ValidationError[] = [];
  
    employees.forEach((employee) => {
      emailToRoleMap[employee.email] = employee.role;
      if (!emailToReports[employee.reportsto]) {
        emailToReports[employee.reportsto] = [];
      }
      emailToReports[employee.reportsto].push(employee.email);
    });
  
    // RBAC validations
    employees.forEach((employee) => {
      // Root validation
      if (employee.role === 'Root') {
        if (employee.reportsto !== '') {
          errors.push({
            row: employee,
            error: `Root ${employee.fullname} must not report to anyone`
          });
        }
      }
  
      // Admin validation
      if (employee.role === 'Admin') {
        if (employee.reportsto !== '' && emailToRoleMap[employee.reportsto] !== 'Root') {
          errors.push({
            row: employee,
            error: `Admin ${employee.fullname} must report to Root only`
          });
        }
      }
  
      // Manager validation
      if (employee.role === 'Manager') {
        if (employee.reportsto !== '' && emailToRoleMap[employee.reportsto] !== 'Admin' && emailToRoleMap[employee.reportsto] !== 'Manager') {
          errors.push({
            row: employee,
            error: `Manager ${employee.fullname} must report to Admin or another Manager only`
          });
        }
      }
  
      // Caller validation
      if (employee.role === 'Caller') {
        if (employee.reportsto !== '' && emailToRoleMap[employee.reportsto] !== 'Manager') {
          errors.push({
            row: employee,
            error: `Caller ${employee.fullname} must report to Manager only`
          });
        }
      }
  
      // Single parent validation
      if (employee.reportsto !== '' && emailToReports[employee.reportsto].length > 1) {
        errors.push({
          row: employee,
          error: `User ${employee.fullname} cannot have multiple parents`
        });
      }
    });
  
    return errors;
  }
  
}