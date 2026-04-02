import { Injectable } from '@nestjs/common';
import { CurrentUser } from './current-user.interface';

@Injectable()
export class TenantContextService {
  private currentUser: CurrentUser | null = null;

  setCurrentUser(currentUser: CurrentUser): void {
    this.currentUser = currentUser;
  }

  clear(): void {
    this.currentUser = null;
  }

  getCurrentUser(): CurrentUser | null {
    return this.currentUser;
  }

  getTenantId(): string | null {
    return this.currentUser?.tenantId ?? null;
  }
}
