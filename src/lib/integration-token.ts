import jwt, { Algorithm } from "jsonwebtoken";
import type { AuthCustomer } from "./auth";
import { jwtVerify } from "jose";
import { NextRequest } from "next/server";

// Your workspace credentials from Integration.app settings page
const WORKSPACE_KEY = process.env.INTEGRATION_APP_WORKSPACE_KEY;
const WORKSPACE_SECRET = process.env.INTEGRATION_APP_WORKSPACE_SECRET;

interface TokenData {
  id: string;
  name: string;
}

export class IntegrationTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IntegrationTokenError";
  }
}

export async function generateIntegrationToken(
  auth: AuthCustomer
): Promise<string> {
  if (!WORKSPACE_KEY || !WORKSPACE_SECRET) {
    throw new IntegrationTokenError(
      "Integration.app credentials not configured"
    );
  }

  try {
    const tokenData: TokenData = {
      // Required: Identifier of your customer
      id: auth.customerId,
      // Required: Human-readable customer name
      name: auth.customerName || auth.customerId,
    };

    const options = {
      issuer: WORKSPACE_KEY,
      expiresIn: 7200, // 2 hours
      algorithm: "HS512" as Algorithm,
    };

    return jwt.sign(tokenData, WORKSPACE_SECRET, options);
  } catch (error) {
    console.error("Error generating integration token:", error);
    throw new IntegrationTokenError("Failed to generate integration token");
  }
}

export async function verifyIntegrationAppToken(request: NextRequest) {
  const INTEGRATION_APP_TOKEN_HEADER = "x-integration-app-token";
  const token = request.headers.get(INTEGRATION_APP_TOKEN_HEADER);

  if (!token) {
    return null;
  }

  try {
    const encoder = new TextEncoder();
    const { payload } = await jwtVerify(
      token,
      encoder.encode(WORKSPACE_SECRET)
    );

    return {
      workspaceKey: payload.iss,
      customerId: payload.sub,
    };
  } catch (error) {
    console.error("Failed to verify integration.app token:", error);
    return null;
  }
}
