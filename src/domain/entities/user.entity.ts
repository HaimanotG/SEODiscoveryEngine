export class User {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly name: string,
    public readonly encryptedCredentials?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  public isConnectedToCloudflare(): boolean {
    return !!this.encryptedCredentials;
  }

  public static create(props: {
    email: string;
    name: string;
    encryptedCredentials?: string;
  }): Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
    return new User(
      0, // Will be set by repository
      props.email,
      props.name,
      props.encryptedCredentials,
    );
  }
}