import { UnauthorizedException } from '@nestjs/common';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JwtServiceWrapper } from './jwt.service.js';

const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDAHPuWHucufQl8
xiADMBEIVBIaEaBk7qemZ3ak6EhdXAnSYXhjxUvsCwtx/Erjlu/LmLUFdEjlA8iE
0/pGnLooWOU/cqdjw+T//SOHP8vBByY+83eev7F6eysuR+6jeYum3ue32cKAmb37
cfMUOi8uBvvR959vGwX+5U1OjmMMFDeQr5PRLwUXa3sFLE4AURE+zRGsfsrJrirF
MWstoKCthXn2JtkAGekH3a3JKI90BGlZ4g2IdI2Em/D18jo3u3BOywL7H64sqmjT
JYSqgeLzRNidE9QhCK9x/7iALg2IUADGfh6rADQs+aWxWBJaEXiqwg1J4nDYDfaJ
WgI8XVsjAgMBAAECggEAN6ONN7aehMfAyirFVbcDj9JtZbBqMCEwW9DGO09sueEw
lQYWrGqVKPkv6OTFObHapDAHaVt6yxzz44hTCUVV4t6QEnadxRaUiZEiS4bt92sf
KAcyQz9IYu0uHdrGYgEPMZaILKZ8Huun6p1fZaHOTTnHj9F0EuUUMPTvFUvGotXt
k+N/QQvdgVVy5E8JpzsU1eZJFd/VTrxPJmxlOwnj+i2QPIrks/vHC3dkRoDnyGz2
KEQi5Et434zTJR+9UYv9OsA6T2v/khLrSIDdTPxAbGcUZvBZsLQeYGaVB2ac1bPK
rWDQ48jLZ828sJ4IoQgfrVtKQAcTDPM9Rfhlr7hOXQKBgQDlcgijrBKXgEbSRwRa
PiXPRzfDTraQwSyTWg8W6spLWVWYoIYScFDEUFysy1l0v/TuE4coQKq2F2WdvDvN
8a7dGgFu4lmA/WCmRsIP837+PljFAB/0VniQGPQYzNi8a7GYDMKbEITC45kWJUle
hgwQ6vg6ePOGiZvuWwmIYChMtQKBgQDWWOBya59KRUgBxT6lPLoaaksCobhLo+ht
vShqq+dHuct1wazDQkXt/OXqDqw3B4nJCnP3gMSxmb0VRWvboSjy9SkcHdB1+dZS
d9TeUUfqwrMboZUKqR+MOAkFjUNH5UOnNEYDjTAQnsWD1BIxQSwZIXH8CxEeWr39
ngrwX53HdwKBgQCtsSGxJXX9knIKhRBacGmW/EbOZyv1cQcZlTePFbaGS95saDiW
hMfflSZS+K2DoDz+bXIHmsyghB28xt5PDQJfBmzHUDqJV0ZvGWmXQbGFLhVtLKcE
BOHH09wVWh1Ipg4PGLnJQTv/fORKy3c7QyanN/kp6p4P3uRYEDqrLn/TcQKBgQCc
dCr/2YZfU8qHYE2llnnQph0yQpCexXj2AMfrdKZQOFFGFqPfshQQ7jNzcFpLoHj2
AWc8FQV9DNZzHETp/uxAyqnDGA/8zOufLlB2JaX0uUC6vmpnaaLZWl1bbAzcAYAs
H3+rP/cBaqKI4taUlRl3Dm6ApiNMoLdk02LwqRolaQKBgQCJ0FFVWze76yJ1y3vb
Nsgyrtpg7RfZd/4rflt7gw9cRVaqqSw0d7o4w9+dADfRGQA0RUvNOaD8BCoX9246
e6H8ptXrEGB9AdsoPw1zrdKFIp5nu17UCock9UGgAv90puq0Mcl2z5Szav70Vegs
y36g4osECkT9h49TIxVP1RayjA==
-----END PRIVATE KEY-----`;

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwBz7lh7nLn0JfMYgAzAR
CFQSGhGgZO6npmd2pOhIXVwJ0mF4Y8VL7AsLcfxK45bvy5i1BXRI5QPIhNP6Rpy6
KFjlP3KnY8Pk//0jhz/LwQcmPvN3nr+xensrLkfuo3mLpt7nt9nCgJm9+3HzFDov
Lgb70fefbxsF/uVNTo5jDBQ3kK+T0S8FF2t7BSxOAFERPs0RrH7Kya4qxTFrLaCg
rYV59ibZABnpB92tySiPdARpWeINiHSNhJvw9fI6N7twTssC+x+uLKpo0yWEqoHi
80TYnRPUIQivcf+4gC4NiFAAxn4eqwA0LPmlsVgSWhF4qsINSeJw2A32iVoCPF1b
IwIDAQAB
-----END PUBLIC KEY-----`;

