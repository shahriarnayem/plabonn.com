"use client";

import { createAuthClient } from "better-auth/react";

// Keep browser authentication same-origin. This prevents localhost/127.0.0.1
// or deployment-domain mismatches from sending cookies to the wrong host.
export const authClient = createAuthClient();
