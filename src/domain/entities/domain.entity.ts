export enum DomainStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
}

export class Domain {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly name: string,
    public readonly zoneId: string,
    public readonly status: DomainStatus,
    public readonly workerRouteId?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  public isActive(): boolean {
    return this.status === DomainStatus.ACTIVE;
  }

  public canAnalyze(): boolean {
    return this.isActive() && !!this.workerRouteId;
  }

  public static create(props: {
    userId: number;
    name: string;
    zoneId: string;
    status: DomainStatus;
    workerRouteId?: string;
  }): Omit<Domain, 'id' | 'createdAt' | 'updatedAt'> {
    return new Domain(
      0, // Will be set by repository
      props.userId,
      props.name,
      props.zoneId,
      props.status,
      props.workerRouteId,
    );
  }
}