const WRONG_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmQmiFwwIesvCzaWKo5fn
VTVfrwQiHaReFINW0VXvBkupekcJAb65rrqj35QIIUGED5CL4qfk5LzCkq9DnTAY
cRtOhRXyX+EtjhSjtXwPYNgQJD8Q8StOKolMhKnAa3vlEhgBCRZVcpg3VoCsEcch
pG37lnGL81DkGsiayQpnglMZOwiE5BKTXZXTCGdD/6PyQDHyS+zjWKZIEj2cR4Xo
P6W0iQOPPC8SOMa3heFsMF9AUmg97RP5eAB/wNQGqia0A+HJ0cQZ8fo7aMfD/OeF
QA8ACg8M5UfShYRyZtgoghTraxCWx1+KDwueRONb6s4bIFpzKwOpvdfdB0dmtHNV
TwIDAQAB
-----END PUBLIC KEY-----`;

function signToken(payload: Record<string, unknown>): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const jwt = require('jsonwebtoken');
  return jwt.sign(payload, PRIVATE_KEY, { algorithm: 'RS256', expiresIn: '1h' });
}

describe('JwtServiceWrapper', () => {
  let service: JwtServiceWrapper;
  const originalEnv = process.env;

  beforeEach(() => {
    service = new JwtServiceWrapper();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('debería lanzar 401 si no hay header de autorización', () => {
    expect(() => service.verifyBearerToken(undefined)).toThrow(UnauthorizedException);
    expect(() => service.verifyBearerToken(undefined)).toThrow('Missing or malformed Authorization header.');
  });

  it('debería lanzar 401 si el header no tiene prefijo Bearer', () => {
    expect(() => service.verifyBearerToken('Basic abc123')).toThrow(UnauthorizedException);
    expect(() => service.verifyBearerToken('Basic abc123')).toThrow('Missing or malformed Authorization header.');
  });

  it('debería lanzar 401 si el token es mock-token y ALLOW_MOCK_AUTH no es "true"', () => {
    delete process.env.ALLOW_MOCK_AUTH;
    expect(() => service.verifyBearerToken('Bearer mock-token')).toThrow(UnauthorizedException);
  });

  it('debería lanzar 401 si el token es mock-token y ALLOW_MOCK_AUTH es "false"', () => {
    process.env.ALLOW_MOCK_AUTH = 'false';
    expect(() => service.verifyBearerToken('Bearer mock-token')).toThrow(UnauthorizedException);
  });

  it('debería devolver contexto válido si el token es mock-token y ALLOW_MOCK_AUTH es "true"', () => {
    process.env.ALLOW_MOCK_AUTH = 'true';
    const context = service.verifyBearerToken('Bearer mock-token');
    expect(context.tenantId).toBe(1n);
    expect(context.userId).toBe('admin-dev-01');
    expect(context.role).toBe('tenant_admin');
  });

  it('debería lanzar 401 si JWT_PUBLIC_KEY no está configurado', () => {
    delete process.env.JWT_PUBLIC_KEY;
    const token = signToken({ sub: 'user-1', tenant_id: '1', role: 'operario' });
    expect(() => service.verifyBearerToken(`Bearer ${token}`)).toThrow(UnauthorizedException);
    expect(() => service.verifyBearerToken(`Bearer ${token}`)).toThrow('JWT_PUBLIC_KEY is not configured');
  });

  it('debería lanzar 401 si JWT_PUBLIC_KEY contiene REPLACE_ME', () => {
    process.env.JWT_PUBLIC_KEY = '-----BEGIN PUBLIC KEY-----\nREPLACE_ME\n-----END PUBLIC KEY-----';
    const token = signToken({ sub: 'user-1', tenant_id: '1', role: 'operario' });
    expect(() => service.verifyBearerToken(`Bearer ${token}`)).toThrow(UnauthorizedException);
  });

  it('debería lanzar 401 si el token tiene firma inválida (wrong key)', () => {
    process.env.JWT_PUBLIC_KEY = WRONG_PUBLIC_KEY;
    const token = signToken({ sub: 'user-1', tenant_id: '1', role: 'operario' });
    expect(() => service.verifyBearerToken(`Bearer ${token}`)).toThrow(UnauthorizedException);
    expect(() => service.verifyBearerToken(`Bearer ${token}`)).toThrow('Invalid cryptographic token signature.');
  });

  it('debería lanzar 401 si el token no tiene claim sub', () => {
    process.env.JWT_PUBLIC_KEY = PUBLIC_KEY;
    const token = signToken({ tenant_id: '1', role: 'operario' });
    expect(() => service.verifyBearerToken(`Bearer ${token}`)).toThrow(UnauthorizedException);
    expect(() => service.verifyBearerToken(`Bearer ${token}`)).toThrow('Token missing required Kavana claims.');
  });

  it('debería lanzar 401 si el token no tiene claim tenant_id', () => {
    process.env.JWT_PUBLIC_KEY = PUBLIC_KEY;
    const token = signToken({ sub: 'user-1', role: 'operario' });
    expect(() => service.verifyBearerToken(`Bearer ${token}`)).toThrow(UnauthorizedException);
  });

  it('debería lanzar 401 si el token no tiene claim role', () => {
    process.env.JWT_PUBLIC_KEY = PUBLIC_KEY;
    const token = signToken({ sub: 'user-1', tenant_id: '1' });
    expect(() => service.verifyBearerToken(`Bearer ${token}`)).toThrow(UnauthorizedException);
  });

  it('debería devolver contexto válido con claims estándar', () => {
    process.env.JWT_PUBLIC_KEY = PUBLIC_KEY;
    const token = signToken({ sub: 'user-42', tenant_id: '7', role: 'supervisor' });
    const context = service.verifyBearerToken(`Bearer ${token}`);
    expect(context.tenantId).toBe(7n);
    expect(context.userId).toBe('user-42');
    expect(context.role).toBe('supervisor');
  });

  it('debería soportar claims de estilo Cognito (custom:tenant_id, custom:role)', () => {
    process.env.JWT_PUBLIC_KEY = PUBLIC_KEY;
    const token = signToken({ sub: 'user-99', 'custom:tenant_id': '3', 'custom:role': 'operario' });
    const context = service.verifyBearerToken(`Bearer ${token}`);
    expect(context.tenantId).toBe(3n);
    expect(context.userId).toBe('user-99');
    expect(context.role).toBe('operario');
  });

  it('debería manejar errores inesperados como 401 genérico', () => {
    process.env.JWT_PUBLIC_KEY = PUBLIC_KEY;
    const token = 'not.a.real.jwt.token';
    expect(() => service.verifyBearerToken(`Bearer ${token}`)).toThrow(UnauthorizedException);
  });
});
