import { jwtVerify, SignJWT } from 'jose';
import { injectable } from 'inversify';
import { JWTPayload } from 'jose';

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
}

@injectable()
export class JwtTokenService {
  private readonly jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  }

  public async generateToken(userId: string, email: string): Promise<string> {
    const secret = new TextEncoder().encode(this.jwtSecret);

    return new SignJWT({ userId, email } as TokenPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);
  }

  public async verifyToken(token: string): Promise<TokenPayload | null> {
    try {
      const secret = new TextEncoder().encode(this.jwtSecret);
      const verified = await jwtVerify(token, secret);
      return verified.payload as TokenPayload;
    } catch {
      return null;
    }
  }
}
